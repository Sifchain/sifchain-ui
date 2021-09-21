import {
  BroadcastTxResult,
  isBroadcastTxFailure,
} from "@cosmjs/launchpad/build/cosmosclient";
import { EncodeObject } from "@cosmjs/proto-signing";
import {
  IndexedTx,
  SigningStargateClient,
  StargateClient,
} from "@cosmjs/stargate";
import {
  findAttribute,
  parseRawLog,
  parseLogs,
} from "@cosmjs/stargate/build/logs";
import {
  QueryClient,
  setupAuthExtension,
  setupBankExtension,
  setupIbcExtension,
} from "@cosmjs/stargate/build/queries";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { fetch } from "cross-fetch";
import {
  Asset,
  IBCChainConfig,
  Network,
  NetworkChainConfigLookup,
  TransactionStatus,
} from "../../../entities";
import { TokenRegistryService } from "../../../services/TokenRegistryService/TokenRegistryService";
import { SifUnSignedClient } from "../../../services/utils/SifClient";
import { NativeAminoTypes } from "../../../services/utils/SifClient/NativeAminoTypes";
import { NativeDexClient } from "../../../services/utils/SifClient/NativeDexClient";
import { NativeDexTransaction } from "../../../services/utils/SifClient/NativeDexTransaction";
import {
  calculateIBCExportFee,
  IBC_EXPORT_FEE_ADDRESS,
} from "../../../utils/ibcExportFees";
import { CosmosWalletProvider } from "../../wallets/CosmosWalletProvider";
import {
  BaseBridge,
  BridgeParams,
  ExecutableTx,
  IBCBridgeTx,
  BridgeTx,
} from "../_BaseBridge";
import { getTransferTimeoutData } from "./getTransferTimeoutData";
import { parseTxFailure } from "../../../services/SifService/parseTxFailure";

export type IBCBridgeContext = {
  // applicationNetworkEnvironment: NetworkEnv;
  sifRpcUrl: string;
  sifApiUrl: string;
  sifChainId: string;
  assets: Asset[];
  chainConfigsByNetwork: NetworkChainConfigLookup;
  sifUnsignedClient?: SifUnSignedClient;
  cosmosWalletProvider: CosmosWalletProvider;
};

export class IBCBridge extends BaseBridge {
  tokenRegistry = TokenRegistryService(this.context);

  public transferTimeoutMinutes = 45;

  constructor(public context: IBCBridgeContext) {
    super();
  }
  static create(context: IBCBridgeContext) {
    return new this(context);
  }

  public loadChainConfigByChainId(chainId: string): IBCChainConfig {
    // @ts-ignore
    const chainConfig = Object.values(this.context.chainConfigsByNetwork).find(
      (c) => c?.chainId === chainId,
    );
    if (chainConfig?.chainType !== "ibc") {
      throw new Error(`No IBC chain config for network ${chainId}`);
    }
    return chainConfig;
  }
  public loadChainConfigByNetwork(network: Network): IBCChainConfig {
    // @ts-ignore
    const chainConfig = this.context.chainConfigsByNetwork[network];
    if (chainConfig?.chainType !== "ibc") {
      throw new Error(`No IBC chain config for network ${network}`);
    }
    return chainConfig;
  }

