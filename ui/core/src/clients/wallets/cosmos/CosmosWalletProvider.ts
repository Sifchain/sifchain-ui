import { WalletProvider, WalletProviderContext } from "../WalletProvider";
import TokenRegistryService from "../../../services/TokenRegistryService";
import {
  Chain,
  IBCChainConfig,
  Network,
  IAssetAmount,
  AssetAmount,
  IAsset,
  Asset,
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
} from "../../../services/utils/SifClient/NativeDexTransaction";
import { BroadcastTxResult } from "@cosmjs/launchpad";
import { NativeDexClient } from "../../../services/utils/SifClient/NativeDexClient";
import { Coin } from "generated/proto/cosmos/base/coin";
import { createIBCHash } from "../../../utils/createIBCHash";

type IBCHashDenomTraceLookup = Record<string, DenomTrace>;

export abstract class CosmosWalletProvider extends WalletProvider<EncodeObject> {
  tokenRegistry: ReturnType<typeof TokenRegistryService>;

  constructor(public context: WalletProviderContext) {
    super();
    this.tokenRegistry = TokenRegistryService(context);
  }

  isChainSupported(chain: Chain) {
    return chain.chainConfig.chainType === "ibc";
  }

  parseTxResultToStatus(txResult: BroadcastTxResult) {
    return NativeDexClient.parseTxResult(txResult);
  }

  abstract getSendingSigner(
    chain: Chain,
  ): Promise<OfflineSigner & OfflineDirectSigner>;

  async getRequiredApprovalAmount(
    chain: Chain,
    tx: NativeDexTransaction<EncodeObject>,
    amount: IAssetAmount,
  ) {
    return AssetAmount(amount.asset, "0");
  }
  async approve(
    chain: Chain,
    tx: NativeDexTransaction<EncodeObject>,
    amount: IAssetAmount,
  ) {
    throw "not implemented";
  }

  getIBCChainConfig(chain: Chain) {
    if (chain.chainConfig.chainType !== "ibc")
      throw new Error("Cannot connect to non-ibc chain " + chain.displayName);
    return chain.chainConfig as IBCChainConfig;
  }

  createIBCHash = createIBCHash;

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
  async refreshDenomTraces(chain: Chain) {
    this.denomTraceLookupByChain[
      chain.chainConfig.chainId
    ] = this.getIBCDenomTraceLookup(chain);
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

    const hashToTraceMapping: Record<string, DenomTrace> = {};
    for (let denomTrace of denomTraces) {
      const [port, ...channelIds] = denomTrace.path.split("/");
      const hash = await createIBCHash(
        port,
        channelIds[0],
        denomTrace.baseDenom,
      );
      hashToTraceMapping[hash] = denomTrace;
    }
    if (chain.network === Network.SIFCHAIN) {
      // For sifchain, check for tokens that come from ANY ibc entry
      const ibcEntries = (await this.tokenRegistry.load()).filter(
        (item) => !!item.ibcCounterpartyChannelId,
      );
      for (let [hash, trace] of Object.entries(hashToTraceMapping)) {
        const isValid = ibcEntries.some(
          (entry) =>
            trace.path.startsWith(
              "transfer/" + entry.ibcCounterpartyChannelId,
            ) || trace.path.startsWith("transfer/" + entry.ibcChannelId),
        );
        if (!isValid) delete hashToTraceMapping[hash];
      }
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
      for (let hash in hashToTraceMapping) {
        if (
          !hashToTraceMapping[hash].path.startsWith(`transfer/${channelId}`)
        ) {
          delete hashToTraceMapping[hash];
        }
      }
    }

    return hashToTraceMapping;
  }

  async fetchBalances(chain: Chain, address: string): Promise<IAssetAmount[]> {
    const queryClient = await this.getQueryClient(chain);
    const balances = await queryClient?.bank.allBalances(address);

    const assetAmounts: IAssetAmount[] = [];

    const ibcDenomTraceLookup = await this.getIBCDenomTraceLookupCached(chain);
    // console.log(JSON.stringify({ ibcDenomTraceLookup }, null, 2));

    await Promise.all(
      balances.map(async (coin) => {
        if (!+coin.amount) return;
        try {
          if (coin.denom.startsWith("ibc/")) {
            const denomTrace = ibcDenomTraceLookup[coin.denom];
            if (!denomTrace) return;

            const registry = await this.tokenRegistry.load();
            const entry = registry.find((e) => {
              return e.baseDenom === denomTrace.baseDenom;
            });
            if (!entry) return;

            const nativeAsset =
              entry.unitDenom && entry.baseDenom !== entry.unitDenom
                ? chain.lookupAssetOrThrow(entry.unitDenom)
                : chain.lookupAssetOrThrow(entry.baseDenom);

            let asset = chain.assets.find(
              (asset) =>
                asset.symbol.toLowerCase() === nativeAsset.symbol.toLowerCase(),
            );
            if (asset) {
              asset.ibcDenom = coin.denom;
            }
            try {
              const counterpartyAsset = await this.tokenRegistry.loadCounterpartyAsset(
                nativeAsset,
              );
              const assetAmount = AssetAmount(counterpartyAsset, coin.amount);
              assetAmounts.push(
                await this.tokenRegistry.loadNativeAssetAmount(assetAmount),
              );
            } catch (error) {
              // ignore asset, doesnt exist in our list.
            }
          } else {
            let asset = chain.assets.find(
              (asset) =>
                asset.symbol.toLowerCase() === coin.denom.toLowerCase(),
            )!;
            // create asset it doesn't exist and is a precision-adjusted counterparty asset
            const assetAmount = await this.tokenRegistry.loadNativeAssetAmount(
              AssetAmount(asset || coin.denom, coin.amount),
            );
            assetAmounts.push(assetAmount);
          }
        } catch (error) {
          console.error(chain.network, "coin error", coin, error);
        }
      }),
    );

    return assetAmounts;
  }
}
