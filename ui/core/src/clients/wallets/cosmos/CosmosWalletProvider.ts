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
import pLimit from "p-limit";
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

  private denomTraceLookup: Record<
    string,
    Promise<DenomTrace | undefined>
  > = {};
  async getDenomTraceCached(chain: Chain, hash: string) {
    hash = hash.replace("ibc/", "");

    const key = chain.chainConfig.chainId + "_" + hash;
    if (!this.denomTraceLookup[key]) {
      this.denomTraceLookup[key] = this.getDenomTrace(chain, hash).catch(
        (error) => {
          delete this.denomTraceLookup[key];
          return Promise.reject(error);
        },
      );
    }
    return this.denomTraceLookup[key];
  }

  async getDenomTrace(
    chain: Chain,
    hash: string,
  ): Promise<DenomTrace | undefined> {
    const queryClient = await this.getQueryClient(chain);

    const { denomTrace } = await queryClient.ibc.transfer.denomTrace(hash);
    if (!denomTrace) {
      return;
    }

    if (chain.network === Network.SIFCHAIN) {
      // For sifchain, check if the token came from ANY counterparty network
      const ibcEntries = (await this.tokenRegistry.load()).filter(
        (item) => !!item.ibcCounterpartyChannelId,
      );
      const isValid = ibcEntries.some(
        (entry) =>
          denomTrace.path.startsWith(
            "transfer/" + entry.ibcCounterpartyChannelId,
          ) || denomTrace.path.startsWith("transfer/" + entry.ibcChannelId),
      );
      if (!isValid) {
        return;
      }
    } else {
      // For other networks, check for tokens that come from specific counterparty channel
      const entry = await this.tokenRegistry.findAssetEntryOrThrow(
        chain.nativeAsset,
      );
      const channelId = entry.ibcCounterpartyChannelId;
      if (!denomTrace.path.startsWith(`transfer/${channelId}`)) {
        return;
      }
    }
    return denomTrace;
  }

  async fetchBalances(chain: Chain, address: string): Promise<IAssetAmount[]> {
    const queryClient = await this.getQueryClient(chain);
    const balances = await queryClient?.bank.allBalances(address);

    const assetAmounts: IAssetAmount[] = [];

    const limit = pLimit(3);

    await Promise.all(
      balances.map((coin) =>
        limit(async () => {
          if (!+coin.amount) return;

          if (!coin.denom.startsWith("ibc/")) {
            const asset = chain.lookupAsset(coin.denom);

            // create asset it doesn't exist and is a precision-adjusted counterparty asset
            const assetAmount = await this.tokenRegistry.loadNativeAssetAmount(
              AssetAmount(asset || coin.denom, coin.amount),
            );
            assetAmounts.push(assetAmount);
          } else {
            const denomTrace = await this.getDenomTraceCached(
              chain,
              coin.denom,
            );
            if (!denomTrace) {
              return; // Ignore, it's an invalid coin from invalid chain
            }

            const registry = await this.tokenRegistry.load();
            const entry = registry.find((e) => {
              return e.baseDenom === denomTrace.baseDenom;
            });
            if (!entry) return;

            try {
              const nativeAsset =
                entry.unitDenom && entry.baseDenom !== entry.unitDenom
                  ? chain.lookupAssetOrThrow(entry.unitDenom)
                  : chain.lookupAssetOrThrow(entry.baseDenom);

              let asset = chain.assets.find(
                (asset) =>
                  asset.symbol.toLowerCase() ===
                  nativeAsset.symbol.toLowerCase(),
              );
              if (asset) {
                asset.ibcDenom = coin.denom;
              }
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
          }
        }),
      ),
    );

    return assetAmounts;
  }
}
