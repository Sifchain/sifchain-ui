import BigNumber from "bignumber.js";
import { Asset, IAsset } from "./Asset";
import { AssetAmount, IAssetAmount } from "./AssetAmount";
import { Pair } from "./Pair";
import {
  calculatePoolUnits,
  calculatePriceImpact,
  calculateReverseSwapResult,
  calculateSwapResult,
  calculateSwapFee,
} from "./formulae";
import { Amount, IAmount } from "./Amount";
import { SwapFeeTokenParams } from "generated/proto/sifnode/clp/v1/params";

export type IPool = Omit<Pool, "poolUnits" | "calculatePoolUnits">;

const NATIVE_ASSET_DENOM = "rowan";

export function getNormalizedSwapPrice(swapAsset: IAsset, pool: IPool) {
  if (!pool.swapPrices) {
    throw new Error("Pool is missing 'swapPrices'");
  }
  const otherAsset = pool.otherAsset(swapAsset);
  const decimalsDelta = swapAsset.decimals - otherAsset.decimals;
  const decimalAdjust = Math.pow(10, Math.abs(decimalsDelta));

  return swapAsset.symbol === NATIVE_ASSET_DENOM
    ? pool.swapPrices.native.divide(decimalAdjust)
    : pool.swapPrices.external.multiply(decimalAdjust);
}

export function calculateSwapResultPmtp(
  inputAmount: IAssetAmount,
  pool: IPool,
): IAmount {
  if (!pool.swapPrices) {
    throw new Error("Pool.swapPrices is required for PMTP swaps");
  }

  const swapPrice = getNormalizedSwapPrice(inputAmount.asset, pool);

  return inputAmount.multiply(swapPrice);
}

export type SwapPrices = {
  native: IAmount;
  external: IAmount;
};

export class Pool extends Pair {
  poolUnits: IAmount;
  swapPrices?: SwapPrices;
  swapFeeRate?: IAmount;
  swapFeeTokens?: SwapFeeTokenParams[];
  /**
   * clp.getPmtpParams pmtp_current_running_rate
   */
  currentRatioShiftingRate?: IAmount;

  nativeLiabilities?: IAssetAmount;
  externalLiabilities?: IAssetAmount;

  nativeCustody?: IAssetAmount;
  externalCustody?: IAssetAmount;

  constructor(
    a: IAssetAmount,
    b: IAssetAmount,
    params?: {
      poolUnits?: IAmount;
      swapPrices?: SwapPrices;
      /**
       * clp.getSwapFeeRate pmtp_current_running_rate
       */
      swapFeeRate?: IAmount;
      swapFeeTokens?: SwapFeeTokenParams[];
      /**
       * clp.getPmtpParams pmtp_current_running_rate
       */
      currentRatioShiftingRate?: IAmount;

      nativeLiabilities?: IAssetAmount;
      externalLiabilities?: IAssetAmount;

      nativeCustody?: IAssetAmount;
      externalCustody?: IAssetAmount;

      /**
       * Whether the pools is enabled for margin trading
       */
      isMarginEnabled?: boolean;
    },
  ) {
    super(a, b);
    this.swapPrices = params?.swapPrices;
    this.swapFeeRate = params?.swapFeeRate;
    this.swapFeeTokens = params?.swapFeeTokens;
    this.currentRatioShiftingRate = params?.currentRatioShiftingRate;

    this.nativeLiabilities = params?.nativeLiabilities;
    this.externalLiabilities = params?.externalLiabilities;

    this.nativeCustody = params?.nativeCustody;
    this.externalCustody = params?.externalCustody;

    this.poolUnits =
      params?.poolUnits ||
      calculatePoolUnits(
        Amount(a),
        Amount(b),
        Amount("0"),
        Amount("0"),
        Amount("0"),
      );
  }

  get nativeSwapPrice() {
    return this.swapPrices?.native;
  }

  get externalSwapPrice() {
    return this.swapPrices?.external;
  }

  get externalAmount() {
    return this.amounts.find((amount) => amount.symbol !== NATIVE_ASSET_DENOM)!;
  }

  get nativeAmount() {
    return this.amounts.find((amount) => amount.symbol === NATIVE_ASSET_DENOM)!;
  }

