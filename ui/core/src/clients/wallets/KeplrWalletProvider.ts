import {
  Coin,
  QueryClient,
  setupAuthExtension,
  setupBankExtension,
  setupIbcExtension,
  SigningStargateClient,
} from "@cosmjs/stargate";
import pLimit from "p-limit";
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
import {
  QueryDenomTraceResponse,
  QueryDenomTracesResponse,
} from "@cosmjs/stargate/build/codec/ibc/applications/transfer/v1/query";
import { memoizeSuccessfulPromise } from "../../utils/memoize";
import { OfflineSigner, OfflineDirectSigner } from "@cosmjs/proto-signing";
import { DenomTrace } from "@cosmjs/stargate/build/codec/ibc/applications/transfer/v1/transfer";

const getIBCChainConfig = (chain: Chain) => {
  if (chain.chainConfig.chainType !== "ibc")
    throw new Error("Cannot connect to non-ibc chain " + chain.displayName);
  return chain.chainConfig as IBCChainConfig;
};

async function digestMessage(message: string) {
  const msgUint8 = new TextEncoder().encode(message); // encode as (utf-8) Uint8Array

  if (typeof crypto === "undefined") {
    global.crypto = require("crypto").webcrypto; // Node.js support
  }

  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8); // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(""); // convert bytes to hex string
  return "ibc/" + hashHex.toUpperCase();
}

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

  getStargateClientCached = memoizeSuccessfulPromise(
    this.getStargateClient.bind(this),
  );
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

  getQueryClientCached = memoizeSuccessfulPromise(
    this.getQueryClient.bind(this),
  );
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
    return keplr?.enable(chainIds);
  }
  async connect(chain: Chain): Promise<WalletConnectionState> {
    // try to get the address quietly
    const keplr = await getKeplrProvider();
    const chainConfig = getIBCChainConfig(chain);
    await keplr?.experimentalSuggestChain(chainConfig.keplrChainInfo);
    const key = await keplr?.getKey(chain.chainConfig.chainId);
    let address = key?.bech32Address;
    // if quiet get fails, try to enable the wallet
    if (!address) {
      const sendingSigner = await this.getSendingSigner(chain);
      address = (await sendingSigner.getAccounts())[0]?.address;
    }
    // if enabling & quiet get fails, throw.
    // if quiet get fails, try to enable the wallet
    if (!address) {
      const sendingSigner = await this.getSendingSigner(chain);
      address = (await sendingSigner.getAccounts())[0]?.address;
    }

    if (!address) {
      throw new Error("No address to connect to");
    }

    // Cache ahead of time (only necessary if these are super slow)
    // setTimeout(
    //   () => this.getIbcDenomTraceLookupCached(chain),
    //   1000 + Math.random() * 5000,
    // );

    return {
      chain,
      provider: this,
      balances: [],
      address,
    };
  }

  private denomTraceLookupByChain: Record<
    string,
    Promise<Record<string, DenomTrace>>
  > = {};
  async getIbcDenomTraceLookupCached(chain: Chain) {
    const chainId = chain.chainConfig.chainId;
    if (!this.denomTraceLookupByChain[chainId]) {
      const promise = this.getIbcDenomTraceLookup(chain);
      this.denomTraceLookupByChain[chainId] = promise;
      promise.catch((error) => {
        delete this.denomTraceLookupByChain[chainId];
        throw error;
      });
    }
    return this.denomTraceLookupByChain[chainId];
  }
  async refreshDenomTraces(chain: Chain) {
    this.denomTraceLookupByChain[
      chain.chainConfig.chainId
    ] = this.getIbcDenomTraceLookup(chain);
  }
  async getIbcDenomTraceLookup(
    chain: Chain,
  ): Promise<Record<string, DenomTrace>> {
    const chainConfig = getIBCChainConfig(chain);
    const denomTracesRes = await fetch(
      `${chainConfig.restUrl}/ibc/applications/transfer/v1beta1/denom_traces`,
    )
      .catch(async (e) => {
        const queryclient = await this.getQueryClient(chain);
        const { denomTraces } = await queryclient.ibc.transfer.allDenomTraces();
        return {
          ok: true,
          json: () => ({
            denom_traces: denomTraces,
          }),
        };
      })
      .catch((e) => ({
        ok: true,
        json: () => ({
          denom_traces: [],
        }),
      }));
    if (!denomTracesRes.ok)
      throw new Error(`Failed to fetch denomTraces for ${chain.displayName}`);
    const denomTracesJson = await denomTracesRes.json();
    const denomTraces: DenomTrace[] = denomTracesJson.denom_traces.map(
      (data: { path: string; base_denom: string }) => ({
        path: data.path,
        baseDenom: data.base_denom,
      }),
    );

    let validTraces: DenomTrace[] = [];

    if (chain.network === Network.SIFCHAIN) {
      // For sifchain, check for tokens that come from ANY ibc entry

      const ibcEntries = (await this.tokenRegistry.load()).filter(
        (item) => !!item.ibcCounterpartyChannelId,
      );
      validTraces = denomTraces.filter((trace) => {
        const lastChannelInPath = trace.path.split("/").pop();
        return ibcEntries.some(
          (entry) =>
            entry.ibcChannelId === lastChannelInPath ||
            entry.ibcCounterpartyChannelId === lastChannelInPath,
        );
      });
    } else {
      // For other networks, check for tokens that come from specific counterparty channel
      const entry = await this.tokenRegistry.findAssetEntryOrThrow(
        chain.nativeAsset,
      );
      const channelId = entry.ibcCounterpartyChannelId;
      if (!channelId) {
        throw new Error(
          "Cannot trace denoms, not an IBC chain " + chain.displayName,
        );
      }
      validTraces = denomTraces.filter((item) => {
        return item.path.startsWith(`transfer/${channelId}`);
      });
    }

    return Object.fromEntries(
      await Promise.all(
        validTraces.map(async (trace) => {
          return [
            await digestMessage(`${trace.path}/${trace.baseDenom}`),
            trace,
          ];
        }),
      ),
    );
  }

  async fetchBalances(chain: Chain, address: string): Promise<IAssetAmount[]> {
    // permissionless query to get all balances
    const queryClient = await this.getQueryClientCached(chain);
    const balances = await queryClient?.bank.allBalances(address);
    const assetAmounts: IAssetAmount[] = [];

    await Promise.all(
      balances.map(async (coin) => {
        try {
          if (!coin.denom.startsWith("ibc/")) {
            const asset = chain.assets.find(
              (asset) =>
                asset.symbol.toLowerCase() === coin.denom.toLowerCase(),
            );
            assetAmounts.push(AssetAmount(asset || coin.denom, coin.amount));
          } else {
            const ibcDenomTraceLookup = await this.getIbcDenomTraceLookupCached(
              chain,
            );
            const denomTrace = ibcDenomTraceLookup[coin.denom];
            if (!denomTrace) return;

            const baseDenom = denomTrace.baseDenom;

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
