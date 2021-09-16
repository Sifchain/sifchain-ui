import * as TokenRegistryV1Query from "../../../generated/proto/sifnode/tokenregistry/v1/query";
import * as TokenRegistryV1Tx from "../../../generated/proto/sifnode/tokenregistry/v1/tx";
import * as CLPV1Query from "../../../generated/proto/sifnode/clp/v1/querier";
import * as CLPV1Tx from "../../../generated/proto/sifnode/clp/v1/tx";
import * as DispensationV1Query from "../../../generated/proto/sifnode/dispensation/v1/query";
import * as DispensationV1Tx from "../../../generated/proto/sifnode/dispensation/v1/tx";
import * as EthbridgeV1Query from "../../../generated/proto/sifnode/ethbridge/v1/query";
import * as EthbridgeV1Tx from "../../../generated/proto/sifnode/ethbridge/v1/tx";
import * as IBCTransferV1Tx from "@cosmjs/stargate/build/codec/ibc/applications/transfer/v1/tx";
import * as CosmosBankV1Query from "@cosmjs/stargate/build/codec/cosmos/bank/v1beta1/query";
import * as CosmosBankV1Tx from "@cosmjs/stargate/build/codec/cosmos/bank/v1beta1/tx";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import {
  makeSignDoc as makeSignDocAmino,
  OfflineAminoSigner,
} from "@cosmjs/amino";
import { fromUtf8, toHex, fromHex } from "@cosmjs/encoding";
import {
  buildFeeTable,
  defaultGasLimits,
  defaultGasPrice,
  StargateClient,
} from "@cosmjs/stargate";
import { Registry } from "@cosmjs/stargate/node_modules/@cosmjs/proto-signing/build/registry";
import {
  GeneratedType,
  isTsProtoGeneratedType,
  OfflineSigner as OfflineStargateSigner,
  EncodeObject,
} from "@cosmjs/proto-signing";
import {
  createProtobufRpcClient,
  defaultRegistryTypes,
  QueryClient,
  setupAuthExtension,
  setupBankExtension,
  setupIbcExtension,
  SigningStargateClient,
} from "@cosmjs/stargate";
import { NativeAminoTypes } from "./NativeAminoTypes";
import {
  NativeDexSignedTransaction,
  NativeDexTransaction,
  NativeDexTransactionFee,
} from "./NativeDexTransaction";
import {
  makeStdTx,
  isBroadcastTxSuccess,
  isBroadcastTxFailure,
} from "@cosmjs/launchpad";
import { CosmosClient } from "@cosmjs/launchpad";
import {
  BroadcastTxResult,
  OfflineSigner as OfflineLaunchpadSigner,
} from "@cosmjs/launchpad";
import { parseTxFailure } from "../../../services/SifService/parseTxFailure";
import { TransactionStatus } from "../../../";
import { Compatible42CosmosClient, Compatible42SigningCosmosClient } from ".";
import getKeplrProvider from "../../../services/SifService/getKeplrProvider";
import { makeSignDoc } from "@cosmjs/launchpad";
import { BroadcastMode } from "@cosmjs/launchpad";
import { Uint53 } from "@cosmjs/math";
import { parseLogs } from "@cosmjs/stargate/build/logs";

type OfflineSigner = OfflineLaunchpadSigner | OfflineStargateSigner;
type TxGroup =
  | typeof EthbridgeV1Tx
  | typeof DispensationV1Tx
  | typeof CLPV1Tx
  | typeof TokenRegistryV1Tx;

// type StringsOnly<T> = T extends string ? T : string;
// type ValueOf<T> = T[keyof T];
// type CustomEncodeObject<ParentModule extends TxGroup> = {
//   typeUrl: `/${ParentModule["protobufPackage"]}.${StringsOnly<
//     keyof ParentModule
//   >}`;
//   value: ValueOf<ParentModule>;
// };

// interface CustomSigningClient extends SigningStargateClient {
//   signAndBroadcast: <TxParentModule extends TxGroup>(
//     signerAddress: string,
//     messages: CustomEncodeObject<TxParentModule>[],
//     fee: StdFee,
//     memo?: string | undefined,
//   ) => Promise<BroadcastTxResponse>;
// }
type DeepReadonly<T> = T extends object
  ? { [K in keyof T]: DeepReadonly<T[K]> } & Readonly<T>
  : Readonly<T>;
