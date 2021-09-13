import * as TokenRegistryV1Query from "../../../generated/proto/sifnode/tokenregistry/v1/query";
import * as TokenRegistryV1Tx from "../../../generated/proto/sifnode/tokenregistry/v1/tx";
import * as CLPV1Query from "../../../generated/proto/sifnode/clp/v1/querier";
import * as CLPV1Tx from "../../../generated/proto/sifnode/clp/v1/tx";
import * as DispensationV1Query from "../../../generated/proto/sifnode/dispensation/v1/query";
import * as DispensationV1Tx from "../../../generated/proto/sifnode/dispensation/v1/tx";
import * as EthbridgeV1Query from "../../../generated/proto/sifnode/ethbridge/v1/query";
import * as EthbridgeV1Tx from "../../../generated/proto/sifnode/ethbridge/v1/tx";
import * as IBCTransferV1Tx from "@cosmjs/stargate/build/codec/ibc/applications/transfer/v1/tx";
import * as CosmosBankV1Tx from "@cosmjs/stargate/build/codec/cosmos/bank/v1beta1/tx";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import {
  coins,
  makeSignDoc as makeSignDocAmino,
  OfflineAminoSigner,
} from "@cosmjs/amino";
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
  OfflineDirectSigner,
} from "@cosmjs/proto-signing";

import {
  BroadcastTxResponse,
  createProtobufRpcClient,
  defaultRegistryTypes,
  QueryClient,
  setupAuthExtension,
  setupBankExtension,
  setupIbcExtension,
  SigningStargateClient,
} from "@cosmjs/stargate";

import { Compatible42SigningCosmosClient } from ".";
import { NativeAminoTypes } from "./NativeAminoTypes";
import {
  NativeDexSignedTransaction,
  NativeDexTransaction,
  NativeDexTransactionFee,
} from "./NativeDexTransaction";
import { makeStdTx } from "@cosmjs/launchpad";
import { CosmosClient } from "@cosmjs/launchpad";
import {
  BroadcastTxResult,
  OfflineSigner as OfflineLaunchpadSigner,
} from "@cosmjs/launchpad";

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
  static feeTable = buildFeeTable(defaultGasPrice, defaultGasLimits, {});
  protected constructor(
    readonly rpcUrl: string,
    readonly restUrl: string,
    readonly chainId: string,
    protected t34: Tendermint34Client,
    readonly query: ReturnType<typeof NativeDexClient.createQueryClient>,
    readonly tx: ReturnType<typeof NativeDexClient.createTxClient>,
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

  static getGeneratedTypes(): [string, GeneratedType][] {
    return [
      ...defaultRegistryTypes,
      ...this.createCustomTypesForModule(EthbridgeV1Tx),
      ...this.createCustomTypesForModule(DispensationV1Tx),
      ...this.createCustomTypesForModule(CLPV1Tx),
      ...this.createCustomTypesForModule(TokenRegistryV1Tx),
    ];
  }
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

  static getNativeRegistry(): Registry {
    return new Registry([...NativeDexClient.getGeneratedTypes()]);
  }
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

  async sign(
    tx: NativeDexTransaction<EncodeObject>,
    signer: OfflineSigner & OfflineAminoSigner,
    {
      sendingChainRestUrl = this.restUrl,
      sendingChainRpcUrl = this.rpcUrl,
    } = {},
  ) {
    const cosmosClient = await StargateClient.connect(sendingChainRpcUrl);
    const { accountNumber, sequence } = await cosmosClient.getSequence(
      tx.fromAddress,
    );
    console.log(tx);
    // debugger;
    const msgs = this.convertEncodeMsgsToAminos(tx.msgs);
    const chainId = await cosmosClient.getChainId();
    const fee = {
      amount: [tx.fee.price],
      gas: tx.fee.gas,
    };
    const signDoc = makeSignDocAmino(
      msgs,
      fee,
      chainId,
      tx.memo,
      accountNumber,
      sequence,
    );

    const { signed, signature } = await signer.signAmino(
      tx.fromAddress,
      signDoc,
    );
    console.log(signed, signature);
    const signedTx = makeStdTx(signed, signature);
    console.log(signedTx);
    return new NativeDexSignedTransaction(tx, signedTx);
  }
  private convertEncodeMsgsToAminos(encodeMsgs: EncodeObject[]) {
    const converter = new NativeAminoTypes();
    const converted = encodeMsgs.map(converter.toAmino.bind(converter));
    return converted;
  }
  async broadcast(
    tx: NativeDexSignedTransaction<EncodeObject>,
    {
      sendingChainRestUrl = this.restUrl,
      sendingChainRpcUrl = this.rpcUrl,
    } = {},
  ): Promise<BroadcastTxResult> {
    const launchpad = new CosmosClient(sendingChainRestUrl);
    const res = await launchpad.broadcastTx(tx.signed);
    console.log({ res });
    return res;
  }
  static createTxClient() {
    type ExtractMethodInvokationType<T> = T extends (...args: any[]) => any
      ? (
          arg: Parameters<T>[0],
          senderAddress: string,
          fee?: NativeDexTransactionFee,
        ) => DeepReadonly<
          NativeDexTransaction<{
            typeUrl: string;
            value: Parameters<T>[0];
          }>
        >
      : null;
    type ExtractMethodInvokationTypes<T> = T extends object
      ? {
          [K in keyof T]: ExtractMethodInvokationType<T[K]>;
        }
      : {};
    const createSigningClientFromImpl = <T extends any>(txModule: {
      MsgClientImpl: Function;
      protobufPackage: string;
    }): ExtractMethodInvokationTypes<T> => {
      const protoMethods = txModule.MsgClientImpl.prototype as T;
      const createSigMethod = (methodName: string) => (
        msg: any,
        senderAddress: string,
        { gas, price }: NativeDexTransactionFee = {
          gas: this.feeTable.send.gas,
          price: {
            denom: this.feeTable.send.amount[0].denom,
            amount: this.feeTable.send.amount[0].amount,
          },
        },
      ): NativeDexTransaction<any> => {
        const typeUrl = `/${txModule.protobufPackage}.Msg${methodName}`;
        console.log({ typeUrl });
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
        );
      };
      const signingClientMethods = {} as ExtractMethodInvokationTypes<T>;
      for (let method of Object.getOwnPropertyNames(protoMethods)) {
        // @ts-ignore
        signingClientMethods[method] = createSigMethod(method);
      }
      return signingClientMethods;
    };

    const txs = {
      dispensation: createSigningClientFromImpl<DispensationV1Tx.Msg>(
        DispensationV1Tx,
      ),
      ethbridge: createSigningClientFromImpl<EthbridgeV1Tx.Msg>(EthbridgeV1Tx),
      clp: createSigningClientFromImpl<CLPV1Tx.Msg>(CLPV1Tx),
      registry: createSigningClientFromImpl<TokenRegistryV1Tx.Msg>(
        TokenRegistryV1Tx,
      ),
      ibc: createSigningClientFromImpl<IBCTransferV1Tx.Msg>(IBCTransferV1Tx),
      bank: createSigningClientFromImpl<CosmosBankV1Tx.Msg>(CosmosBankV1Tx),
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
