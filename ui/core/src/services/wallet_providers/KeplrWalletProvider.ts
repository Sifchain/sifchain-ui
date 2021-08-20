import {
  Coin,
  QueryClient,
  setupAuthExtension,
  setupBankExtension,
  setupIbcExtension,
  SigningStargateClient,
} from "@cosmjs/stargate";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { TokenRegistry } from "services/IBCService/tokenRegistry";
import getKeplrProvider from "services/SifService/getKeplrProvider";
import {
  AssetAmount,
  Chain,
  getChainsService,
  IAssetAmount,
  IBCChainConfig,
  Network,
} from "../../entities";
import {
  CosmosWalletProvider,
  WalletConnectionState,
  WalletProviderContext,
} from "./types";

const getIBCChainConfig = (chain: Chain) => {
  if (chain.chainConfig.chainType !== "ibc")
    throw new Error("Cannot connect to non-ibc chain " + chain.displayName);
  return chain.chainConfig as IBCChainConfig;
};

export class KeplrWalletProvider extends CosmosWalletProvider {
  symbolLookup: Record<string, { symbol: string; invalid: boolean }> = {};

  tokenRegistry: ReturnType<typeof TokenRegistry>;

  constructor(public context: WalletProviderContext) {
    super();
    this.tokenRegistry = TokenRegistry(context);
  }

  supportedProtocols = [
    Network.AKASH,
    Network.COSMOSHUB,
    Network.IRIS,
    Network.SENTINEL,
    Network.SIFCHAIN,
  ];

  isLoaded(chain: Chain): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  async canDisconnect(chain: Chain) {
    return false;
  }
  async disconnect(chain: Chain) {
    throw new Error("Keplr wallets cannot disconnect");
  }

  async getSendingSigner(chain: Chain) {
    const chainConfig = getIBCChainConfig(chain);
    const keplr = await getKeplrProvider();
    await keplr?.experimentalSuggestChain(chainConfig.keplrChainInfo);
    await keplr?.enable(chainConfig.chainId);
    const sendingSigner = keplr?.getOfflineSigner(chainConfig.chainId);

    if (!sendingSigner)
      throw new Error(`Failed to get sendingSigner for ${chainConfig.chainId}`);

    return sendingSigner;
  }

  async getStargateClient(chain: Chain) {
    const chainConfig = getIBCChainConfig(chain);
    const sendingSigner = await this.getSendingSigner(chain);

    return SigningStargateClient?.connectWithSigner(
      chainConfig.rpcUrl,
      sendingSigner,
      {
        gasLimits: {
          send: 80000,
          ibcTransfer: 120000,
          delegate: 250000,
          undelegate: 250000,
          redelegate: 250000,
          // The gas multiplication per rewards.
          withdrawRewards: 140000,
          govVote: 250000,
        },
      },
    );
  }

  async getQueryClient(chain: Chain) {
    const chainConfig = getIBCChainConfig(chain);
    const tendermintClient = await Tendermint34Client.connect(
      chainConfig.rpcUrl,
    );
    return QueryClient.withExtensions(
      tendermintClient,
      setupIbcExtension,
      setupBankExtension,
      setupAuthExtension,
    );
  }

  async connect(chain: Chain): Promise<WalletConnectionState> {
    const sendingSigner = await this.getSendingSigner(chain);

    const [address] = (await sendingSigner.getAccounts()).map(
      (acc) => acc.address,
    );
    const balances = await this.fetchBalances(chain, address);

    return {
      chain,
      provider: this,
      balances,
      address,
    };
  }

  async fetchBalances(chain: Chain, address: string): Promise<IAssetAmount[]> {
    const [queryClient, balances] = await Promise.all([
      this.getQueryClient(chain),
      this.getStargateClient(chain).then((stargate) => {
        return stargate.getAllBalances(address);
      }),
    ]);
    const assetAmounts: IAssetAmount[] = [];

    const tokenRegistry = await this.tokenRegistry.load();

    const getCoinData = async (
      coin: Coin,
    ): Promise<{ symbol: string; ibcDenom?: string } | undefined> => {
      // If it's a non ibc symbol, go ahead and return it
      if (!coin.denom.startsWith("ibc/")) {
        return { symbol: coin.denom };
      }

      // If it's a cached ibc symbol, return cached value
      // (or if it's cached as invalid, skip it)
      if (this.symbolLookup[coin.denom]) {
        const { symbol, invalid } = this.symbolLookup[coin.denom];
        return invalid ? undefined : { symbol };
      }

      // Otherwise, run a denom trace to look up the ibc hash's match
      const denomTrace = await queryClient.ibc.transfer.denomTrace(
        coin.denom.split("/")[1],
      );
      const [, channelId] = (denomTrace.denomTrace?.path || "").split("/");

      // if this came from an invalid channel (ie testnet coin in devnet)
      // then ignore it.
      const isInvalidChannel =
        channelId &&
        !tokenRegistry.some(
          (item) =>
            item.src_channel === channelId || item.dest_channel === channelId,
        );
      if (isInvalidChannel) {
        this.symbolLookup[coin.denom] = { symbol: "", invalid: true };
        return;
      }

      const symbol = denomTrace.denomTrace?.baseDenom ?? coin.denom;
      this.symbolLookup[coin.denom] = { symbol, invalid: false };
      return { symbol, ibcDenom: coin.denom };
    };

    for (let coin of balances) {
      try {
        const data = await getCoinData(coin);
        if (!data) continue;

        const { ibcDenom, symbol } = data;
        const asset = chain.assets.find((asset) => asset.symbol === symbol);

        if (asset && ibcDenom) {
          asset.ibcDenom = ibcDenom;
        }
        const assetAmount = AssetAmount(asset || symbol, coin.amount);
        assetAmounts.push(assetAmount);
      } catch (error) {
        console.error(chain.network, "coin error", coin, error);
      }
    }

    return assetAmounts;
  }
}
