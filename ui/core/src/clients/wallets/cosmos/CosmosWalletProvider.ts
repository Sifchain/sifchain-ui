import { WalletProvider, WalletProviderContext } from "../WalletProvider";
import TokenRegistryService from "../../../services/TokenRegistryService";
import {
  Chain,
  IBCChainConfig,
  Network,
  IAssetAmount,
  AssetAmount,
} from "../../../entities";
import fetch from "cross-fetch";
import {
  OfflineSigner,
  OfflineDirectSigner,
  EncodeObject,
} from "@cosmjs/proto-signing";
import {
  SigningStargateClient,
  QueryClient,
  setupIbcExtension,
  setupBankExtension,
  setupAuthExtension,
} from "@cosmjs/stargate";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { DenomTrace } from "@cosmjs/stargate/build/codec/ibc/applications/transfer/v1/transfer";
import {
  NativeDexTransaction,
  NativeDexSignedTransaction,
} from "services/utils/SifClient/NativeDexTransaction";
import { BroadcastTxResult } from "@cosmjs/launchpad/build/cosmosclient";
import { DirectSecp256k1HdWalletProvider } from "./DirectSecp256k1HdWalletProvider";

type IBCHashDenomTraceLookup = Record<string, DenomTrace>;

export abstract class CosmosWalletProvider extends WalletProvider {
  tokenRegistry: ReturnType<typeof TokenRegistryService>;

  constructor(public context: WalletProviderContext) {
    super();
    this.tokenRegistry = TokenRegistryService(context);
  }

  isChainSupported(chain: Chain) {
    return chain.chainConfig.chainType === "ibc";
  }

  abstract getSendingSigner(
    chain: Chain,
  ): Promise<OfflineSigner & OfflineDirectSigner>;

  abstract sign(
    tx: NativeDexTransaction<EncodeObject>,
    sendingChain: Chain,
  ): Promise<NativeDexSignedTransaction<EncodeObject>>;

  abstract broadcast(
    tx: NativeDexSignedTransaction<EncodeObject>,
    sendingChain: Chain,
  ): Promise<BroadcastTxResult>;

  getIBCChainConfig(chain: Chain) {
    if (chain.chainConfig.chainType !== "ibc")
      throw new Error("Cannot connect to non-ibc chain " + chain.displayName);
    return chain.chainConfig as IBCChainConfig;
  }

  async createIBCHash(message: string) {
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

  async getStargateClient(chain: Chain) {
    const chainConfig = this.getIBCChainConfig(chain);
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
    const chainConfig = this.getIBCChainConfig(chain);
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

  private denomTraceLookupByChain: Record<
    string,
    Promise<IBCHashDenomTraceLookup>
  > = {};
  async getIBCDenomTraceLookupCached(chain: Chain) {
    const chainId = chain.chainConfig.chainId;
    if (!this.denomTraceLookupByChain[chainId]) {
      const promise = this.getIBCDenomTraceLookup(chain);
      this.denomTraceLookupByChain[chainId] = promise;
      promise.catch((error) => {
        delete this.denomTraceLookupByChain[chainId];
        throw error;
      });
    }
    return this.denomTraceLookupByChain[chainId];
  }
  async getIBCDenomTraceLookup(chain: Chain): Promise<IBCHashDenomTraceLookup> {
    const chainConfig = this.getIBCChainConfig(chain);
    const denomTracesRes = await fetch(
      `${chainConfig.restUrl}/ibc/applications/transfer/v1beta1/denom_traces`,
    );
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
        return item.path.split("/").pop() === channelId;
      });
    }

    return Object.fromEntries(
      await Promise.all(
        validTraces.map(async (trace) => {
          return [
            await this.createIBCHash(`${trace.path}/${trace.baseDenom}`),
            trace,
          ];
        }),
      ),
    );
  }

  async fetchBalances(chain: Chain, address: string): Promise<IAssetAmount[]> {
    const queryClient = await this.getQueryClient(chain);
    const balances = await queryClient?.bank.allBalances(address);

    const assetAmounts: IAssetAmount[] = [];

    const ibcDenomTraceLookup = await this.getIBCDenomTraceLookupCached(chain);

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