  async extractTransferMetadataFromTx(tx: IndexedTx | BroadcastTxResult) {
    const logs = parseRawLog(tx.rawLog);
    const sequence = findAttribute(logs, "send_packet", "packet_sequence")
      .value;
    const dstChannel = findAttribute(logs, "send_packet", "packet_dst_channel")
      .value;
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
    const res: {
      received: boolean;
      proof: null | string;
      proof_height: {
        revision_number: string;
        revision_height: string;
      };
    } = await fetch(
      `${
        this.loadChainConfigByNetwork(network).restUrl
      }/ibc/core/channel/v1beta1/channels/${receivingChannelId}/ports/${receivingPort}/packet_receipts/${sequence}`,
    ).then((r) => r.json());
    return res.received;
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

  async bridgeTokens(
    params: BridgeParams,
    // Load testing options
    {
      shouldBatchTransfers = false,
      maxMsgsPerBatch = 800,
      maxAmountPerMsg = `9223372036854775807`,
      gasPerBatch = undefined,
    } = {},
  ): Promise<BroadcastTxResult[]> {
    console.log("transferIBCTokens", params);

    const provider = this.context.cosmosWalletProvider;

    const toChainConfig = provider.getIBCChainConfig(params.toChain);
    const fromChainConfig = provider.getIBCChainConfig(params.fromChain);
    const receivingSigner = await provider.getSendingSigner(params.toChain);

    const receivingStargateCient = await SigningStargateClient?.connectWithSigner(
      toChainConfig.rpcUrl,
      receivingSigner,
      {
        // we create amino additions, but these will not be used, because IBC types are already included & assigned
        // on top of the amino additions by default
        aminoTypes: new NativeAminoTypes(),
        gasLimits: {
          send: 80000,
          transfer: 250000,
          delegate: 250000,
          undelegate: 250000,
          redelegate: 250000,
          // The gas multiplication per rewards.
          withdrawRewards: 140000,
          govVote: 250000,
        },
      },
    );

    const { channelId } = await this.tokenRegistry.loadConnection({
      fromChain: params.fromChain,
      toChain: params.toChain,
    });

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
    if (
      params.fromChain.chainConfig.nativeAssetSymbol ===
      transferTokenEntry.baseDenom
    ) {
      // transfering FROM token entry's token's chain: use baseDenom
      transferDenom = transferTokenEntry.baseDenom;
    } else {
      // transfering this entry's token elsewhere: use ibc hash
      transferDenom =
        params.assetAmount.asset.ibcDenom || transferTokenEntry.denom;
    }

    const sifConfig = this.loadChainConfigByNetwork(Network.SIFCHAIN);
    const client = await NativeDexClient.connect(
      sifConfig.rpcUrl,
      sifConfig.restUrl,
      sifConfig.chainId,
    );
    if (!channelId) throw new Error("Channel id not found");

    let encodeMsgs: EncodeObject[] = [
      client.tx.ibc.Transfer.createRawEncodeObject({
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

    // TODO estimateFees()
    const feeAmount = await this.estimateFees(params);

    if (feeAmount?.amount.greaterThan("0")) {
      const feeEntry = registry.find(
        (item) => item.baseDenom === feeAmount.asset.symbol,
      );
      if (!feeEntry) {
        throw new Error(
          "Failed to find whiteliste entry for fee symbol " +
            feeAmount.asset.symbol,
        );
      }
      const sendFeeMsg = client.tx.bank.Send.createRawEncodeObject({
        fromAddress: params.fromAddress,
        toAddress: IBC_EXPORT_FEE_ADDRESS,
        amount: [
          {
            denom: feeEntry.denom,
            amount: feeAmount.toBigInt().toString(),
          },
        ],
      });
      encodeMsgs.unshift(sendFeeMsg);
    }

    const batches = [];
    while (encodeMsgs.length) {
      batches.push(encodeMsgs.splice(0, maxMsgsPerBatch));
    }

    console.log(JSON.stringify(batches, null, 2));
    const responses: BroadcastTxResult[] = [];

    for (let batch of batches) {
      try {
        let externalGasPrices: any = {};
        try {
          const prices = await fetch(
            "https://gas-meter.vercel.app/gas-v1.json",
          ).then((r) => {
            return r.json();
          });
          externalGasPrices = prices;
        } catch (e) {
          externalGasPrices = {};
        }
        externalGasPrices =
          typeof externalGasPrices === "object" ? externalGasPrices : {};

        const txDraft = new NativeDexTransaction(params.fromAddress, batch, {
          price: {
            denom: params.fromChain.nativeAsset.symbol,
            amount:
              fromChainConfig.keplrChainInfo.gasPriceStep?.average.toString() ||
              NativeDexClient.feeTable.transfer.amount[0].amount,
          },
          gas:
            externalGasPrices[fromChainConfig.chainId] ||
            NativeDexClient.feeTable.transfer.gas,
        });
        console.log("txDraft", require("util").inspect(txDraft));

        const signedTx = await provider.sign(txDraft, params.fromChain);

        const sentTx = await provider.broadcast(signedTx, params.fromChain);

        responses.push(sentTx);
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

  async estimateFees(params: BridgeParams) {
    if (params.toChain.network !== Network.SIFCHAIN) {
      return calculateIBCExportFee(params.assetAmount);
    } else {
      return undefined;
    }
  }

  transfer(params: BridgeParams) {
    return new ExecutableTx(async (emit) => {
      emit({ type: "signing" });
      const responses = await this.bridgeTokens(params);

      for (let tx of responses) {
        if (isBroadcastTxFailure(tx)) {
          emit({
            type: "tx_error",
            tx: parseTxFailure({
              transactionHash: tx.transactionHash,
              rawLog: tx.rawLog || "",
            }),
          });
          return;
        } else {
          const logs = parseRawLog(tx.rawLog);
          emit({
            type: "sent",
            tx: { state: "completed", hash: tx.transactionHash },
          });

          return {
            ...params,
            fromChain: params.fromChain,
            toChain: params.toChain,
            hash: tx.transactionHash,
            meta: { logs },
          } as IBCBridgeTx;
        }
      }
    });
  }

  async *subscribeToTransfer(tx: BridgeTx): AsyncGenerator<TransactionStatus> {
    tx = tx as IBCBridgeTx;
    // Filter out non-ibc tx from logs like fee transfers
    const logs = tx.meta?.logs?.filter((item) =>
      item.events.some((ev) => ev.type === "ibc_transfer"),
    );
    if (!logs) return;

    yield {
      state: "accepted",
      hash: tx.hash,
    };

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
    const client = await SigningStargateClient?.connectWithSigner(
      config.rpcUrl,
      await this.context.cosmosWalletProvider.getSendingSigner(tx.toChain),
    );

    while (true) {
      await new Promise((r) => setTimeout(r, 5000));

      const blockHeight = await client.getHeight();
      if (blockHeight >= timeoutHeightValue) {
        yield {
          state: "failed",
          hash: tx.hash,
          memo: "Timed out waiting for packet receipt",
        };
        break;
      }
      try {
        const received = await this.checkIfPacketReceived(
          tx.toChain.network,
          dstChannel.value,
          dstPort.value,
          sequence.value,
        );
        if (received) {
          yield {
            state: "completed",
            hash: tx.hash,
          };
          return;
        }
      } catch (e) {}
    }
  }
}
export default IBCBridge.create;
