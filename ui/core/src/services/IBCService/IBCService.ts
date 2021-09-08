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
import * as inflection from "inflection";

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
  AminoMsg,
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
import { memoize } from "lodash";
import {
  TxRaw,
  TxBody,
} from "@cosmjs/stargate/build/codec/cosmos/tx/v1beta1/tx";
import { NativeDexClient } from "../../services/utils/SifClient/NativeDexClient";
import { isAminoMsgTransfer } from "@cosmjs/stargate/build/aminomsgs";
import { SifClient, SifUnSignedClient } from "../../services/utils/SifClient";
import { BroadcastMode, SigningCosmosClient, StdTx } from "@cosmjs/launchpad";
import { Registry } from "generated/proto/sifnode/tokenregistry/v1/types";

export interface IBCServiceContext {
  // applicationNetworkEnvironment: NetworkEnv;
  sifRpcUrl: string;
  assets: Asset[];
  chainConfigsByNetwork: NetworkChainConfigLookup;
  sifUnsignedClient?: SifUnSignedClient;
}

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
      ): Promise<OfflineSigner & OfflineAminoSigner> => {
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
  ): Promise<BroadcastTxResponse[]> {
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
        aminoTypes: new AminoTypes({
          additions: createAminoAdditions(),
          prefix: undefined,
        }),
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
        aminoTypes: new AminoTypes({
          additions: createAminoAdditions(),
          prefix: undefined,
        }),
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
    const timeoutHeight = Long.fromNumber(currentHeight + 150);
    const registry = await this.tokenRegistry.load();
    const transferTokenEntry = registry.find((t) => t.baseDenom === symbol);

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
        // timeoutHeight: {
        //   revisionNumber: Long.fromInt(4),
        //   // revisionHeight: timeoutHeight,
        //   // revisionHeight: timeoutHeight,
        // },
        timeoutTimestamp: timeoutTimestampNanoseconds, // timeoutTimestampNanoseconds,
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
    if (feeAmount?.amount.greaterThan("0") && false) {
      console.log("CHARGING FEE");
      const feeEntry = registry.find(
        (item) => item.baseDenom === feeAmount.asset.symbol,
      );
      if (!feeEntry) {
        throw new Error(
          "Failed to find whiteliste entry for fee symbol " +
            feeAmount.asset.symbol,
        );
      }
      const sendFeeMsg: MsgSendEncodeObject = {
        typeUrl: "/cosmos.bank.v1beta1.MsgSend",
        value: {
          fromAddress: fromAccount.address,
          toAddress: IBC_EXPORT_FEE_ADDRESS,
          amount: [
            {
              denom: feeEntry.denom,
              amount: feeAmount.toBigInt().toString(),
            },
          ],
        },
      };
      transferMsgs.unshift(sendFeeMsg);
    }

    const batches = [];
    while (transferMsgs.length) {
      batches.push(transferMsgs.splice(0, maxMsgsPerBatch));
    }
    console.log({ batches });
    const responses: BroadcastTxResponse[] = [];
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

        const aminoTypes = new AminoTypes({
          additions: {},
          prefix: undefined,
        });

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
          responses.push(brdcstTxRes);
        };
        const launchpadSignAndSend = async () => {
          const client = (window as any).services.sif.getClient as SifClient;
          console.log({sifClient: client })

          const signer = keplr?.getOfflineSigner(await sendingStargateClient.getChainId())
          if (!signer) throw "NO"
          const launchpad = new SifClient(
            sourceChain.restUrl,
            fromAccount.address,
            signer,

          // const launchpad = new SigningCosmosClient(
          //   sourceChain.restUrl,
          //   fromAccount.address,
          //   // @ts-ignore
          //   sendingSigner,
          // );
          console.log({ sendingSigner });
          const converter = new AminoTypes();
          const res = await launchpad.signAndBroadcast(
            batch.map(converter.toAmino.bind(converter)),
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
          );
          console.log({ res });
        };
        const customSignAndSendAmino = async () => {
          const t34 = await Tendermint34Client.connect(sourceChain.rpcUrl);
          const client = new NativeSigningClient(t34, sendingSigner, {
            registry: NativeDexClient!.getNativeRegistry(),
          });
          const txRaw = await client.sign(
            fromAccount.address,
            batch,
            sendingStargateClient.fees.transfer,
            "",
          );
          const sig = TxRaw.encode(txRaw).finish();

          //           const sig = await client.signWMeta(
          //             fromAccount.address,
          //             batch,
          //             sendingStargateClient.fees.transfer,
          //             "",
          //             {
          //               chainId,
          //               accountNumber: sequence.accountNumber,
          //               sequence: sequence.sequence,
          //             },
          //           );
          console.log("waiting...");
          await new Promise((r) => setTimeout(r, 5 * 1000));
          console.log("go!");
          const res = await client.broadcastTx(sig);
          console.log({ res });
        };
        // keplrSignAndSend();
        // stargateSignAndSend();
        launchpadSignAndSend();
        // customSignAndSendAmino();
      } catch (e) {
        console.error(e);
        responses.push({
          code:
            +e.message.split("code ").pop().split(" ")[0] || 100000000000000000,
          log: e.message,
          rawLog: e.message,
          transactionHash: "invalidtx",
          hash: new Uint8Array(),
          events: [],
          height: -1,
        } as BroadcastTxResponse);
      }
    }
    console.log({ responses });
    return responses;
  }
}

