import {
  SigningStargateClient,
  StargateClient,
  MsgTransferEncodeObject,
  BroadcastTxResponse,
  IndexedTx,
  MsgSendEncodeObject,
  AminoTypes,
  SignerData,
  isAminoMsgDelegate,
  AminoConverter,
} from "@cosmjs/stargate";
import { OfflineSigner, OfflineDirectSigner } from "@cosmjs/proto-signing";

const getTransferTimeoutData = async (
  receivingStargateClient: StargateClient,
  desiredTimeoutMinutes: number,
) => {
  const blockTimeMinutes = 7.25 / 60;

  const timeoutBlockDelta = desiredTimeoutMinutes / blockTimeMinutes;

  return {
    revisionNumber: Long.fromNumber(
      +ChainIdHelper.parse(
        await receivingStargateClient.getChainId(),
      ).version.toString() || 0,
    ),
    // Set the timeout height as the current height + 150.
    revisionHeight: Long.fromNumber(
      (await receivingStargateClient.getHeight()) + timeoutBlockDelta,
    ),
  };
};

// Ripped from KEPLR
export class ChainIdHelper {
  // VersionFormatRegExp checks if a chainID is in the format required for parsing versions
  // The chainID should be in the form: `{identifier}-{version}`
  static readonly VersionFormatRegExp = /(.+)-([\d]+)/;

  static parse(
    chainId: string,
  ): {
    identifier: string;
    version: number;
  } {
    const split = chainId
      .split(ChainIdHelper.VersionFormatRegExp)
      .filter(Boolean);
    if (split.length !== 2) {
      return {
        identifier: chainId,
        version: 0,
      };
    } else {
      return { identifier: split[0], version: parseInt(split[1]) };
    }
  }

  static hasChainVersion(chainId: string): boolean {
    const version = ChainIdHelper.parse(chainId);
    return version.identifier !== chainId;
  }
}
/*
 * {
  "chain_id": "sifchain-1",
  "account_number": "9375",
  "sequence": "0",
  "fee": {
    "gas": "120000",
    "amount": [
      {
        "denom": "rowan",
        "amount": "120000000000000000"
      }
    ]
  },
  "msgs": [
    {
      "type": "cosmos-sdk/MsgTransfer",
      "value": {
        "source_port": "transfer",
        "source_channel": "channel-0",
        "token": {
          "denom": "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
          "amount": "10000"
        },
        "sender": "sif1cnfwkwccnt95zzngqlyqx94k6px2qh4v0ezxw4",
        "receiver": "cosmos1shywxv2g8gvjcqknvkxu4p6lkqhfclwwhh0q4u",
        "timeout_height": {
          "revision_number": "4",
          "revision_height": "7604931"
        }
      }
    }
  ],
  "memo": ""
}*/

import {
  Asset,
  IAssetAmount,
  Network,
  getChainsService,
  NetworkChainConfigLookup,
  IBCChainConfig,
} from "../../entities";
import getKeplrProvider from "../SifService/getKeplrProvider";
import { findAttribute, parseRawLog } from "@cosmjs/stargate/build/logs";
import {
  QueryClient,
  setupBankExtension,
  setupIbcExtension,
  setupAuthExtension,
} from "@cosmjs/stargate/build/queries";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { fetch } from "cross-fetch";
import * as IbcTransferV1Tx from "@cosmjs/stargate/build/codec/ibc/applications/transfer/v1/tx";
import Long from "long";
import JSBI from "jsbi";
import { calculateGasForIBCTransfer } from "./utils/calculateGasForIBCTransfer";
import { TokenRegistryService } from "../TokenRegistryService/TokenRegistryService";
import { KeplrWalletProvider } from "../../clients/wallets";
import { IBC_EXPORT_FEE_ADDRESS } from "../../utils/ibcExportFees";
import {
  encodeSecp256k1Pubkey,
  makeSignDoc as makeSignDocAmino,
  OfflineAminoSigner,
  StdFee,
} from "@cosmjs/amino";
import { fromBase64 } from "@cosmjs/encoding";
import { Int53 } from "@cosmjs/math";
import {
  EncodeObject,
  encodePubkey,
  makeAuthInfoBytes,
} from "@cosmjs/proto-signing";
import { SignMode } from "@cosmjs/proto-signing/build/codec/cosmos/tx/signing/v1beta1/signing";
import {
  TxRaw,
  TxBody,
} from "@cosmjs/stargate/build/codec/cosmos/tx/v1beta1/tx";
import { NativeDexClient } from "../utils/SifClient/NativeDexClient";
import {
  SifUnSignedClient,
  Compatible42SigningCosmosClient,
} from "../utils/SifClient";
import { BroadcastMode, SigningCosmosClient, StdTx } from "@cosmjs/launchpad";
import { NativeAminoTypes } from "../utils/SifClient/NativeAminoTypes";
import { BroadcastTxResult } from "@cosmjs/launchpad";