export class NativeDexClient {
  static feeTable = buildFeeTable(
    defaultGasPrice,
    {
      send: 80000,
      transfer: 250000,
      delegate: 250000,
      undelegate: 250000,
      redelegate: 250000,
      // The gas multiplication per rewards.
      withdrawRewards: 140000,
      govVote: 250000,
    },
    {},
  );
  protected constructor(
    private readonly rpcUrl: string,
    private readonly restUrl: string,
    private readonly chainId: string,
    private t34: Tendermint34Client,
    public readonly query: ReturnType<typeof NativeDexClient.createQueryClient>,
    public readonly tx: ReturnType<typeof NativeDexClient.createTxClient>,
  ) {}
  static async connect(
    rpcUrl: string,
    restUrl: string,
    chainId: string,
  ): Promise<NativeDexClient> {
    const t34 = await Tendermint34Client.connect(rpcUrl);
    const query = this.createQueryClient(t34);
    const tx = this.createTxClient();
    const instance = new this(rpcUrl, restUrl, chainId, t34, query, tx);
    return instance;
  }

  /**
   *
   * Composes arguments for type Registry
   * @static
   * @return {*}  {[string, GeneratedType][]}
   * @memberof NativeDexClient
   */
  static getGeneratedTypes(): [string, GeneratedType][] {
    return [
      ...defaultRegistryTypes,
      ...this.createCustomTypesForModule(EthbridgeV1Tx),
      ...this.createCustomTypesForModule(DispensationV1Tx),
      ...this.createCustomTypesForModule(CLPV1Tx),
      ...this.createCustomTypesForModule(TokenRegistryV1Tx),
      ...this.createCustomTypesForModule(CosmosBankV1Tx),
    ];
  }

  parseTxResult = NativeDexClient.parseTxResult.bind(NativeDexClient);
  /**
   *
   * Parses `BroadcastTxResult` into DEXv1-compatible output.
   * Will eventually be replaced with custom NativeDex result types
   * @static
   * @param {BroadcastTxResult} result
   * @return {*}  {TransactionStatus}
   * @memberof NativeDexClient
   */
  static parseTxResult(result: BroadcastTxResult): TransactionStatus {
    try {
      if (isBroadcastTxFailure(result)) {
        /* istanbul ignore next */ // TODO: fix coverage
        return parseTxFailure(result);
      }
      return {
        hash: result.transactionHash,
        memo: "",
        state: "accepted",
      };
    } catch (err) {
      const e = err as any;
      console.log("signAndBroadcast ERROR", e);
      return parseTxFailure({ transactionHash: "", rawLog: e?.message });
    }
  }

  /**
   *
   * Transforms custom sifnode protobuf modules into types for registry
   */
  static createCustomTypesForModule(
    nativeModule: Record<string, GeneratedType | any> & {
      protobufPackage: string;
    },
  ): Iterable<[string, GeneratedType]> {
    let types: [string, GeneratedType][] = [];
    for (const [prop, type] of Object.entries(nativeModule)) {
      if (!isTsProtoGeneratedType(type)) {
        continue;
      }
      types.push([`/${nativeModule.protobufPackage}.${prop}`, type]);
    }
    return types;
  }

  /**
   *
   * Builds registry with custom generated protbuf types
   */
  static getNativeRegistry(): Registry {
    return new Registry([...NativeDexClient.getGeneratedTypes()]);
  }

  /**
   * Creates a stargate signing client with custom type registry
   */
  async createSigningClient(signer: OfflineSigner) {
    const nativeRegistry = NativeDexClient.getNativeRegistry();

    const client = await SigningStargateClient.connectWithSigner(
      this.rpcUrl,
      signer as OfflineStargateSigner,
      {
        registry: nativeRegistry,
      },
    );

    return client;
  }

