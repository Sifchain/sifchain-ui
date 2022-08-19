import { BroadcastTxResult, isBroadcastTxFailure } from "@cosmjs/launchpad";
import { EncodeObject, OfflineSigner } from "@cosmjs/proto-signing";
import {
  IndexedTx,
  QueryClient,
  setupAuthExtension,
  setupBankExtension,
  setupIbcExtension,
  SigningStargateClient,
  StargateClient,
} from "@cosmjs/stargate";
import { findAttribute, parseRawLog } from "@cosmjs/stargate/build/logs";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import {
  SifchainEncodeObject,
  SifSigningStargateClient,
} from "../../../clients/sifchain";
import { fetch } from "cross-fetch";
import {
  AssetAmount,
  Chain,
  IAsset,
  IBCChainConfig,
  Network,
  NetworkChainConfigLookup,
} from "../../../entities";
import { calculateIBCExportFee } from "../../../utils/ibcExportFees";
import { parseTxFailure } from "../../../utils/parseTxFailure";
import {
  NativeAminoTypes,
  NativeDexClient,
  NativeDexTransaction,
} from "../../native";
import { SifUnSignedClient } from "../../native/SifClient";
import { TokenRegistry } from "../../native/TokenRegistry";
import { CosmosWalletProvider } from "../../wallets/cosmos/CosmosWalletProvider";
import { BaseBridge, BridgeParams, BridgeTx, IBCBridgeTx } from "../BaseBridge";
import { getTransferTimeoutData } from "./getTransferTimeoutData";

export type IBCBridgeContext = {
  sifRpcUrl: string;
  sifApiUrl: string;
  sifChainId: string;
  assets: IAsset[];
  chainConfigsByNetwork: NetworkChainConfigLookup;
  sifUnsignedClient?: SifUnSignedClient;
};

export class IBCBridge extends BaseBridge<CosmosWalletProvider> {
  tokenRegistry = new TokenRegistry(this.context);

  public transferTimeoutMinutes = 45;

  constructor(public context: IBCBridgeContext) {
    super();
  }
  static create(context: IBCBridgeContext) {
    return new this(context);
  }

  public loadChainConfigByChainId(chainId: string): IBCChainConfig {
    const chainConfig = Object.values(this.context.chainConfigsByNetwork).find(
      (c) => c?.chainId === chainId,
    );
    if (chainConfig?.chainType !== "ibc") {
      throw new Error(`No IBC chain config for network ${chainId}`);
    }
    return chainConfig;
  }

  public loadChainConfigByNetwork(network: Network): IBCChainConfig {
    const chainConfig = this.context.chainConfigsByNetwork[network];
    if (chainConfig?.chainType !== "ibc") {
      throw new Error(`No IBC chain config for network ${network}`);
    }
    return chainConfig;
  }

  async extractTransferMetadataFromTx(tx: IndexedTx | BroadcastTxResult) {
    const logs = parseRawLog(tx.rawLog);
    const sequence = findAttribute(
      logs,
      "send_packet",
      "packet_sequence",
    ).value;
    const dstChannel = findAttribute(
      logs,
      "send_packet",
      "packet_dst_channel",
    ).value;
    const dstPort = findAttribute(logs, "send_packet", "packet_dst_port").value;
    const packet = findAttribute(logs, "send_packet", "packet_data").value;
    const timeoutTimestampNanoseconds = findAttribute(
      logs,
      "send_packet",
      "packet_timeout_timestamp",
    ).value;
    return {
      sequence,
      dstChannel,
      dstPort,
      packet,
      timeoutTimestampNanoseconds,
    };
  }

  async checkIfPacketReceivedByTx(
    txOrTxHash: string | IndexedTx | BroadcastTxResult,
    destinationNetwork: Network,
  ) {
    const sourceChain = this.loadChainConfigByNetwork(destinationNetwork);
    const client = await StargateClient.connect(sourceChain.rpcUrl);
    const tx =
      typeof txOrTxHash === "string"
        ? await client.getTx(txOrTxHash)
        : txOrTxHash;
    if (typeof tx !== "object" || tx === null)
      throw new Error("invalid txOrTxHash. not found");
    const meta = await this.extractTransferMetadataFromTx(tx);
    return this.checkIfPacketReceived(
      destinationNetwork,
      meta.dstChannel,
      meta.dstPort,
      meta.sequence,
    );
  }

