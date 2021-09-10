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
import { OfflineSigner, OfflineDirectSigner } from "@cosmjs/proto-signing";
import { DenomTrace } from "@cosmjs/stargate/build/codec/ibc/applications/transfer/v1/transfer";

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

  async getSendingSigner(
    chain: Chain,
  ): Promise<OfflineSigner & OfflineDirectSigner> {
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
      .filter((c) => c.chainConfig.chainType === "ibc" && !c.chainConfig.hidden)
      .map((c) => c.chainConfig.chainId);
    // @ts-ignore
    return keplr?.enable(chainIds);
  }
  async connect(chain: Chain): Promise<WalletConnectionState> {
    // try to get the address quietly
    const keplr = await getKeplrProvider();
    const key = await keplr?.getKey(chain.chainConfig.chainId);
    let address = key?.bech32Address;
    // if quiet get fails, try to enable the wallet
    if (!address) {
      const sendingSigner = await this.getSendingSigner(chain);
      address = (await sendingSigner.getAccounts())[0]?.address;
    }
    // if enabling & quiet get fails, throw.
    if (!address) {
      throw new Error("No address to connect to");
    }

    return {
      chain,
      provider: this,
      balances: [],
      address,
    };
  }

  denomTraceLookup: Record<
    string,
    Record<string, QueryDenomTraceResponse>
  > = {};
  async denomTrace(chain: Chain, denom: string) {
    const chainId = chain.chainConfig.chainId;
    if (!this.denomTraceLookup[chainId]) {
      this.denomTraceLookup[chainId] = {};
    }
    if (!this.denomTraceLookup[chainId][denom]) {
      const queryClient = await this.getQueryClientCached(chain);

      let queryDenomTrace = async () => {
        const value = await Promise.race([
          queryClient.ibc.transfer.denomTrace(denom),
          new Promise((r) => setTimeout(() => r("timeout"), 1500)),
        ]);
        // The keplr rpc apis often fail once for denomtrace once in awhile,
        // but only once... so if it takes >1.5 seconds give it a quick retry.
        if (value === "timeout") {
          return queryClient.ibc.transfer.denomTrace(denom);
        } else {
          return value as QueryDenomTraceResponse;
        }
      };
      this.denomTraceLookup[chainId][denom] = await queryDenomTrace();
    }
    return this.denomTraceLookup[chainId][denom];
  }

  async fetchBalances(chain: Chain, address: string): Promise<IAssetAmount[]> {
    // permissionless query to get all balances
    const queryClient = await this.getQueryClientCached(chain);
    const balances = await queryClient?.bank.allBalances(address);

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
