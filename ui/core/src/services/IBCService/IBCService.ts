import {
  BroadcastTxFailure,
  SigningStargateClient,
  StargateClient,
  defaultRegistryTypes,
  defaultGasLimits,
  MsgTransferEncodeObject,
  BroadcastTxResponse,
  isBroadcastTxFailure,
} from "@cosmjs/stargate";
import { IBCChainConfig } from "./IBCChainConfig";
import {
  Amount,
  Asset,
  AssetAmount,
  IAssetAmount,
  Network,
  IAsset,
  getChainsService,
} from "../../entities";
import { loadConnectionByChainIds } from "./loadConnectionByChainIds";
import getKeplrProvider from "../SifService/getKeplrProvider";
import { IWalletService } from "../IWalletService";
import { parseRawLog } from "@cosmjs/stargate/build/logs";
import {
  QueryClient,
  setupBankExtension,
  setupIbcExtension,
  setupAuthExtension,
  createProtobufRpcClient,
} from "@cosmjs/stargate/build/queries";
import {
  BroadcastTxCommitResponse,
  BroadcastTxParams,
  BroadcastTxSyncResponse,
  Tendermint34Client,
} from "@cosmjs/tendermint-rpc";
import { QueryClientImpl } from "@cosmjs/stargate/build/codec/cosmos/distribution/v1beta1/query";
import { ValueOp } from "@cosmjs/stargate/build/codec/tendermint/crypto/proof";
import { setupMintExtension } from "@cosmjs/launchpad";
import { QueryDenomTraceResponse } from "@cosmjs/stargate/build/codec/ibc/applications/transfer/v1/query";
import { getNetworkEnv, NetworkEnv } from "../../config/getEnv";
import { chainConfigByNetworkEnv } from "./ibc-chains";
import { fetch } from "cross-fetch";
import { DirectSecp256k1HdWallet, Registry } from "@cosmjs/proto-signing";
import * as IbcTransferV1Tx from "@cosmjs/stargate/build/codec/ibc/applications/transfer/v1/tx";
import Long from "long";
import JSBI from "jsbi";

export interface IBCServiceContext {
  // applicationNetworkEnvironment: NetworkEnv;
  assets: Asset[];
}

export class IBCService {
  networkDenomLookup: Record<Network, Record<string, string>> = {
    ethereum: {},
    cosmoshub: {},
    sifchain: {},
  };
  symbolLookup: Record<string, string> = {};

  constructor(private context: IBCServiceContext) {}
  static create(context: IBCServiceContext) {
    return new this(context);
  }