  async checkIfPacketReceived(
    network: Network,
    receivingChannelId: string,
    receivingPort: string,
    sequence: string | number,
  ) {
    const didReceive = Promise.resolve()
      .then(async () => {
        const queryClient = await this.loadQueryClientByNetwork(network);
        const receipt = await queryClient.ibc.channel.packetReceipt(
          receivingPort,
          receivingChannelId,
          +sequence,
        );
        return receipt.received;
      })
      .catch(() => {
        return fetch(
          `${
            this.loadChainConfigByNetwork(network).restUrl
          }/ibc/core/channel/v1beta1/channels/${receivingChannelId}/ports/${receivingPort}/packet_receipts/${sequence}`,
        ).then((r) =>
          r.json().then((res) => {
            return res.received;
          }),
        );
      });
    return didReceive;
  }
  async loadQueryClientByNetwork(network: Network) {
    const destChainConfig = this.loadChainConfigByNetwork(network);
    const tendermintClient = await Tendermint34Client.connect(
      destChainConfig.rpcUrl,
    );
    const queryClient = QueryClient.withExtensions(
      tendermintClient,
      setupIbcExtension,
      setupBankExtension,
      setupAuthExtension,
    );

    return queryClient;
  }

  private async resolveBridgeParamsForImport(
    params: BridgeParams,
  ): Promise<BridgeParams> {
    const { ...paramsCopy } = params;
    if (
      params.toChain.network === Network.SIFCHAIN &&
      params.fromChain.chainConfig.chainType === "ibc"
    ) {
      paramsCopy.assetAmount =
        await this.tokenRegistry.loadCounterpartyAssetAmount(
          params.assetAmount,
        );
    }
    return paramsCopy;
  }

  private gasPrices: Record<string, string> = {};
  private lastFetchedGasPricesAt = 0;
  async fetchTransferGasFee(fromChain: Chain) {
    if (Date.now() - this.lastFetchedGasPricesAt > 5 * 60 * 1000) {
      try {
        this.gasPrices = await fetch(
          "https://gas-meter.vercel.app/gas-v1.json",
        ).then((r) => {
          return r.json();
        });
        this.lastFetchedGasPricesAt = Date.now();
      } catch (error) {
        this.gasPrices = {};
      }
    }
    return AssetAmount(
      fromChain.nativeAsset,
      this.gasPrices[fromChain.chainConfig.chainId] ||
        NativeDexClient.feeTable.transfer.gas,
    );
  }