  calcProviderFee(x: IAssetAmount) {
    const X = this.amounts.find((a) => a.symbol === x.symbol);
    if (!X) {
      throw new Error(
        `Sent amount with symbol ${
          x.symbol
        } does not exist in this pair: ${this.toString()}`,
      );
    }
    const Y = this.amounts.find((a) => a.symbol !== x.symbol);
    if (!Y) throw new Error("Pool does not have an opposite asset."); // For Typescript's sake will probably never happen

    const toRowan = Y.symbol === NATIVE_ASSET_DENOM;
    const swapFromTokens = this.swapFeeTokens?.find(
      (i) => i.asset === x.symbol,
    )?.swapFeeRate;

    // @TODO: Line 152 is hardcoded rowan decimals, because right now we only have rowan
    //        We need a way to lookup the symbol
    const swapFeeRate = swapFromTokens
      ? Amount(Number(swapFromTokens) / 10 ** x.decimals)
      : this.swapFeeRate;

    const providerFee = calculateSwapFee(
      {
        inputAmount: x,
        inputBalanceInPool: X,
        outputBalanceInPool: Y,
        swapFeeRate: swapFeeRate ?? Amount("0"),
        currentRatioShiftingRate: this.currentRatioShiftingRate ?? Amount("0"),
      },
      toRowan,
    );
    return AssetAmount(this.otherAsset(x), providerFee);
  }

  calcPriceImpact(x: IAssetAmount) {
    const X = this.amounts.find((a) => a.symbol === x.symbol);
    if (!X) {
      throw new Error(
        `Sent amount with symbol ${
          x.symbol
        } does not exist in this pair: ${this.toString()}`,
      );
    }
    return calculatePriceImpact(x, X).multiply("100");
  }

  calcSwapResult(x: IAssetAmount) {
    const X = this.amounts.find((a) => a.symbol === x.symbol);

    if (!X) {
      throw new Error(
        `Sent amount with symbol ${
          x.symbol
        } does not exist in this pair: ${this.toString()}`,
      );
    }

    const Y = this.amounts.find((a) => a.symbol !== x.symbol);

    if (!Y) {
      throw new Error("Pool does not have an opposite asset."); // For Typescript's sake will probably never happen
    }

    const fromRowan = x.symbol === NATIVE_ASSET_DENOM;
    const toRowan = Y.symbol === NATIVE_ASSET_DENOM;

    const swapResult =
      (fromRowan || toRowan) && this.swapPrices
        ? calculateSwapResultPmtp(x, this)
        : calculateSwapResult(x, X, Y);

    return AssetAmount(this.otherAsset(x), swapResult);
  }

  calcReverseSwapResult(Sa: IAssetAmount): IAssetAmount {
    const Ya = this.amounts.find((a) => a.symbol === Sa.symbol);

    if (!Ya) {
      throw new Error(
        `Sent amount with symbol ${
          Sa.symbol
        } does not exist in this pair: ${this.toString()}`,
      );
    }

    const Xa = this.amounts.find((a) => a.symbol !== Sa.symbol);

    if (!Xa) {
      throw new Error("Pool does not have an opposite asset."); // For Typescript's sake will probably never happen
    }

    const otherAsset = this.otherAsset(Sa);

    if (Sa.equalTo("0")) {
      return AssetAmount(otherAsset, "0");
    }

    const fromRowan = Sa.symbol === NATIVE_ASSET_DENOM;
    const toRowan = Xa.symbol === NATIVE_ASSET_DENOM;

    const reverseSwapResult =
      (fromRowan || toRowan) && this.swapPrices
        ? calculateSwapResultPmtp(Sa, this)
        : calculateReverseSwapResult(Sa, Xa, Ya);

    return AssetAmount(otherAsset, reverseSwapResult);
  }

  calculatePoolUnits(
    nativeAssetAmount: IAssetAmount,
    externalAssetAmount: IAssetAmount,
  ) {
    const [nativeBalanceBefore, externalBalanceBefore] = this.amounts;

    // Calculate current units created by this potential liquidity provision
    const lpUnits = calculatePoolUnits(
      nativeAssetAmount,
      externalAssetAmount,
      nativeBalanceBefore,
      externalBalanceBefore,
      this.poolUnits,
    );
    const newTotalPoolUnits = lpUnits.add(this.poolUnits);

    return [newTotalPoolUnits, lpUnits];
  }
}

