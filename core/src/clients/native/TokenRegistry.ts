import {
  Chain,
  Network,
  IAsset,
  Asset,
  IAssetAmount,
  AssetAmount,
  fromBaseUnits,
  toBaseUnits,
} from "../../";
import { NativeDexClient } from "../../clients";
import { RegistryEntry } from "../../generated/proto/sifnode/tokenregistry/v1/types";

export type TokenRegistryContext = {
  sifRpcUrl: string;
  sifApiUrl: string;
  sifChainId: string;
};

export class TokenRegistry {
  private tokenRegistryPromise?: Promise<RegistryEntry[]>;

  constructor(private context: TokenRegistryContext) {}

  async load() {
    if (!this.tokenRegistryPromise) {
      this.tokenRegistryPromise = (async () => {
        const dex = await NativeDexClient.connect(
          this.context.sifRpcUrl,
          this.context.sifApiUrl,
          this.context.sifChainId,
        );
        const res = await dex.query?.tokenregistry.Entries({});
        const data = res?.registry?.entries;
        if (!data) throw new Error("Whitelist not found");
        return data as RegistryEntry[];
      })();
    }
    return this.tokenRegistryPromise;
  }

  async findAssetEntry(asset: IAsset) {
    const items = await this.load();
    return items.find((item) => item.baseDenom === asset.symbol);
  }

  async findAssetEntryOrThrow(asset: IAsset) {
    const entry = await this.findAssetEntry(asset);
    if (!entry)
      throw new Error("TokenRegistry entry not found for " + asset.symbol);
    return entry;
  }

  async loadCounterpartyEntry(nativeAsset: IAsset) {
    const entry = await this.findAssetEntryOrThrow(nativeAsset);
    if (
      !entry.ibcCounterpartyDenom ||
      entry.ibcCounterpartyDenom === entry.denom
    ) {
      return entry;
    }
    const items = await this.load();
    return items.find((item) => entry.ibcCounterpartyDenom === item.denom);
  }

  async loadCounterpartyAsset(nativeAsset: IAsset) {
    const entry = await this.findAssetEntryOrThrow(nativeAsset);
    if (
      !entry.ibcCounterpartyDenom ||
      entry.ibcCounterpartyDenom === entry.denom
    ) {
      return nativeAsset;
    }
    const items = await this.load();
    const counterpartyEntry = items.find(
      (item) => entry.ibcCounterpartyDenom === item.denom,
    )!;
    return Asset({
      ...nativeAsset,
      symbol: counterpartyEntry.denom,
      decimals: +counterpartyEntry.decimals,
    });
  }

  async loadNativeAsset(counterpartyAsset: IAsset) {
    const entry = await this.findAssetEntryOrThrow(counterpartyAsset);
    if (!entry.unitDenom || entry.unitDenom === entry.denom) {
      return counterpartyAsset;
    }
    const items = await this.load();
    const nativeEntry = items.find((item) => entry.unitDenom === item.denom)!;
    return Asset({
      ...counterpartyAsset,
      symbol: nativeEntry.denom,
      decimals: +nativeEntry.decimals,
    });
  }

  async loadCounterpartyAssetAmount(
    nativeAssetAmount: IAssetAmount,
  ): Promise<IAssetAmount> {
    await this.load();
    const counterpartyAsset = await this.loadCounterpartyAsset(
      nativeAssetAmount.asset,
    );
    const decimalAmount = fromBaseUnits(
      nativeAssetAmount.amount.toString(),
      nativeAssetAmount.asset,
    );
    const convertedIntAmount = toBaseUnits(decimalAmount, counterpartyAsset);
    return AssetAmount(counterpartyAsset, convertedIntAmount);
  }

  async loadNativeAssetAmount(
    assetAmount: IAssetAmount,
  ): Promise<IAssetAmount> {
    await this.load();
    const nativeAsset = await this.loadNativeAsset(assetAmount.asset);
    const decimalAmount = fromBaseUnits(
      assetAmount.amount.toString(),
      assetAmount.asset,
    );
    const convertedIntAmount = toBaseUnits(decimalAmount, nativeAsset);
    return AssetAmount(nativeAsset, convertedIntAmount);
  }

  async loadConnection(params: { fromChain: Chain; toChain: Chain }) {
    const items = await this.load();

    const sourceIsNative = params.fromChain.network === Network.SIFCHAIN;

    const counterpartyChain = sourceIsNative
      ? params.toChain
      : params.fromChain;

    const item = items
      .reverse()
      .find(
        (item) =>
          item.baseDenom?.toLowerCase() ===
          counterpartyChain.nativeAsset.symbol.toLowerCase(),
      );

    if (sourceIsNative) {
      return { channelId: item?.ibcChannelId };
    } else {
      return { channelId: item?.ibcCounterpartyChannelId };
    }
  }
}
