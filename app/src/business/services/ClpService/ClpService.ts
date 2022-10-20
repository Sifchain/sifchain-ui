import { Amount, IAsset, IAssetAmount, LiquidityProvider } from "@sifchain/sdk";

import { NativeDexClient } from "@sifchain/sdk/src/clients";
import { SifUnSignedClient } from "@sifchain/sdk/src/clients/native/SifClient";

import TokenRegistryService from "~/business/services/TokenRegistryService";

export type ClpServiceContext = {
  nativeAsset: IAsset;
  sifApiUrl: string;
  sifRpcUrl: string;
  sifChainId: string;
  sifUnsignedClient?: SifUnSignedClient;
};

export class ClpService {
  private ctx: ClpServiceContext;
  private client: SifUnSignedClient;
  private dexClientPromise: Promise<NativeDexClient>;
  private tokenRegistry: TokenRegistryService;

  constructor(ctx: ClpServiceContext) {
    this.ctx = ctx;

    this.client =
      ctx.sifUnsignedClient ??
      new SifUnSignedClient(ctx.sifApiUrl, ctx.sifRpcUrl);

    this.dexClientPromise = NativeDexClient.connect(
      ctx.sifRpcUrl,
      ctx.sifApiUrl,
      ctx.sifChainId,
    );

    this.tokenRegistry = new TokenRegistryService({
      sifRpcUrl: ctx.sifRpcUrl,
      sifApiUrl: ctx.sifApiUrl,
      sifChainId: ctx.sifChainId,
    });
  }

  async getRawPools() {
    const queryClient = await this.dexClientPromise;
    return queryClient.query.clp.GetPools({});
  }

  async getAccountLiquidityProviderData(params: { lpAddress: string }) {
    const queryClient = await this.dexClientPromise;

    const res = await queryClient.query.clp.GetLiquidityProviderData({
      lpAddress: params.lpAddress,
    });

    return res.liquidityProviderData;
  }

  async getPoolSymbolsByLiquidityProvider(address: string) {
    // Unfortunately it is expensive for the backend to
    // filter pools so we need to annoyingly do this in two calls
    // First we get the metadata
    const poolMeta = await this.client.getAssets(address);
    if (!poolMeta) return [];
    return poolMeta.map(({ symbol }) => symbol);
  }

  async swap(params: {
    fromAddress: string;
    sentAmount: IAssetAmount;
    receivedAsset: IAsset;
    minimumReceived: IAssetAmount;
  }) {
    const sentAssetEntry = await this.tokenRegistry.findAssetEntryOrThrow(
      params.sentAmount,
    );
    const receivedAssetEntry = await this.tokenRegistry.findAssetEntryOrThrow(
      params.receivedAsset,
    );
    return await this.client.swap({
      base_req: {
        chain_id: this.ctx.sifChainId,
        from: params.fromAddress,
      },
      received_asset: {
        source_chain: params.receivedAsset.network as string,
        symbol: receivedAssetEntry.denom,
        ticker: receivedAssetEntry.baseDenom,
      },
      sent_amount: params.sentAmount.toBigInt().toString(),
      sent_asset: {
        source_chain: params.sentAmount.asset.network as string,
        symbol: sentAssetEntry.denom,
        ticker: sentAssetEntry.baseDenom,
      },
      min_receiving_amount: params.minimumReceived.toBigInt().toString(),
      signer: params.fromAddress,
    });
  }

  async addLiquidity(params: {
    fromAddress: string;
    nativeAssetAmount: IAssetAmount;
    externalAssetAmount: IAssetAmount;
  }) {
    const externalAssetEntry = await this.tokenRegistry.findAssetEntryOrThrow(
      params.externalAssetAmount.asset,
    );

    return await this.client.addLiquidity({
      base_req: {
        chain_id: this.ctx.sifChainId,
        from: params.fromAddress,
      },
      external_asset: {
        source_chain: params.externalAssetAmount.asset.network as string,
        symbol: externalAssetEntry.denom,
        ticker: params.externalAssetAmount.asset.symbol,
      },
      external_asset_amount: params.externalAssetAmount.toBigInt().toString(),
      native_asset_amount: params.nativeAssetAmount.toBigInt().toString(),
      signer: params.fromAddress,
    });
  }

  async createPool(params: {
    fromAddress: string;
    nativeAssetAmount: IAssetAmount;
    externalAssetAmount: IAssetAmount;
  }) {
    const externalAssetEntry = await this.tokenRegistry.findAssetEntryOrThrow(
      params.externalAssetAmount.asset,
    );

    return await this.client.createPool({
      base_req: {
        chain_id: this.ctx.sifChainId,
        from: params.fromAddress,
      },
      external_asset: {
        source_chain: params.externalAssetAmount.asset.homeNetwork as string,
        symbol: externalAssetEntry.denom,
        ticker: params.externalAssetAmount.asset.symbol,
      },
      external_asset_amount: params.externalAssetAmount.toBigInt().toString(),
      native_asset_amount: params.nativeAssetAmount.toBigInt().toString(),
      signer: params.fromAddress,
    });
  }

  async getLiquidityProvider(params: { asset: IAsset; lpAddress: string }) {
    await this.tokenRegistry.load();
    const entry = await this.tokenRegistry.findAssetEntryOrThrow(params.asset);

    const queryClient = await this.dexClientPromise;

    const { liquidityProvider, externalAssetBalance, nativeAssetBalance } =
      await queryClient.query.clp.GetLiquidityProvider({
        // cannot use params.asset.ibcDenom because ibcDenom is set when loading balances,
        // and the user does not always have a balance for the asset they have pooled
        symbol: entry.denom,
        lpAddress: params.lpAddress,
      });

    if (!liquidityProvider) {
      throw new Error(`No liquidity provider found for ${params.lpAddress}`);
    }

    const { liquidityProviderUnits, liquidityProviderAddress } =
      liquidityProvider;

    return new LiquidityProvider(
      params.asset,
      Amount(liquidityProviderUnits),
      liquidityProviderAddress,
      Amount(nativeAssetBalance),
      Amount(externalAssetBalance),
    );
  }

  async removeLiquidity(params: {
    wBasisPoints: string;
    asymmetry: string;
    asset: IAsset;
    fromAddress: string;
  }) {
    const externalAssetEntry = await this.tokenRegistry.findAssetEntryOrThrow(
      params.asset,
    );
    return await this.client.removeLiquidity({
      asymmetry: params.asymmetry,
      base_req: {
        chain_id: this.ctx.sifChainId,
        from: params.fromAddress,
      },
      external_asset: {
        source_chain: params.asset.network as string,
        symbol: externalAssetEntry.denom,
        ticker: params.asset.symbol,
      },
      signer: params.fromAddress,
      w_basis_points: params.wBasisPoints,
    });
  }

  async getPmtpParams() {
    const queryClient = await this.dexClientPromise;
    return await queryClient.query.clp.GetPmtpParams({});
  }

  async GetSwapFeeParams() {
    const queryClient = await this.dexClientPromise;
    return await queryClient.query.clp.GetSwapFeeParams({});
  }
}

export default function createClpService(ctx: ClpServiceContext) {
  return new ClpService(ctx);
}