export interface IBCServiceContext {
  // applicationNetworkEnvironment: NetworkEnv;
  sifRpcUrl: string;
  sifApiUrl: string;
  sifChainId: string;
  assets: Asset[];
  chainConfigsByNetwork: NetworkChainConfigLookup;
  sifUnsignedClient?: SifUnSignedClient;
}

type CustomOfflineSignerOutput = Promise<OfflineSigner & OfflineAminoSigner>;

export class IBCService {
  tokenRegistry = TokenRegistryService(this.context);

  keplrProvider = KeplrWalletProvider.create(this.context);

  public transferTimeoutMinutes = 45;

  constructor(private context: IBCServiceContext) {}
  static create(context: IBCServiceContext) {
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

  async extractTransferMetadataFromTx(tx: IndexedTx | BroadcastTxResponse) {
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
    txOrTxHash: string | IndexedTx | BroadcastTxResponse,
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
    const destChainConfig = await this.loadChainConfigByNetwork(network);
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

  async logIBCNetworkMetadata() {
    const allClients = [];
    const destinationNetwork = Network.SIFCHAIN;
    let chainConfig: IBCChainConfig;
    try {
      // if (destinationNetwork === Network.REGEN) throw "";
      chainConfig = this.loadChainConfigByNetwork(destinationNetwork);
    } catch (e) {
      // continue;
    }
    await this.keplrProvider.connect(
      getChainsService().get(destinationNetwork),
    );
    const queryClient = await this.loadQueryClientByNetwork(destinationNetwork);
    const allChannels = await queryClient.ibc.channel.allChannels();
    let clients = await Promise.all(
      allChannels.channels.map(async (channel) => {
        try {
          const parsedClientState = await fetch(
            `${chainConfig.restUrl}/ibc/core/connection/v1beta1/connections/${channel.connectionHops[0]}/client_state`,
          ).then((r) => r.json());

          // console.log(parsedClientState);
          // const allAcks = await queryClient.ibc.channel.allPacketAcknowledgements(
          //   channel.portId,
          //   channel.channelId,
          // );
          const channelId = channel.channelId;
          const counterpartyChannelId = channel.counterparty!.channelId;
          const counterPartyChainId =
            parsedClientState.identified_client_state.client_state.chain_id;
          const counterpartyConfig = this.loadChainConfigByChainId(
            counterPartyChainId,
          );
          const counterpartyQueryClient = await this.loadQueryClientByNetwork(
            counterpartyConfig.network,
          );
          const counterpartyConnection = await counterpartyQueryClient.ibc.channel.channel(
            "transfer",
            counterpartyChannelId,
          );

          return {
            srcChainId: chainConfig.chainId,
            destChainId: counterPartyChainId,
            // ackCount: allAcks.acknowledgements.length,
            srcCxn: channel.connectionHops[0],
            destCxn: counterpartyConnection.channel?.connectionHops[0],
            srcChannel: channelId,
            destChannel: counterpartyChannelId,
          };
        } catch (e) {
          console.error(e);
          return;
        }
      }),
    );
    allClients.push(...clients.filter((c) => c));
    console.log(destinationNetwork.toUpperCase());
    console.table(
      clients.filter((c) => {
        return true;
      }),
    );

    const tokenRegistryEntries = await this.tokenRegistry.load();
    console.log("Sifchain Connections: ");
    console.log(
      JSON.stringify(
        allClients.filter((clientA) => {
          return tokenRegistryEntries.some(
            (e) =>
              e.ibcChannelId === clientA!.srcChannel &&
              e.ibcCounterpartyChannelId === clientA!.destChannel,
          );
        }),
        null,
        2,
      ),
    );
    // for (let clientA of allClients.filter((c) =>
    //   c.chainId.includes("sifchain"),
    // )) {
    //   for (let clientB of allClients) {
    //     if (
    //       clientA.counterPartyChainId === clientB.chainId &&
    //       clientA?.channelId === clientB.counterpartyChannelId &&
    // tokenRegistryEntries.some(
    //   (e) =>
    //     e.ibcChannelId === clientA.channelId &&
    //     e.ibcCounterpartyChannelId === clientA.counterpartyChannelId,
    // )
    //     ) {
    //       connections.push({
    //         srcChainId: clientA.chainId,
    //         destChainId: clientB.chainId,
    //         srcCxn: clientA.connection,
    //         dstCxn: clientB.connection,
    //         srcChannel: clientA.channelId,
    //         destChannel: clientB.channelId,
    //       });
    //     }
    //   }
    // }
  }

  async transferIBCTokens(
    params: {
      sourceNetwork: Network;
      destinationNetwork: Network;
      assetAmountToTransfer: IAssetAmount;
    },
    // Load testing options
    {
      shouldBatchTransfers = false,
      maxMsgsPerBatch = 800,
      maxAmountPerMsg = `9223372036854775807`,
      gasPerBatch = undefined,
      loadOfflineSigner = async (
        chainId: string,
      ): CustomOfflineSignerOutput => {
        const keplr = await getKeplrProvider();
        const signer = await keplr!.getOfflineSigner(chainId);
        const keplrKey = await keplr!.getKey(chainId);
        /* 
          Stargate internally checks if there is a `.signDirect` property
          on the signer to determine whether to use direct or amino signing
        */
        // @ts-ignore
        signer.signDirect = undefined;
        console.log({ signer });
        // @ts-ignore
        if (keplrKey["isNanoLedger"] && signer) {
          // This doesn't seem to make any difference
          // @ts-ignore
          // signer.signAmino = (...args) => keplr?.signAmino(chainId, ...args);
        }
        return signer;
      },
    } = {},
  ): Promise<BroadcastTxResult[]> {
    const sourceChain = this.loadChainConfigByNetwork(params.sourceNetwork);
    const destinationChain = this.loadChainConfigByNetwork(
      params.destinationNetwork,
    );
    console.log({ sourceChain, destinationChain });
    const keplr = await getKeplrProvider();
    await keplr?.experimentalSuggestChain(sourceChain.keplrChainInfo);
    await keplr?.experimentalSuggestChain(destinationChain.keplrChainInfo);
    await keplr?.enable(destinationChain.chainId);
    const recievingSigner = await loadOfflineSigner(destinationChain.chainId);

    if (!recievingSigner) throw new Error("No recieving signer");
    const [toAccount] = (await recievingSigner?.getAccounts()) || [];
    if (!toAccount) throw new Error("No account found for recieving signer");

    await keplr?.enable(sourceChain.chainId);
    const sendingSigner = await loadOfflineSigner(sourceChain.chainId);
    if (!sendingSigner) throw new Error("No sending signer");

    console.log(
      `${params.sourceNetwork}/${await sendingSigner
        .getAccounts()
        .then(([a]) => a.address)} -> ${
        params.destinationNetwork
      }/${await recievingSigner.getAccounts().then(([a]) => a.address)}`,
    );
    const accounts = (await sendingSigner?.getAccounts()) || [];
    const [fromAccount] = accounts;
    console.log(accounts);
    if (!fromAccount) {
      throw new Error("No account found for sending signer");
    }

    const receivingStargateCient = await SigningStargateClient?.connectWithSigner(
      destinationChain.rpcUrl,
      recievingSigner,
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

    const sendingStargateClient = await SigningStargateClient.connectWithSigner(
      sourceChain.rpcUrl,
      sendingSigner,
      {
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

    const { channelId } = await this.tokenRegistry.loadConnectionByNetworks({
      sourceNetwork: params.sourceNetwork,
      destinationNetwork: params.destinationNetwork,
    });

    const symbol = params.assetAmountToTransfer.asset.symbol;

    const timeoutInMinutes = this.transferTimeoutMinutes;
    const timeoutTimestampInSeconds = Math.floor(
      new Date().getTime() / 1000 + 60 * timeoutInMinutes,
    );
    const timeoutTimestampNanoseconds = timeoutTimestampInSeconds
      ? Long.fromNumber(timeoutTimestampInSeconds).multiply(1_000_000_000)
      : undefined;
    const currentHeight = await receivingStargateCient.getHeight();
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

    if (sourceChain.nativeAssetSymbol === transferTokenEntry.baseDenom) {
      // transfering FROM token entry's token's chain: use baseDenom
      transferDenom = transferTokenEntry.baseDenom;
    } else {
      // transfering this entry's token elsewhere: use ibc hash
      transferDenom =
        params.assetAmountToTransfer.asset.ibcDenom || transferTokenEntry.denom;
    }

    const transferMsg: MsgTransferEncodeObject = {
      typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
      value: IbcTransferV1Tx.MsgTransfer.fromPartial({
        sourcePort: "transfer",
        sourceChannel: channelId,
        sender: fromAccount.address,
        receiver: toAccount.address,
        token: {
          denom: transferDenom,
          // denom: symbol,
          amount: params.assetAmountToTransfer.toBigInt().toString(),
        },
        timeoutHeight: timeoutHeight,
      }),
    };

    let encodeMsgs: MsgTransferEncodeObject[] = [transferMsg];
    while (
      shouldBatchTransfers &&
      JSBI.greaterThanOrEqual(
        JSBI.BigInt(encodeMsgs[0].value.token?.amount || "0"),
        // Max uint64
        JSBI.BigInt(maxAmountPerMsg),
      )
    ) {
      encodeMsgs = [...encodeMsgs, ...encodeMsgs].map((tfMsg) => {
        return {
          ...tfMsg,
          value: {
            ...tfMsg.value,
            token: {
              denom: tfMsg.value.token?.denom as string,
              amount: JSBI.divide(
                JSBI.BigInt(tfMsg.value.token?.amount || "0"),
                JSBI.BigInt("2"),
              ).toString(),
            },
          },
        };
      });
    }

    const transferMsgs: Array<MsgTransferEncodeObject | MsgSendEncodeObject> = [
      ...encodeMsgs,
    ];

    const feeAmount = getChainsService()
      .get(params.destinationNetwork)
      .calculateTransferFeeToChain(params.assetAmountToTransfer);
    if (false && feeAmount?.amount.greaterThan("0")) {
      // console.log("CHARGING FEE");
      // const feeEntry = registry.find(
      //   (item) => item.baseDenom === feeAmount.asset.symbol,
      // );
      // if (!feeEntry) {
      //   throw new Error(
      //     "Failed to find whiteliste entry for fee symbol " +
      //       feeAmount.asset.symbol,
      //   );
      // }
      // const sendFeeMsg: MsgSendEncodeObject = {
      //   typeUrl: "/cosmos.bank.v1beta1.MsgSend",
      //   value: {
      //     fromAddress: fromAccount.address,
      //     toAddress: IBC_EXPORT_FEE_ADDRESS,
      //     amount: [
      //       {
      //         denom: feeEntry.denom,
      //         amount: feeAmount.toBigInt().toString(),
      //       },
      //     ],
      //   },
      // };
      // transferMsgs.unshift(sendFeeMsg);
    }

    const batches = [];
    while (transferMsgs.length) {
      batches.push(transferMsgs.splice(0, maxMsgsPerBatch));
    }
    console.log({ batches });
    const responses: BroadcastTxResult[] = [];
    for (let batch of batches) {
      console.log("transfer msg count", batch.length);

      try {
        // const gasPerMessage = 39437;
        // const gasPerMessage = 39437;
        // console.log(JSON.(batch));
        let externalGasPrices: any = {};
        try {
          externalGasPrices = await fetch(
            "https://gas-meter.vercel.app/gas-v1.json",
          )
            .then((r) => r.json())
            .catch((e) => {});
        } catch (e) {}
        const chainId = await sendingStargateClient.getChainId();
        const height = await sendingStargateClient.getHeight();
        const sequence = await sendingStargateClient.getSequence(
          fromAccount.address,
        );
        while (height === (await sendingStargateClient.getHeight())) {
          await new Promise((r) => setTimeout(r, 1000));
        }
        this.context.sifUnsignedClient;
        console.log("api url " + this.context.sifUnsignedClient?.apiUrl);

        const aminoTypes = new NativeAminoTypes();

        const keplrSignAndSend = async () => {
          const signedMsg = await keplr?.signAmino(
            await sendingStargateClient.getChainId(),
            fromAccount.address,
            {
              msgs: batch.map(aminoTypes.toAmino.bind(aminoTypes)),
              fee: sendingStargateClient.fees.transfer,
              chain_id: sourceChain.chainId,
              account_number: sequence.accountNumber.toString(),
              sequence: sequence.sequence.toString(),
              memo: "",
            },
          );

          const brdcstTxResKeplr = await keplr?.sendTx(
            await sendingStargateClient.getChainId(),
            {
              msg: signedMsg!.signed.msgs,
              signatures: [signedMsg!.signature],
              fee: {
                ...sendingStargateClient.fees.transfer,
                amount: [
                  ...sendingStargateClient.fees.transfer.amount.map((amt) => ({
                    ...amt,
                    denom: "uphoton",
                  })),
                ],
              },
              memo: "",
            },
            BroadcastMode.Block,
          );
          console.log({ brdcstTxResKeplr });
        };
        const stargateSignAndSend = async () => {
          const brdcstTxRes = await sendingStargateClient.signAndBroadcast(
            fromAccount.address,
            batch,
            {
              ...sendingStargateClient.fees.transfer,
              // amount: [
              //   {
              //     denom: sourceChain.keplrChainInfo.feeCurrencies[0].coinDenom.toLowerCase(),
              //     amount:
              //       sourceChain.keplrChainInfo.gasPriceStep?.average.toString() ||
              //       "",
              //   },
              // ],
              // ...(externalGasPrices &&
              // externalGasPrices[sourceChain.chainId || ""]
              //   ? {
              //       gas: externalGasPrices[sourceChain.chainId || ""],
              //     }
              //   : {}),
              // gas: gasPerBatch || calculateGasForIBCTransfer(batch.length),
            },
            // "",
            // {
            //   chainId,
            //   accountNumber: sequence.accountNumber,
            //   sequence: sequence.sequence,
            // },
          );
          console.log({ brdcstTxRes });
          // responses.push(brdcstTxRes);
        };
        const launchpadSignAndSend = async () => {
          console.log("launchpadSignAndSend");
          const keplr = await getKeplrProvider();
          const sendingSigner = keplr!.getOfflineSigner(
            await sendingStargateClient.getChainId(),
          );

          const launchpad = new Compatible42SigningCosmosClient(
            sourceChain.restUrl,
            fromAccount.address,
            // @ts-ignore
            sendingSigner,
          );

          console.log({ sendingSigner });
          const converter = new NativeAminoTypes();
          const converted = batch.map(converter.toAmino.bind(converter));
          console.log({ converted });
          const res = await launchpad.signAndBroadcast(converted, {
            ...sendingStargateClient.fees.transfer,
          });
          console.log({ res });
        };
        const customSignAndSendAmino = async () => {
          const t34 = await Tendermint34Client.connect(sourceChain.rpcUrl);
          const client = new NativeSigningClient(t34, sendingSigner, {
            registry: NativeDexClient.getNativeRegistry(),
          });
          // const txRaw = await client.sign(
          //   fromAccount.address,
          //   batch,
          //   sendingStargateClient.fees.transfer,
          //   "",
          // );
          // const sig = TxRaw.encode(txRaw).finish();

          const sig = await client.signWMeta(
            fromAccount.address,
            batch,
            {
              ...sendingStargateClient.fees.transfer,
              amount: sendingStargateClient.fees.transfer.amount.map((amt) => ({
                ...amt,
                denom:
                  sourceChain.keplrChainInfo.feeCurrencies[0].coinMinimalDenom,
              })),
            },
            "",
            {
              chainId,
              accountNumber: sequence.accountNumber,
              sequence: sequence.sequence,
            },
          );
          console.log("waiting...");
          await new Promise((r) => setTimeout(r, 5 * 1000));
          console.log("go!");
          const res = await client.broadcastTx(sig);
          console.log({ res });
        };
        const nativeDexClientSignAndSend = async () => {
          const sifConfig = this.loadChainConfigByNetwork(Network.SIFCHAIN);
          const client = await NativeDexClient.connect(
            sifConfig.rpcUrl,
            sifConfig.restUrl,
            sifConfig.chainId,
          );
          const txDraft = client.tx.ibc.Transfer(
            {
              sender: fromAccount.address,
              receiver: toAccount.address,
              sourcePort: "transfer",
              sourceChannel: channelId || "",
              timeoutTimestamp: (undefined as unknown) as Long,
              token: {
                denom: transferDenom,
                amount: params.assetAmountToTransfer.toBigInt().toString(),
              },
              timeoutHeight,
            },
            fromAccount.address,
          );

          const signedTx = await client.sign(txDraft, sendingSigner, {
            sendingChainRestUrl: sourceChain.restUrl,
            sendingChainRpcUrl: sourceChain.rpcUrl,
          });
          const sentTx = await client.broadcast(signedTx, {
            sendingChainRpcUrl: sourceChain.rpcUrl,
            sendingChainRestUrl: sourceChain.restUrl,
          });
          responses.push(sentTx);
        };
        await nativeDexClientSignAndSend();
        // keplrSignAndSend();
        // stargateSignAndSend();
        // launchpadSignAndSend();
        // customSignAndSendAmino();
      } catch (err) {
        console.error(err);
        const e = err as {
          message: string;
        };
        // responses.push({
        //   code:
        //     +(e?.message?.split("code ")?.pop()?.split(" ")?.[0] || "") ||
        //     100000000000000000,
        //   log: e.message,
        //   rawLog: e.message,
        //   transactionHash: "invalidtx",
        //   hash: new Uint8Array(),
        //   events: [],
        //   height: -1,
        // } as BroadcastTxResponse);
      }
    }
    console.log({ responses });
    return responses;
  }
}

export default function createIBCService(context: IBCServiceContext) {
  return IBCService.create(context);
}

interface NativeSigning {
  sendingSigner: OfflineAminoSigner;
  signWMeta: (
    signerAddress: string,
    messages: readonly EncodeObject[],
    fee: StdFee,
    memo: string,
    signerData: SignerData,
  ) => Promise<Uint8Array>;
}

class NativeSigningClient
  extends SigningStargateClient
  implements NativeSigning {
  sendingSigner: OfflineAminoSigner;
  constructor(...args: any[]) {
    super(args[0], args[1], args[2]);
    this.sendingSigner = args[1];
  }
  async signWMeta(
    signerAddress: string,
    messages: readonly EncodeObject[],
    fee: StdFee,
    memo = "",
    signerData: SignerData,
  ): Promise<Uint8Array> {
    console.log(arguments);
    const { chainId, accountNumber, sequence } = signerData;
    const accountFromSigner = (await this.sendingSigner.getAccounts()).find(
      (account) => account.address === signerAddress,
    );
    if (!accountFromSigner) {
      throw new Error("Failed to retrieve account from signer");
    }

    const aminoTypes = new NativeAminoTypes();
    // @ts-ignore
    console.log(aminoTypes.register);
    const pubkey = encodePubkey(
      encodeSecp256k1Pubkey(accountFromSigner.pubkey),
    );

    const signMode = SignMode.SIGN_MODE_LEGACY_AMINO_JSON;
    const msgs = messages.map((msg) => aminoTypes.toAmino(msg));

    const signDoc = makeSignDocAmino(
      msgs,
      fee,
      chainId,
      memo,
      accountNumber,
      sequence,
    );

    const { signature, signed } = await this.sendingSigner.signAmino(
      signerAddress,
      signDoc,
    );
    const signedTxBody = {
      messages: signed.msgs.map((msg) => aminoTypes.fromAmino(msg)),
      memo: signed.memo,
    };
    const signedTxBodyEncodeObject: EncodeObject = {
      typeUrl: "/cosmos.tx.v1beta1.TxBody",
      value: signedTxBody,
    };
    console.log("this::", this);
    const signedTxBodyBytes = this.registry.encode(signedTxBodyEncodeObject);
    const signedGasLimit = Int53.fromString(signed.fee.gas).toNumber();
    const signedSequence = Int53.fromString(signed.sequence).toNumber();
    const signedAuthInfoBytes = makeAuthInfoBytes(
      [pubkey],
      signed.fee.amount,
      signedGasLimit,
      signedSequence,
      signMode,
    );
    const txRaw: TxRaw = TxRaw.fromPartial({
      bodyBytes: signedTxBodyBytes,
      authInfoBytes: signedAuthInfoBytes,
      signatures: [fromBase64(signature.signature)],
    });

    const enc = TxRaw.encode(txRaw);
    const dec = TxRaw.encode(TxRaw.decode(enc.finish())).finish();
    return dec;
  }
}
