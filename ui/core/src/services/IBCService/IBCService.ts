import {
  SigningStargateClient,
  StargateClient,
  MsgTransferEncodeObject,
  IndexedTx,
  MsgSendEncodeObject,
  AminoTypes,
  SignerData,
  isAminoMsgDelegate,
  AminoConverter,
  SigningStargateClientOptions,
} from "@cosmjs/stargate";
import { OfflineSigner, OfflineDirectSigner } from "@cosmjs/proto-signing";
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
import { fromBase64, toBase64, toUtf8 } from "@cosmjs/encoding";
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
  AuthInfo,
} from "@cosmjs/stargate/build/codec/cosmos/tx/v1beta1/tx";
import { NativeDexClient } from "../../services/utils/SifClient/NativeDexClient";
import {
  SifUnSignedClient,
  Compatible42SigningCosmosClient,
  Compatible42CosmosClient,
} from "../../services/utils/SifClient";
import { BroadcastMode, SigningCosmosClient, StdTx } from "@cosmjs/launchpad";
import { NativeAminoTypes } from "../../services/utils/SifClient/NativeAminoTypes";
import { BroadcastTxResult } from "@cosmjs/launchpad";
import { ChainIdHelper, getTransferTimeoutData } from "./utils";
import { NativeDexTransaction } from "../../services/utils/SifClient/NativeDexTransaction";

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
          if (
            channel.connectionHops.includes("connection-39") ||
            channel.connectionHops.includes("connection-5")
          ) {
            console.log(JSON.stringify(channel, null, 2));
          }
          const counterpartyChannelId = channel.counterparty!.channelId;
          const counterPartyChainId =
            parsedClientState.identified_client_state.client_state.chain_id;
          console.log(counterPartyChainId);
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

    const { channelId } = await this.tokenRegistry.loadConnectionByNetworks({
      sourceNetwork: params.sourceNetwork,
      destinationNetwork: params.destinationNetwork,
    });

    const symbol = params.assetAmountToTransfer.asset.symbol;

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
        sender: fromAccount.address,
        receiver: toAccount.address,
        token: {
          denom: transferDenom,
          amount: params.assetAmountToTransfer.toBigInt().toString(),
        },
        timeoutHeight: timeoutHeight,
      }),
    ];

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

    const feeAmount = getChainsService()
      .get(params.destinationNetwork)
      .calculateTransferFeeToChain(params.assetAmountToTransfer);

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
        fromAddress: fromAccount.address,
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
    console.log({ batches });
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

        const txDraft = new NativeDexTransaction(fromAccount.address, batch, {
          price: {
            denom: sourceChain.keplrChainInfo.feeCurrencies[0].coinDenom,
            amount:
              sourceChain.keplrChainInfo.gasPriceStep?.average.toString() ||
              NativeDexClient.feeTable.transfer.amount[0].amount,
          },
          gas:
            externalGasPrices[sourceChain.chainId] ||
            NativeDexClient.feeTable.transfer.gas,
        });

        const signedTx = await client.sign(txDraft, sendingSigner, {
          sendingChainRestUrl: sourceChain.restUrl,
          sendingChainRpcUrl: sourceChain.rpcUrl,
        });

        const sentTx = await client.broadcast(signedTx, {
          sendingChainRpcUrl: sourceChain.rpcUrl,
          sendingChainRestUrl: sourceChain.restUrl,
        });
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
          transactionHash: "invalidtx",
          hash: new Uint8Array(),
          events: [],
          height: -1,
        } as BroadcastTxResult);
      }
    }
    console.log({ responses });
    return responses;
  }
}

export default function createIBCService(context: IBCServiceContext) {
  return IBCService.create(context);
}

// @mccallofthewild - Will likely want to implement this pattern in the future,
// as the launchpad /txs endpoint will eventually be deprecated.
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
  constructor(
    tmClient: Tendermint34Client | undefined,
    signer: OfflineSigner,
    options: SigningStargateClientOptions,
  ) {
    super(tmClient, signer, options);
    this.sendingSigner = signer as OfflineAminoSigner;
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
