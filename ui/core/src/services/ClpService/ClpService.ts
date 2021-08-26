import {
  Amount,
  Asset,
  IAsset,
  IAssetAmount,
  LiquidityProvider,
  Network,
  Pool,
} from "../../entities";

import { SifUnSignedClient } from "../utils/SifClient";
import { toPool } from "../utils/SifClient/toPool";
import { RawPool } from "../utils/SifClient/x/clp";
import TokenRegistryService from "../../services/TokenRegistryService";

export type ClpServiceContext = {
  nativeAsset: IAsset;
  sifApiUrl: string;
  sifRpcUrl: string;
  sifWsUrl: string;
  sifChainId: string;
  sifUnsignedClient?: SifUnSignedClient;
};

type IClpService = {
  getRawPools: () => Promise<RawPool[]>;
  getPools: () => Promise<Pool[]>;
  getPoolSymbolsByLiquidityProvider: (address: string) => Promise<string[]>;
  swap: (params: {
    fromAddress: string;
    sentAmount: IAssetAmount;
    receivedAsset: Asset;
    minimumReceived: IAssetAmount;
  }) => any;
  addLiquidity: (params: {
    fromAddress: string;
    nativeAssetAmount: IAssetAmount;
    externalAssetAmount: IAssetAmount;
  }) => any;
  createPool: (params: {
    fromAddress: string;
    nativeAssetAmount: IAssetAmount;
    externalAssetAmount: IAssetAmount;
  }) => any;
  getLiquidityProvider: (params: {
    asset: IAsset;
    lpAddress: string;
  }) => Promise<LiquidityProvider | null>;
  removeLiquidity: (params: {
    wBasisPoints: string;
    asymmetry: string;
    asset: IAsset;
    fromAddress: string;
  }) => any;
};

// TS not null type guard
function notNull<T>(val: T | null): val is T {
  return val !== null;
}

export default function createClpService({
  sifApiUrl,
  nativeAsset,
  sifChainId,
  sifWsUrl,
  sifRpcUrl,
  sifUnsignedClient = new SifUnSignedClient(sifApiUrl, sifWsUrl, sifRpcUrl),
}: ClpServiceContext): IClpService {
  const client = sifUnsignedClient;

  const tokenRegistry = TokenRegistryService({ sifRpcUrl });

  const instance: IClpService = {
    async getRawPools() {
      return client.getPools();
    },
    async getPools() {
      try {
        const rawPools = await client.getPools();
        return (
          rawPools
            .map(toPool(nativeAsset))
            // toPool can return a null pool for invalid pools lets filter them out
            .filter(notNull)
        );
      } catch (error) {
        return [];
      }
    },
    async getPoolSymbolsByLiquidityProvider(address: string) {
      // Unfortunately it is expensive for the backend to
      // filter pools so we need to annoyingly do this in two calls
      // First we get the metadata
      const poolMeta = await client.getAssets(address);
      if (!poolMeta) return [];
      return poolMeta.map(({ symbol }) => symbol);
    },

    async addLiquidity(params: {
      fromAddress: string;
      nativeAssetAmount: IAssetAmount;
      externalAssetAmount: IAssetAmount;
    }) {
      const externalAssetEntry = await tokenRegistry.findAssetEntryOrThrow(
        params.externalAssetAmount.asset,
      );
      return await client.addLiquidity({
        base_req: { chain_id: sifChainId, from: params.fromAddress },
        external_asset: {
          source_chain: params.externalAssetAmount.asset.network as string,
          symbol: externalAssetEntry.denom || externalAssetEntry.baseDenom,
          ticker: params.externalAssetAmount.asset.symbol,
        },
        external_asset_amount: params.externalAssetAmount.toBigInt().toString(),
        native_asset_amount: params.nativeAssetAmount.toBigInt().toString(),
        signer: params.fromAddress,
      });
    },

    async createPool(params) {
      const externalAssetEntry = await tokenRegistry.findAssetEntryOrThrow(
        params.externalAssetAmount.asset,
      );
      return await client.createPool({
        base_req: { chain_id: sifChainId, from: params.fromAddress },
        external_asset: {
          source_chain: params.externalAssetAmount.asset.homeNetwork as string,
          symbol: externalAssetEntry.denom || externalAssetEntry.baseDenom,
          ticker: params.externalAssetAmount.asset.symbol,
        },
        external_asset_amount: params.externalAssetAmount.toBigInt().toString(),
        native_asset_amount: params.nativeAssetAmount.toBigInt().toString(),
        signer: params.fromAddress,
      });
    },

    async swap(params) {
      return await client.swap({
        base_req: { chain_id: sifChainId, from: params.fromAddress },
        received_asset: {
          source_chain: params.receivedAsset.network as string,
          symbol: params.receivedAsset.ibcDenom ?? params.receivedAsset.symbol,
          ticker: params.receivedAsset.ibcDenom ?? params.receivedAsset.symbol,
        },
        sent_amount: params.sentAmount.toBigInt().toString(),
        sent_asset: {
          source_chain: params.sentAmount.asset.network as string,
          symbol: params.sentAmount.ibcDenom ?? params.sentAmount.symbol,
          ticker: params.sentAmount.ibcDenom ?? params.sentAmount.symbol,
        },
        min_receiving_amount: params.minimumReceived.toBigInt().toString(),
        signer: params.fromAddress,
      });
    },
    async getLiquidityProvider(params) {
      const response = await client.getLiquidityProvider({
        symbol: params.asset.ibcDenom || params.asset.symbol,
        lpAddress: params.lpAddress,
      });

      const {
        liquidity_provider,
        native_asset_balance,
        external_asset_balance,
      } = response.result;

      const {
        liquidity_provider_units,
        liquidity_provider_address,
      } = liquidity_provider;

      return LiquidityProvider(
        params.asset,
        Amount(liquidity_provider_units),
        liquidity_provider_address,
        Amount(native_asset_balance),
        Amount(external_asset_balance),
      );
    },

    async removeLiquidity(params) {
      const externalAssetEntry = await tokenRegistry.findAssetEntryOrThrow(
        params.asset,
      );
      return await client.removeLiquidity({
        asymmetry: params.asymmetry,
        base_req: { chain_id: sifChainId, from: params.fromAddress },
        external_asset: {
          source_chain: params.asset.network as string,
          symbol: externalAssetEntry.denom || externalAssetEntry.baseDenom,
          ticker: params.asset.symbol,
        },
        signer: params.fromAddress,
        w_basis_points: params.wBasisPoints,
      });
    },
  };

  return instance;
}