  /**
   *
   * Signs a prepared `NativeDexTransaction`
   * @param {NativeDexTransaction<EncodeObject>} tx
   * @param {(OfflineSigner & OfflineAminoSigner)} signer
   * @param {*} [{
   *       sendingChainRestUrl = this.restUrl,
   *       sendingChainRpcUrl = this.rpcUrl,
   *     }={}]
   * @return {*}
   * @memberof NativeDexClient
   */
  async sign(
    tx: NativeDexTransaction<EncodeObject>,
    signer: OfflineAminoSigner,
    {
      sendingChainRestUrl = this.restUrl,
      sendingChainRpcUrl = this.rpcUrl,
    } = {},
  ) {
    const cosmosClient = await StargateClient.connect(sendingChainRpcUrl);
    // debugger;
    const msgs = this.convertEncodeMsgsToAminos(tx.msgs);

    const chainId = await cosmosClient.getChainId();
    const fee = {
      amount: [tx.fee.price],
      gas: tx.fee.gas,
    };
    const account = await cosmosClient.getAccount(tx.fromAddress || "");
    if (
      typeof account?.accountNumber !== "number" &&
      typeof account?.sequence === "number"
    ) {
      throw new Error(
        `This account (${tx.fromAddress}) does not yet exist on-chain. Please send some funds to it before proceeding.`,
      );
    }
    const keplr = await getKeplrProvider();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const signDoc = makeSignDoc(
      msgs,
      fee,
      chainId,
      tx.memo || "",
      account?.accountNumber.toString() || "",
      account?.sequence.toString() || "",
    );
    const key = await keplr?.getKey(chainId);
    let bech32Address = key?.bech32Address;
    const signResponse = await keplr!.signAmino(
      chainId,
      bech32Address || "",
      signDoc,
    );
    const signedTx = makeStdTx(signResponse.signed, signResponse.signature);
    return new NativeDexSignedTransaction(tx, signedTx);
  }
  /**
   *
   * Converts protobuf `EncodeObject`'s into amino-safe objects
   * to ensure ledger hardware wallet compatibility
   * @private
   * @param {EncodeObject[]} encodeMsgs
   * @return {*}
   * @memberof NativeDexClient
   */
  private convertEncodeMsgsToAminos(encodeMsgs: EncodeObject[]) {
    const converter = new NativeAminoTypes();
    const converted = encodeMsgs.map(converter.toAmino.bind(converter));
    return converted;
  }
  /**
   *
   * Submits a `sign`ed `NativeDexSignedTransaction` to node
   * @param {NativeDexSignedTransaction<EncodeObject>} tx
   * @param {*} [{
   *       sendingChainRestUrl = this.restUrl,
   *       sendingChainRpcUrl = this.rpcUrl,
   *     }={}]
   * @return {*}  {Promise<BroadcastTxResult>}
   * @memberof NativeDexClient
   */
  async broadcast(
    tx: NativeDexSignedTransaction<EncodeObject>,
    {
      sendingChainRestUrl = this.restUrl,
      sendingChainRpcUrl = this.rpcUrl,
    } = {},
  ): Promise<BroadcastTxResult> {
    const stargate = await StargateClient.connect(sendingChainRpcUrl);
    const keplr = await getKeplrProvider();
    const chainId = await stargate.getChainId();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const txHashUInt8Array = await keplr!.sendTx(
      chainId,
      tx.signed,
      BroadcastMode.Block,
    );
    const txHashHex = toHex(txHashUInt8Array).toUpperCase();
    const resultRaw = await stargate.getTx(txHashHex);
    if (!resultRaw || !resultRaw.hash?.match(/^([0-9A-F][0-9A-F])+$/)) {
      console.error("INVALID TXHASH IN RESULT", resultRaw);
      throw new Error(
        "Received ill-formatted txhash. Must be non-empty upper-case hex",
      );
    }
    const result: BroadcastTxResult = {
      ...resultRaw,
      logs: JSON.parse(resultRaw.rawLog),
      height: resultRaw.height,
      transactionHash: resultRaw.hash,
    };
    if (isBroadcastTxSuccess(result)) {
      result.logs.forEach((log) => {
        // @ts-ignore
        log.msg_index = 0;
        // @ts-ignore
        log.log = "";
      });
    }

    return isBroadcastTxFailure(result)
      ? {
          height: Uint53.fromString(result.height + "").toNumber(),
          transactionHash: result.transactionHash,
          code: result.code,
          rawLog: result.rawLog || "",
        }
      : {
          logs: result.logs ? parseLogs(result.logs) : [],
          rawLog: result.rawLog || "",
          transactionHash: result.transactionHash,
          data: result.data,
        };
  }

