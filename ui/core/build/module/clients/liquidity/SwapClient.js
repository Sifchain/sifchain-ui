var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
import { AssetAmount, Amount, CompositePool } from "../../entities";
import { format } from "../../utils";
import { BaseLiquidityClient } from "./BaseLiquidityClient";
export const DEFAULT_SWAP_SLIPPAGE_PERCENT = 1.5;
export class SwapClient extends BaseLiquidityClient {
  findSwapFromToPool(params) {
    const isNativeAsset = (asset) => asset.symbol === "rowan";
    const fromPoolAsset = isNativeAsset(params.fromAsset)
      ? params.toAsset
      : params.fromAsset;
    const fromPool = params.pools.find(
      (p) => p.externalAmount.symbol === fromPoolAsset.symbol,
    );
    const toPool =
      isNativeAsset(params.fromAsset) || isNativeAsset(params.toAsset)
        ? fromPool
        : params.pools.find(
            (p) => p.externalAmount.symbol === params.toAsset.symbol,
          );
    return { fromPool, toPool };
  }
  /*
   * Return a quote about how a swap is estimated to go based on passed in pools.
   */
  createSwapQuote(params) {
    const slippageAmount = Amount(
      String(params.slippagePercent || DEFAULT_SWAP_SLIPPAGE_PERCENT),
    );
    const compositePool =
      params.fromPool === params.toPool
        ? params.fromPool
        : CompositePool(params.fromPool, params.toPool);
    let fromAmount =
      params.fromAmount || compositePool.calcReverseSwapResult(params.toAmount);
    let toAmount =
      params.toAmount || compositePool.calcSwapResult(params.fromAmount);
    const insufficientFromLiquidity = params.fromPool.amounts
      .find((a) => a.symbol === fromAmount.symbol)
      .lessThan(fromAmount);
    const insufficientToLiquidity = params.toPool.amounts
      .find((a) => a.symbol === toAmount.symbol)
      .lessThan(toAmount);
    const isZero = fromAmount.equalTo("0") || toAmount.equalTo("0");
    return {
      flags: {
        insufficientLiquidity: insufficientFromLiquidity
          ? "from"
          : insufficientToLiquidity
          ? "to"
          : false,
      },
      fromAmount,
      toAmount,
      fromToRatio: isZero
        ? "0"
        : format(fromAmount.divide(toAmount), { mantissa: 6 }),
      minimumReceived: AssetAmount(
        toAmount,
        Amount("1")
          .subtract(slippageAmount.divide(Amount("100")))
          .multiply(toAmount),
      ),
      priceImpact: isZero
        ? "0"
        : format(compositePool.calcPriceImpact(fromAmount), {
            mantissa: 6,
            trimMantissa: true,
          }),
      providerFee: isZero
        ? AssetAmount(this.nativeChain.nativeAsset, "0")
        : compositePool.calcProviderFee(fromAmount),
    };
  }
  prepareSwapTx(params) {
    return __awaiter(this, void 0, void 0, function* () {
      const client = yield this.getNativeDexClient();
      return client.tx.clp.Swap(
        {
          sentAsset: {
            symbol: (yield this.tokenRegistry.findAssetEntryOrThrow(
              params.fromAmount,
            )).denom,
          },
          receivedAsset: {
            symbol: (yield this.tokenRegistry.findAssetEntryOrThrow(
              params.toAsset,
            )).denom,
          },
          signer: params.address,
          sentAmount: params.fromAmount.toBigInt().toString(),
          minReceivingAmount: params.minimumReceived.toBigInt().toString(),
        },
        params.address,
      );
    });
  }
}
//# sourceMappingURL=SwapClient.js.map
