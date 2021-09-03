import { computed, Ref, ComputedRef } from "@vue/reactivity";
import ColorHash from "color-hash";
import {
  Asset,
  IAssetAmount,
  Network,
  toBaseUnits,
  TxHash,
  Amount,
} from "@sifchain/sdk";
import { format } from "@sifchain/sdk/src/utils/format";
import { useCore } from "@/hooks/useCore";

export function shortenHash(hash: string, startLength = 7, endLength = 7) {
  const start = hash.slice(0, startLength);
  const end = hash.slice(-endLength);
  return `${start}...${end}`;
}

export function formatSymbol(symbol: string) {
  if (symbol.indexOf("c") === 0) {
    return ["c", symbol.slice(1).toUpperCase()].join("");
  }
  return symbol.toUpperCase();
}

export function formatPercentage(amount: string) {
  return parseFloat(amount) < 0.01
    ? "< 0.01%"
    : `${parseFloat(amount).toFixed(2)}%`;
}
// TODO: make this work for AssetAmounts and Fractions / Amounts
export function formatNumber(displayNumber: string) {
  if (!displayNumber) return "0";
  const amount = parseFloat(displayNumber);
  if (amount < 100000) {
    return amount.toFixed(6);
  } else {
    return amount.toFixed(2);
  }
}

export function formatAssetAmount(value: IAssetAmount) {
  if (!value || value.equalTo("0")) return "0";
  const { amount, asset } = value;
  return amount.greaterThan(toBaseUnits("100000", asset))
    ? format(amount, asset, { mantissa: 2 })
    : format(amount, asset, { mantissa: 6 });
}

// TODO: These could be replaced with a look up table
export function getPeggedSymbol(symbol: string) {
  if (symbol.toLowerCase() === "erowan") return "ROWAN";
  return "c" + symbol.toUpperCase();
}
export function getUnpeggedSymbol(symbol: string) {
  if (symbol.toLowerCase() === "rowan") return "eROWAN";
  return symbol.indexOf("c") === 0 ? symbol.slice(1) : symbol;
}

export function getAssetLabel(t: Asset) {
  if (t.network === Network.SIFCHAIN) {
    return formatSymbol(t.displaySymbol || t.symbol);
  }

  if (
    t.network === Network.ETHEREUM &&
    t.displaySymbol.toLowerCase() === "erowan"
  ) {
    return "eROWAN";
  }

  return t.displaySymbol.toUpperCase();
}

export function useAssetItem(symbol: Ref<string | undefined>) {
  const token = computed(() =>
    symbol.value ? Asset.get(symbol.value) : undefined,
  );

  const tokenLabel = computed(() => {
    if (!token.value) return "";
    return getAssetLabel(token.value);
  });

  const backgroundStyle = computed(() => {
    if (!symbol.value) return "";

    const colorHash = new ColorHash();

    const color = symbol ? colorHash.hex(symbol.value) : [];

    return `background: ${color};`;
  });

  return {
    token: token,
    label: tokenLabel,
    background: backgroundStyle,
  };
}

export async function getLMData(address: ComputedRef<any>, chainId: string) {
  if (!address.value) return;
  const { services } = useCore();
  const parsedData = await services.cryptoeconomics.fetchData({
    rewardType: "lm",
    key: "userData",
    address: address.value,
    timestamp: "now",
    snapShotSource: chainId === "sifchain" ? "mainnet" : "testnet",
  });
  if (!parsedData?.user) {
    return {};
  }
  return Object.fromEntries(
    Object.entries(parsedData.user).map(([k, v]) => {
      if (typeof v !== "number") {
        return [k, v];
      }
      return [k, Amount(v.toFixed(18))];
    }),
  );
}

export async function getVSData(address: ComputedRef<any>, chainId: string) {
  if (!address.value) return;
  const { services } = useCore();
  const parsedData = await services.cryptoeconomics.fetchData({
    rewardType: "vs",
    key: "userData",
    address: address.value,
    timestamp: "now",
    snapShotSource: chainId === "sifchain" ? "mainnet" : "testnet",
  });
  if (!parsedData?.user) {
    return {};
  }
  return Object.fromEntries(
    Object.entries(parsedData.user).map(([k, v]) => {
      if (typeof v !== "number") {
        return [k, v];
      }
      return [k, Amount(v.toFixed(18))];
    }),
  );
}

async function getClaimsData(
  apiUrl: string,
  address: string,
  type: "LiquidityMining" | "ValidatorSubsidy",
) {
  const data = await (
    await fetch(`${apiUrl}/dispensation/getClaims?type=${type}`)
  ).json();
  if (!data.result) {
    return false;
  }

  return data.result.find((item: any) => {
    return item.user_address === address;
  });
}

export type IHasClaimed = {
  lm: object | false;
  vs: object | false;
};

export async function getExistingClaimsData(
  address: ComputedRef<string>,
  apiUrl: string,
): Promise<IHasClaimed> {
  if (!address.value || !apiUrl) throw "Missing input";

  const lmClaimData = await getClaimsData(
    apiUrl,
    address.value,
    "LiquidityMining",
  );

  const vsClaimData = await getClaimsData(
    apiUrl,
    address.value,
    "ValidatorSubsidy",
  );
  return {
    lm: lmClaimData || false,
    vs: vsClaimData || false,
  };
}

export function getBlockExplorerUrl(
  sifChainId: string,
  txHash?: TxHash,
  network?: string,
): string {
  // todo (59023g) refactor dependent on upstream chain/network refactor
  if (sifChainId === "sifchain-1" && network === "ethereum") {
    return `https://etherscan.io/tx/${txHash}`;
  }
  if (network === "ethereum") {
    return `https://ropsten.etherscan.io/tx/${txHash}`;
  }
  if (sifChainId === "sifchain-1" && network === "cosmoshub") {
    return `https://www.mintscan.io/cosmos/txs/${txHash}`;
  }
  if (network === "cosmoshub") {
    return `https://api.testnet.cosmos.network/cosmos/tx/v1beta1/txs/${txHash}`;
  }

  switch (sifChainId) {
    case "sifchain":
      if (!txHash) return "https://blockexplorer.sifchain.finance/";
      return `https://blockexplorer.sifchain.finance/transactions/${txHash}`;
    case "sifchain-devnet-042":
      if (!txHash) return "https://blockexplorer.sifchain.finance/";
      return `https://blockexplorer-devnet-042.sifchain.finance/transactions/${txHash}`;
    case "sifchain-testnet-1":
      if (!txHash) return "https://blockexplorer.sifchain.finance/";
      return `https://blockexplorer-testnet-042.sifchain.finance/transactions/${txHash}`;
    case "sifchain-testnet":
      if (!txHash) return `https://blockexplorer-testnet.sifchain.finance/`;
      return `https://blockexplorer-testnet.sifchain.finance/transactions/${txHash}`;
    default:
      if (!txHash) return "https://blockexplorer-devnet.sifchain.finance/";
      return `https://blockexplorer-devnet.sifchain.finance/transactions/${txHash}`;
  }
}

export function getRewardEarningsUrl(): string {
  return `https://data.sifchain.finance/beta/network`;
}