export default function createIBCService(context: IBCServiceContext) {
  return IBCService.create(context);
}

const createAminoTypeNameFromProtoTypeUrl = (typeUrl: string) => {
  const [_namespace, cosmosModule, _version, messageType] = typeUrl.split(".");
  return `${cosmosModule}/${messageType}`;
};

const convertToSnakeCaseDeep = (obj: any): any => {
  if (typeof obj !== "object") {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => convertToSnakeCaseDeep(item));
  }
  const newObj: any = {};
  for (let prop in obj) {
    newObj[inflection.underscore(prop)] = convertToSnakeCaseDeep(obj[prop]);
  }
  return newObj;
};

const convertToCamelCaseDeep = (obj: any): any => {
  if (typeof obj !== "object") {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => convertToCamelCaseDeep(item));
  }
  const newObj: any = {};
  for (let prop in obj) {
    newObj[inflection.underscore(prop)] = convertToCamelCaseDeep(obj[prop]);
  }
  return newObj;
};

const createAminoAdditions = (): Record<string, AminoConverter> => {
  /* 

    export const liquidityTypes = {
      '/tendermint.liquidity.v1beta1.MsgCreatePool': {
        aminoType: 'liquidity/MsgCreatePool',
        toAmino: ({ poolCreatorAddress, poolTypeId, depositCoins }: MsgCreatePool): AminoMsgCreatePool['value'] => ({
          pool_creator_address: poolCreatorAddress,
          pool_type_id: poolTypeId,
          deposit_coins: [...depositCoins],
        }),
        fromAmino: ({ pool_creator_address, pool_type_id, deposit_coins }: AminoMsgCreatePool['value']): MsgCreatePool => ({
          poolCreatorAddress: pool_creator_address,
          poolTypeId: pool_type_id,
          depositCoins: [...deposit_coins],
        }),
      }
    };

  */
  const aminoAdditions: Record<string, AminoConverter> = {};
  const protogens = NativeDexClient.getGeneratedTypes();
  for (let [typeUrl, _genType] of protogens) {
    if (!typeUrl.includes("sifnode")) continue;
    aminoAdditions[typeUrl] = {
      aminoType: createAminoTypeNameFromProtoTypeUrl(typeUrl),
      toAmino: (value: any): AminoMsg => convertToSnakeCaseDeep(value),
      fromAmino: (value: AminoMsg): any => convertToCamelCaseDeep(value),
    };
  }
  console.log({ aminoAdditions });
  return aminoAdditions;
};

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
    const aminoTypes = new AminoTypes({
      additions: {},
      prefix: undefined,
    });
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