  /**
   *
   * Creates a type-safe amino-friendly transaction client API
   * @static
   * @return {*}
   * @memberof NativeDexClient
   */
  static createTxClient() {
    // Takes msg client impl & keeps the first argument, then adds a couple more

    // Including timeoutTimestamp during amino conversion is problematic
    type RemoveTimeoutTimestamp<T> = Omit<T, "timeoutTimestamp">;
    type ExtractMethodInvokationType<T> = T extends (...args: any[]) => any
      ? ((
          arg: RemoveTimeoutTimestamp<Parameters<T>[0]>,
          senderAddress: string,
          fee?: NativeDexTransactionFee,
          memo?: string,
        ) => DeepReadonly<
          NativeDexTransaction<{
            typeUrl: string;
            value: RemoveTimeoutTimestamp<Parameters<T>[0]>;
          }>
        >) & {
          createRawEncodeObject: (
            arg: RemoveTimeoutTimestamp<Parameters<T>[0]>,
          ) => {
            typeUrl: string;
            value: RemoveTimeoutTimestamp<Parameters<T>[0]>;
          };
        }
      : null;

    // "loops" through methods and applies types to each
    type ExtractMethodInvokationTypes<T> = T extends object
      ? {
          [K in keyof T]: ExtractMethodInvokationType<T[K]>;
        }
      : {};

    /*
    @mccallofthewild -
     Turns protobuf module into a signing client in the same style as stargate query client.
     The design choice of including sender address & gas fees was made in order to facilitate 
     data integrity in the confirmation stage, for both UI's and bots.
    */
    const createTxClient = <T extends any>(txModule: {
      MsgClientImpl: Function;
      protobufPackage: string;
    }): ExtractMethodInvokationTypes<T> => {
      const protoMethods = txModule.MsgClientImpl.prototype as T;
      // careful with edits here, as the implementation below is @ts-ignore'd
      const createTxCompositionMethod = (methodName: string) => {
        const typeUrl = `/${txModule.protobufPackage}.Msg${methodName}`;
        const compositionMethod = (
          msg: any,
          senderAddress: string,
          { gas, price }: NativeDexTransactionFee = {
            gas: this.feeTable.transfer.gas,
            // @mccallofthewild - May want to change this to an `AssetAmount` at some point once the SDK structure is ready
            price: {
              denom: this.feeTable.transfer.amount[0].denom,
              amount: this.feeTable.transfer.amount[0].amount,
            },
          },
          memo = "",
        ): NativeDexTransaction<any> => {
          delete msg["timeoutTimestamp"];
          return new NativeDexTransaction(
            senderAddress,
            [
              {
                typeUrl,
                value: msg,
              },
            ],
            {
              gas,
              price,
            },
            memo,
          );
        };
        compositionMethod.createRawEncodeObject = (msg: any) => ({
          typeUrl,
          value: msg,
        });
        return compositionMethod;
      };
      const signingClientMethods = {} as ExtractMethodInvokationTypes<T>;
      for (let method of Object.getOwnPropertyNames(protoMethods)) {
        // @ts-ignore
        signingClientMethods[method] = createTxCompositionMethod(method);
      }
      return signingClientMethods;
    };

    const txs = {
      dispensation: createTxClient<DispensationV1Tx.Msg>(DispensationV1Tx),
      ethbridge: createTxClient<EthbridgeV1Tx.Msg>(EthbridgeV1Tx),
      clp: createTxClient<CLPV1Tx.Msg>(CLPV1Tx),
      registry: createTxClient<TokenRegistryV1Tx.Msg>(TokenRegistryV1Tx),
      ibc: createTxClient<IBCTransferV1Tx.Msg>(IBCTransferV1Tx),
      bank: createTxClient<CosmosBankV1Tx.Msg>(CosmosBankV1Tx),
    };
    return txs;
  }
  private static createQueryClient(t34: Tendermint34Client) {
    return QueryClient.withExtensions(
      t34,
      setupIbcExtension,
      setupBankExtension,
      setupAuthExtension,
      (base: QueryClient) => {
        const rpcClient = createProtobufRpcClient(base);
        return {
          tokenregistry: new TokenRegistryV1Query.QueryClientImpl(rpcClient),
          clp: new CLPV1Query.QueryClientImpl(rpcClient),
          dispensation: new DispensationV1Query.QueryClientImpl(rpcClient),
          ethbridge: new EthbridgeV1Query.QueryClientImpl(rpcClient),
        };
      },
    );
  }
}
