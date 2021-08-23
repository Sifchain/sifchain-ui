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
import memoize from "lodash/memoize";
import {
  CosmosWalletProvider,
  WalletConnectionState,
  WalletProviderContext,
} from "./types";
import { TokenRegistry } from "../../services/IBCService/tokenRegistry";

const getIBCChainConfig = (chain: Chain) => {
  if (chain.chainConfig.chainType !== "ibc")
    throw new Error("Cannot connect to non-ibc chain " + chain.displayName);
  return chain.chainConfig as IBCChainConfig;
};

export class KeplrWalletProvider extends CosmosWalletProvider {
  symbolLookup: Record<string, { symbol: string; invalid: boolean }> = {};

  tokenRegistry: ReturnType<typeof TokenRegistry>;

  static create(context: WalletProviderContext) {
    return new KeplrWalletProvider(context);
  }
  constructor(public context: WalletProviderContext) {
    super();
    this.tokenRegistry = TokenRegistry(context);

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

  async fetchBalances(chain: Chain, address: string): Promise<IAssetAmount[]> {
    const queryClient = await this.getQueryClientCached(chain);
    const stargate = await this.getStargateClientCached(chain);
    const balances = await stargate.getAllBalances(address);

    const assetAmounts: IAssetAmount[] = [];

    const tokenRegistry = await this.tokenRegistry.load();

    for (let coin of balances) {
      try {
        if (!coin.denom.startsWith("ibc/")) {
          const asset = chain.assets.find(
            (asset) => asset.symbol === coin.denom,
          );
          assetAmounts.push(AssetAmount(asset || coin.denom, coin.amount));
        } else {
          const registryEntry = tokenRegistry.find(
            (item) => item.denom === coin.denom,
          );
          if (!registryEntry) continue; // Skip this coin, it isnt allowed.

          const asset = chain.assets.find(
            (asset) => asset.symbol === registryEntry.baseDenom,
          );
          if (asset) {
            asset.ibcDenom = registryEntry.denom;
          }
          const assetAmount = AssetAmount(
            asset || registryEntry.baseDenom,
            coin.amount,
          );
          assetAmounts.push(assetAmount);
        }
      } catch (error) {
        console.error(chain.network, "coin error", coin, error);
      }
    }

    return assetAmounts;
  }
}