export function CompositePool(pair1: IPool, pair2: IPool): IPool {
  // The combined asset is the
  const pair1Assets = pair1.amounts.map((a) => a.symbol);
  const pair2Assets = pair2.amounts.map((a) => a.symbol);
  const nativeSymbol = pair1Assets.find((value) => pair2Assets.includes(value));

  if (!nativeSymbol) {
    throw new Error(
      "Cannot create composite pair because pairs do not share a common symbol",
    );
  }

  const amounts = [
    ...pair1.amounts.filter((a) => a.symbol !== nativeSymbol),
    ...pair2.amounts.filter((a) => a.symbol !== nativeSymbol),
  ];

  if (amounts.length !== 2) {
    throw new Error(
      "Cannot create composite pair because pairs do not share a common symbol",
    );
  }

  return {
    amounts: amounts as [external: IAssetAmount, native: IAssetAmount],

    get externalAmount() {
      return amounts[0];
    },

    get nativeAmount() {
      return amounts[1];
    },

    get nativeSwapPrice() {
      return pair1.nativeSwapPrice || pair2.nativeSwapPrice;
    },

    get externalSwapPrice() {
      return pair1.externalSwapPrice || pair2.externalSwapPrice;
    },

    getAmount: (asset: IAsset | string) => {
      if (Asset(asset).symbol === nativeSymbol) {
        throw new Error(`Asset ${nativeSymbol} doesnt exist in pair`);
      }

      // quicker to try catch than contains
      try {
        return pair1.getAmount(asset);
      } catch (err) {}

      return pair2.getAmount(asset);
    },

    otherAsset(asset: IAsset) {
      const otherAsset = amounts.find(
        (amount) => amount.symbol !== asset.symbol,
      );
      if (!otherAsset) {
        throw new Error("Asset doesnt exist in pair");
      }
      return otherAsset;
    },
    symbol() {
      return amounts
        .map((a) => a.symbol)
        .sort()
        .join("_");
    },
    contains(...assets: IAsset[]) {
      const local = amounts.map((a) => a.symbol).sort();
      const other = assets.map((a) => a.symbol).sort();
      return !!local.find((s) => other.includes(s));
    },
    calcProviderFee(x: IAssetAmount) {
      const [first, second] = pair1.contains(x)
        ? [pair1, pair2]
        : [pair2, pair1];
      const firstSwapFee = first.calcProviderFee(x);
      const firstSwapOutput = first.calcSwapResult(x);
      const secondSwapFee = second.calcProviderFee(firstSwapOutput);
      const firstSwapFeeInOutputAsset = second.calcSwapResult(firstSwapFee);

      return AssetAmount(
        second.otherAsset(firstSwapFee),
        firstSwapFeeInOutputAsset.add(secondSwapFee),
      );
    },
    calcPriceImpact(x: IAssetAmount) {
      const [first, second] = pair1.contains(x)
        ? [pair1, pair2]
        : [pair2, pair1];
      const firstPoolImpact = first.calcPriceImpact(x);
      const r = first.calcSwapResult(x);
      const secondPoolImpact = second.calcPriceImpact(r);

      return firstPoolImpact.add(secondPoolImpact);
    },
    calcSwapResult(x: IAssetAmount) {
      // TODO: possibly use a combined formula
      const [first, second] = pair1.contains(x)
        ? [pair1, pair2]
        : [pair2, pair1];

      const nativeAmount = first.calcSwapResult(x);

      return second.calcSwapResult(nativeAmount);
    },

    calcReverseSwapResult(S: IAssetAmount) {
      // TODO: possibly use a combined formula
      const [first, second] = pair1.contains(S)
        ? [pair1, pair2]
        : [pair2, pair1];

      const nativeAmount = first.calcReverseSwapResult(S);

      return second.calcReverseSwapResult(nativeAmount);
    },

    toString() {
      return amounts.map((a) => a.toString()).join(" | ");
    },
  };
}
