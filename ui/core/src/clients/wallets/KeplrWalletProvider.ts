import {
  Coin,
  QueryClient,
  setupAuthExtension,
  setupBankExtension,
  setupIbcExtension,
  SigningStargateClient,
} from "@cosmjs/stargate";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import getKeplrProvider from "../../services/SifService/getKeplrProvider";
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
import { TokenRegistryService } from "../../services/TokenRegistryService/TokenRegistryService";
import { QueryDenomTraceResponse } from "@cosmjs/stargate/build/codec/ibc/applications/transfer/v1/query";
import { memoize } from "../../utils/memoize";

const getIBCChainConfig = (chain: Chain) => {
  if (chain.chainConfig.chainType !== "ibc")
    throw new Error("Cannot connect to non-ibc chain " + chain.displayName);
  return chain.chainConfig as IBCChainConfig;
};

export class KeplrWalletProvider extends CosmosWalletProvider {
  symbolLookup: Record<string, { symbol: string; invalid: boolean }> = {};

  tokenRegistry: ReturnType<typeof TokenRegistryService>;

  static create(context: WalletProviderContext) {
    return new KeplrWalletProvider(context);
  }
  constructor(public context: WalletProviderContext) {
    super();
    this.tokenRegistry = TokenRegistryService(context);

    // TODO(ajoslin): handle account switches gracefully
    try {
      window?.addEventListener("keplr_keystorechange", () =>
        window.location.reload(),
      );
    } catch (e) {}
  }

  async hasConnected(chain: Chain) {
    const chainConfig = getIBCChainConfig(chain);
    const keplr = await getKeplrProvider();
    try {
      await keplr?.getKey(chainConfig.keplrChainInfo.chainId);
      return true;
    } catch (error) {
      return false;
    }
  }

  isChainSupported(chain: Chain) {
    return chain.chainConfig.chainType === "ibc";
  }

  canDisconnect(chain: Chain) {
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

  getStargateClientCached = memoize(this.getStargateClient.bind(this));
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

  getQueryClientCached = memoize(this.getQueryClient.bind(this));
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

  async tryConnectAll(...chains: Chain[]) {
    const keplr = await getKeplrProvider();
    const chainIds = chains
      .filter((c) => c.chainConfig.chainType === "ibc")
      .map((c) => c.chainConfig.chainId);
    // @ts-ignore
    keplr?.enable(chainIds);
  }
  async connect(chain: Chain): Promise<WalletConnectionState> {
    const sendingSigner = await this.getSendingSigner(chain);

    const address = (await sendingSigner.getAccounts())[0]?.address;
    if (!address) {
      throw new Error("No address to connect to");
    }
    const balances = await this.fetchBalances(chain, address);

    return {
      chain,
      provider: this,
      balances,
      address,
    };
  }

  denomTraceLookup: Record<
    string,
    Record<string, QueryDenomTraceResponse>
  > = {};
  async denomTrace(chain: Chain, denom: string) {
    if (!this.denomTraceLookup[chain.chainConfig.chainId]) {
      this.denomTraceLookup[chain.chainConfig.chainId] = {};
    }
    if (!this.denomTraceLookup[chain.chainConfig.chainId][denom]) {
      const queryClient = await this.getQueryClientCached(chain);
      this.denomTraceLookup[chain.chainConfig.chainId][
        denom
      ] = await queryClient.ibc.transfer.denomTrace(denom);
    }
    return this.denomTraceLookup[chain.chainConfig.chainId][denom];
  }

  async fetchBalances(chain: Chain, address: string): Promise<IAssetAmount[]> {
    const stargate = await this.getStargateClientCached(chain);
    const balances = await stargate.getAllBalances(address);

    const assetAmounts: IAssetAmount[] = [];

    const tokenRegistry = await this.tokenRegistry.load();

    await Promise.all(
      balances.map(async (coin: Coin) => {
        try {
          if (!coin.denom.startsWith("ibc/")) {
            const asset = chain.assets.find(
              (asset) =>
                asset.symbol.toLowerCase() === coin.denom.toLowerCase(),
            );
            assetAmounts.push(AssetAmount(asset || coin.denom, coin.amount));
          } else {
            const denomTrace = await this.denomTrace(
              chain,
              coin.denom.split("/")[1],
            );

            const [, channelId] = (denomTrace.denomTrace?.path || "").split(
              "/",
            );

            const isInvalidChannel =
              channelId &&
              !tokenRegistry.some(
                (item) =>
                  item.ibcChannelId === channelId ||
                  item.ibcCounterpartyChannelId === channelId,
              );

            if (isInvalidChannel) return;

            const baseDenom = denomTrace.denomTrace?.baseDenom ?? coin.denom;

            const asset = chain.assets.find(
              (asset) => asset.symbol.toLowerCase() === baseDenom.toLowerCase(),
            );
            if (asset) {
              asset.ibcDenom = coin.denom;
            }
            try {
              const assetAmount = AssetAmount(asset || baseDenom, coin.amount);
              assetAmounts.push(assetAmount);
            } catch (error) {
              // ignore asset, doesnt exist in our list.
            }
          }
        } catch (error) {
          console.error(chain.network, "coin error", coin, error);
        }
      }),
    );

    return assetAmounts;
  }
}