  async bridgeTokens(
    provider: CosmosWalletProvider,
    _params: BridgeParams,
    // Load testing options
    { maxMsgsPerBatch = 800 } = {},
  ): Promise<BroadcastTxResult[]> {
    const params = await this.resolveBridgeParamsForImport(_params);
    const toChainConfig = provider.getIBCChainConfig(params.toChain);
    const fromChainConfig = provider.getIBCChainConfig(params.fromChain);
    const receivingSigner = await provider.getSendingSigner(params.toChain);

    const receivingStargateCient =
      await SigningStargateClient.connectWithSigner(
        toChainConfig.rpcUrl,
        receivingSigner,
        {
          // we create amino additions, but these will not be used, because IBC types are already included & assigned
          // on top of the amino additions by default
          aminoTypes: new NativeAminoTypes(),
        },
      );

    const { channelId } = await this.tokenRegistry.loadConnection({
      fromChain: params.fromChain,
      toChain: params.toChain,
    });

    if (!channelId) {
      throw new Error("Channel id not found");
    }

    const symbol = params.assetAmount.asset.symbol;
    const registry = await this.tokenRegistry.load();
    const transferTokenEntry = registry.find((t) => t.baseDenom === symbol);

    const timeoutHeight = await getTransferTimeoutData(
      receivingStargateCient,
      this.transferTimeoutMinutes,
    );

    if (!transferTokenEntry) {
      throw new Error("Invalid transfer symbol not in whitelist: " + symbol);
    }

    let transferDenom: string;
    const isEthereumAsset =
      params.assetAmount.homeNetwork === Network.ETHEREUM ||
      params.assetAmount.symbol.toLowerCase() === "rowan";
    if (
      // Use baseDenom when transferring cosmos asset from native chain
      params.fromChain.chainConfig.chainId ===
        transferTokenEntry.ibcCounterpartyChainId ||
      //
      // Also use baseDenom for transferring eth asset out of sifchain
      (params.fromChain.network === Network.SIFCHAIN && isEthereumAsset)
    ) {
      transferDenom = transferTokenEntry.baseDenom;
    } else {
      // Otherwise generate IBC hash based upon asset's transfer path
      const ibcDenom = transferTokenEntry.denom.startsWith("ibc/")
        ? transferTokenEntry.denom
        : await provider.createIBCHash(
            "transfer",
            channelId!,
            transferTokenEntry.denom,
          );
      // transfering this entry's token elsewhere: use ibc hash
      transferDenom = params.assetAmount.asset.ibcDenom || ibcDenom;
    }

    const sifConfig = this.loadChainConfigByNetwork(Network.SIFCHAIN);

    const nativeClient = await NativeDexClient.connect(
      sifConfig.rpcUrl,
      sifConfig.restUrl,
      sifConfig.chainId,
    );

    const encodeMsgs: EncodeObject[] = [
      nativeClient.tx.ibc.Transfer.createRawEncodeObject({
        sourcePort: "transfer",
        sourceChannel: channelId,
        sender: params.fromAddress,
        receiver: params.toAddress,
        token: {
          denom: transferDenom,
          amount: params.assetAmount.toBigInt().toString(),
        },
        timeoutHeight: timeoutHeight,
      }),
    ];

    const batches = [];
    while (encodeMsgs.length) {
      batches.push(encodeMsgs.splice(0, maxMsgsPerBatch));
    }

    const responses: BroadcastTxResult[] = [];

    for (let batch of batches) {
      try {
        const gasAssetAmount = await this.fetchTransferGasFee(params.fromChain);

        const txDraft = new NativeDexTransaction(params.fromAddress, batch, {
          price: {
            denom: params.fromChain.nativeAsset.symbol,
            amount:
              fromChainConfig.keplrChainInfo.gasPriceStep?.high.toString() ||
              NativeDexClient.feeTable.transfer.amount[0].amount,
          },
          gas:
            // crank the gas when a decimal conversion is occuring on sifnode
            transferTokenEntry.ibcCounterpartyDenom &&
            transferTokenEntry.ibcCounterpartyDenom !== transferTokenEntry.denom
              ? "500000"
              : gasAssetAmount.toBigInt().toString(),
        });

        if (params.fromChain.chainConfig.chainType === "ibc") {
          const isImport =
            params.toChain.chainConfig.chainId === sifConfig.chainId;

          if (isImport) {
            // TODO: this bit may not be compatible with
            // foreign chains that are on cosmos sdk .45+
            const signedTx = await provider.sign(params.fromChain, txDraft);
            const sentTx = await provider.broadcast(params.fromChain, signedTx);

            responses.push(sentTx);
          } else {
            /**
             * this check is needed to allow keplr to select the correct signer mode (e.g. direct vs. amino)
             * and therefore support ledger for signing the transaction
             */
            const sendingSigner: OfflineSigner =
              "getOfflineSignerAuto" in provider &&
              // using any here because importing @sifchain/wallet-keplr causes a circular dependency
              typeof (provider as any).getOfflineSignerAuto === "function"
                ? await (provider as any).getOfflineSignerAuto(params.fromChain)
                : await provider.getSendingSigner(params.fromChain);

            const sendingClient =
              await SifSigningStargateClient.connectWithSigner(
                params.fromChain.chainConfig.rpcUrl,
                sendingSigner,
                {
                  // we create amino additions, but these will not be used, because IBC types are already included & assigned
                  // on top of the amino additions by default
                  aminoTypes: new NativeAminoTypes(),
                },
              );
            const sentTx = await sendingClient.signAndBroadcast(
              txDraft.fromAddress,
              txDraft.msgs as SifchainEncodeObject[],
              {
                amount: [txDraft.fee.price],
                gas: txDraft.fee.gas,
              },
            );
            responses.push(sentTx as BroadcastTxResult);
          }
        }
      } catch (err) {
        console.error(err);
        const e = err as {
          message: string;
        };
        responses.push({
          code:
            +(e?.message?.split("code ")?.pop()?.split(" ")?.[0] || "") ||
            100000000000000000,
          log: e.message,
          rawLog: e.message,
          transactionHash: "",
          hash: new Uint8Array(),
          events: [],
          height: -1,
        } as BroadcastTxResult);
      }
    }
    console.log({ responses });
    return responses;
  }