  public loadChainConfigByNetwork(network: Network): IBCChainConfig {
    this.context;

    // @ts-ignore
    const env = NetworkEnv.TESTNET_042_IBC;
    const chainConfig = chainConfigByNetworkEnv[env][network];
    if (!chainConfig) {
      throw new Error(`No chain config for network ${network}`);
    }
    return chainConfig;
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

  async getIBCDenom(asset: IAsset) {
    const queryClient = await this.loadQueryClientByNetwork(Network.COSMOSHUB);
    const allChannels = await queryClient.ibc.channel.allChannels();
  }

  async loadDestinationChainTxBySourceChainTxHash(
    sourceChainTxHash: string,
    sourceNetwork: Network,
    destinationNetwork: Network,
  ) {
    // const wallet = await this.createWalletByNetwork(sourceNetwork);
    const queryClient = await this.loadQueryClientByNetwork(destinationNetwork);
    queryClient;
    const allChannels = await queryClient.ibc.channel.allChannels();
    const clients = await Promise.all(
      allChannels.channels.map(async (channel) => {
        const parsedClientState = await fetch(
          `${
            this.loadChainConfigByNetwork(destinationNetwork).restUrl
          }/ibc/core/connection/v1beta1/connections/${
            channel.connectionHops[0]
          }/client_state`,
        ).then((r) => r.json());

        // const allAcks = await queryClient.ibc.channel.allPacketAcknowledgements(
        //   channel.portId,
        //   channel.channelId,
        // );

        return {
          chainId:
            parsedClientState.identified_client_state.client_state.chain_id,
          // ackCount: allAcks.acknowledgements.length,
          connection: channel.connectionHops[0],
          channelId: channel.channelId,
          counterpartyChannelId: channel.counterparty?.channelId,
        };
      }),
    );
    // console.table(
    //   clients.filter((c) => {
    //     if (destinationNetwork === Network.COSMOSHUB) {
    //       return c.chainId.includes("sifchain");
    //     }
    //     return true;
    //   }),
    // );
    const allCxns = await Promise.all(
      (await queryClient.ibc.connection.allConnections()).connections.map(
        async (cxn) => {
          return {
            cxn,
          };
        },
      ),
    );
    // console.log({ sourceNetwork, allChannels, allCxns, clients });

    // const tx = await wallet.client.getTx(sourceChainTxHash);
    // parseRawLog(tx?.rawLog);
  }

  async createWalletByNetwork(network: Network) {
    const keplr = await getKeplrProvider();
    const sourceChain = this.loadChainConfigByNetwork(network);
    await keplr?.experimentalSuggestChain(sourceChain.keplrChainInfo);
    await keplr?.enable(sourceChain.chainId);
    const sendingSigner = await keplr?.getOfflineSigner(sourceChain.chainId);
    if (!sendingSigner)
      throw new Error("No sending signer for " + sourceChain.chainId);
    const stargate = await SigningStargateClient?.connectWithSigner(
      sourceChain.rpcUrl,
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

    const addresses = (await sendingSigner.getAccounts()).map(
      (acc) => acc.address,
    );
    const balances = await this.getAllBalances({
      client: stargate,
      network,
      address: addresses[0],
    });

    return {
      client: stargate,
      addresses,
      balances,
    };
  }

  async getAllBalances(params: {
    network: Network;
    client: StargateClient;
    address: string;
  }) {
    const sourceChain = this.loadChainConfigByNetwork(params.network);
    const queryClient = await this.loadQueryClientByNetwork(params.network);
    const balances = await params.client.getAllBalances(params.address);
    const assetAmounts: IAssetAmount[] = [];

    for (let balance of balances) {
      try {
        let symbol = balance.denom;
        let denomTrace: QueryDenomTraceResponse | null = null;
        if (balance.denom.startsWith("ibc/")) {
          denomTrace = await queryClient.ibc.transfer.denomTrace(
            balance.denom.split("/")[1],
          );
          symbol = denomTrace.denomTrace?.baseDenom ?? symbol;
          this.networkDenomLookup[sourceChain.network as Network][symbol] =
            balance.denom;
          this.symbolLookup[balance.denom] = symbol;
        }

        let asset = getChainsService()
          ?.getByNetwork(params.network)
          .assets.find((a) => a.symbol === symbol);

        if (asset && balance.denom.startsWith("ibc/")) {
          asset.ibcDenom = balance.denom;
        }
        const assetAmount = AssetAmount(asset || symbol, balance?.amount);
        assetAmounts.push(assetAmount);
      } catch (e) {
        console.error(e);
      }
    }

    return assetAmounts;
  }

  async transferIBCTokens(params: {
    sourceNetwork: Network;
    destinationNetwork: Network;
    assetAmountToTransfer: IAssetAmount;
  }): Promise<BroadcastTxResponse[]> {
    const sourceChain = this.loadChainConfigByNetwork(params.sourceNetwork);
    const destinationChain = this.loadChainConfigByNetwork(
      params.destinationNetwork,
    );
    const keplr = await getKeplrProvider();
    await keplr?.experimentalSuggestChain(sourceChain.keplrChainInfo);
    await keplr?.experimentalSuggestChain(destinationChain.keplrChainInfo);
    await keplr?.enable(destinationChain.chainId);
    const recievingSigner = await keplr?.getOfflineSigner(
      destinationChain.chainId,
    );
    if (!recievingSigner) throw new Error("No recieving signer");
    const [toAccount] = (await recievingSigner?.getAccounts()) || [];
    if (!toAccount) throw new Error("No account found for recieving signer");

    await keplr?.enable(sourceChain.chainId);
    const sendingSigner = await keplr?.getOfflineSigner(sourceChain.chainId);
    if (!sendingSigner) throw new Error("No sending signer");

    console.log(
      `${params.sourceNetwork}/${await sendingSigner
        .getAccounts()
        .then(([a]) => a.address)} -> ${
        params.destinationNetwork
      }/${await recievingSigner.getAccounts().then(([a]) => a.address)}`,
    );
    const [fromAccount] = (await sendingSigner?.getAccounts()) || [];
    if (!fromAccount) {
      throw new Error("No account found for sending signer");
    }

    const receivingStargateCient = await SigningStargateClient?.connectWithSigner(
      destinationChain.rpcUrl,
      recievingSigner,
      {
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

    const sendingStargateClient = await SigningStargateClient?.connectWithSigner(
      sourceChain.rpcUrl,
      sendingSigner,
      {
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

    const { channelId } = await loadConnectionByChainIds({
      sourceChainId: sourceChain.chainId,
      counterpartyChainId: destinationChain.chainId,
    });

    const symbol = params.assetAmountToTransfer.asset.symbol;

    // initially set low
    // const timeoutInMinutes = 5;
    // const timeoutTimestamp = Math.floor(
    //   Date.now() / 1000 + 60 * timeoutInMinutes,
    // );
    // const timeoutTimestampNanoseconds = timeoutTimestamp
    //   ? Long.fromNumber(timeoutTimestamp).multiply(1_000_000_000)
    //   : undefined;
    const currentHeight = await receivingStargateCient.getHeight();
    const timeoutHeight = Long.fromNumber(currentHeight).add(
      Long.fromNumber(600),
    ); // about one hour worth of blocks
    const transferMsg: MsgTransferEncodeObject = {
      typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
      value: IbcTransferV1Tx.MsgTransfer.fromPartial({
        sourcePort: "transfer",
        sourceChannel: channelId,
        sender: fromAccount.address,
        receiver: toAccount.address,
        token: {
          denom:
            this.networkDenomLookup[sourceChain.network as Network][symbol] ||
            symbol,
          // denom: symbol,
          amount: params.assetAmountToTransfer.toBigInt().toString(),
        },
        timeoutHeight: {
          revisionHeight: timeoutHeight,
        },
        timeoutTimestamp: undefined, // timeoutTimestampNanoseconds,
      }),
    };
    let transferMsgs: MsgTransferEncodeObject[] = [transferMsg];
    while (
      JSBI.greaterThanOrEqual(
        JSBI.BigInt(transferMsgs[0].value.token?.amount || "0"),
        // Max uint64
        JSBI.BigInt(`9223372036854775807`),
      )
    ) {
      transferMsgs = [...transferMsgs, ...transferMsgs].map((tfMsg) => {
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

    const batches = [];
    const maxMsgsPerBatch = 1000;
    // const maxMsgsPerBatch = 1024;
    while (transferMsgs.length) {
      batches.push(transferMsgs.splice(0, maxMsgsPerBatch));
    }
    console.log({ batches });
    const responses: BroadcastTxResponse[] = [];
    for (let batch of batches) {
      try {
        // const gasPerMessage = 39437;
        // const gasPerMessage = 39437;
        const gasPerMessage = 30437;
        console.log(JSON.stringify(batch));
        console.log("transfer msg count", transferMsgs.length);
        const brdcstTxRes = await sendingStargateClient.signAndBroadcast(
          fromAccount.address,
          batch,
          {
            ...sendingStargateClient.fees.transfer,
            amount: [
              {
                denom: sourceChain.keplrChainInfo.feeCurrencies[0].coinDenom,
                amount:
                  sourceChain.keplrChainInfo.gasPriceStep?.average.toString() ||
                  "",
              },
            ],
            gas: (() => {
              const calculatedGas = JSBI.multiply(
                JSBI.BigInt(gasPerMessage),
                JSBI.BigInt(batch.length),
              );
              const minimumGas = JSBI.BigInt("160000");
              const out = JSBI.greaterThan(calculatedGas, minimumGas)
                ? calculatedGas
                : JSBI.add(minimumGas, calculatedGas);
              return out.toString();
            })(),
          },
        );
        console.log({ brdcstTxRes });
        responses.push(brdcstTxRes);
      } catch (e) {
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