  estimateFees(wallet: CosmosWalletProvider, params: BridgeParams) {
    if (params.toChain.network !== Network.SIFCHAIN) {
      return calculateIBCExportFee(params.assetAmount);
    } else {
      return undefined;
    }
  }

  // No approvals needed for IBC transfers.
  async approveTransfer(provider: CosmosWalletProvider, params: BridgeParams) {}

  async transfer(provider: CosmosWalletProvider, params: BridgeParams) {
    const responses = await this.bridgeTokens(provider, params);

    // Get the last of the batched tx first.
    for (let txResult of responses.reverse()) {
      if (isBroadcastTxFailure(txResult)) {
        throw new Error(parseTxFailure(txResult).memo);
      }
      const logs = parseRawLog(txResult.rawLog);

      // Abort if not IBC transfer tx receipt (eg a fee payment)
      if (
        !logs.some((item) =>
          item.events.some((ev) => ev.type === "ibc_transfer"),
        )
      ) {
        continue;
      }

      return {
        type: "ibc",
        ...params,
        hash: txResult.transactionHash,
        meta: {
          logs,
        },
      } as IBCBridgeTx;
    }
    throw new Error("No transactions sent");
  }

  async waitForTransferComplete(
    provider: CosmosWalletProvider,
    tx: BridgeTx,
    onUpdate?: (update: Partial<BridgeTx>) => void,
  ) {
    const ibcTx = tx as IBCBridgeTx;
    // Filter out non-ibc tx from logs like fee transfers
    const logs = ibcTx.meta?.logs?.filter((item) =>
      item.events.some((ev) => ev.type === "ibc_transfer"),
    );
    if (!logs) return false;

    const sequence = findAttribute(logs, "send_packet", "packet_sequence");
    const dstChannel = findAttribute(logs, "send_packet", "packet_dst_channel");
    const dstPort = findAttribute(logs, "send_packet", "packet_dst_port");
    const timeoutHeight = findAttribute(
      logs,
      "send_packet",
      "packet_timeout_height",
    );

    // timeoutHeight comes back from logs in format with `1-` in front sometimes.
    // i.e.: {value: '1-2048035'}
    let timeoutHeightValue = parseInt(
      timeoutHeight.value.split("-")[1] || timeoutHeight.value,
    );

    const config = tx.toChain.chainConfig as IBCChainConfig;
    const client = await SigningStargateClient.connectWithSigner(
      config.rpcUrl,
      await provider.getSendingSigner(tx.toChain),
    );

    while (true) {
      await new Promise((r) => setTimeout(r, 5000));

      const blockHeight = await client.getHeight();
      if (blockHeight >= timeoutHeightValue) {
        throw new Error("Timed out waiting for packet receipt");
      }
      try {
        const received = await this.checkIfPacketReceived(
          tx.toChain.network,
          dstChannel.value,
          dstPort.value,
          sequence.value,
        );
        if (received) {
          return true;
        }
      } catch (e) {}
    }
  }
}
export default IBCBridge.create;
