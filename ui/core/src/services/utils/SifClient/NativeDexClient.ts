import * as TokenRegistryV1Query from "../../../generated/proto/sifnode/tokenregistry/v1/query";
import * as TokenRegistryV1Tx from "../../../generated/proto/sifnode/tokenregistry/v1/query";
import * as CLPV1Query from "../../../generated/proto/sifnode/clp/v1/querier";
import * as CLPV1Tx from "../../../generated/proto/sifnode/clp/v1/tx";
import * as DispensationV1Query from "../../../generated/proto/sifnode/dispensation/v1/query";
import * as DispensationV1Tx from "../../../generated/proto/sifnode/dispensation/v1/tx";
import * as EthbridgeV1Query from "../../../generated/proto/sifnode/ethbridge/v1/query";
import * as EthbridgeV1Tx from "../../../generated/proto/sifnode/ethbridge/v1/tx";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { toHex } from "@cosmjs/encoding";
import {
  DirectSecp256k1HdWallet,
  Registry,
  GeneratedType,
  isTsProtoGeneratedType,
  OfflineSigner,
} from "@cosmjs/stargate/node_modules/@cosmjs/proto-signing";

import {
  BroadcastTxResponse,
  createProtobufRpcClient,
  defaultRegistryTypes,
  QueryClient,
  setupAuthExtension,
  setupBankExtension,
  setupIbcExtension,
  SigningStargateClient,
  StargateClient,
  StdFee,
  TimeoutError,
} from "@cosmjs/stargate";
import { BroadcastTxCommitResponse } from "@cosmjs/tendermint-rpc/build/tendermint34";
import { SimulationResponse } from "@cosmjs/stargate/build/codec/cosmos/base/abci/v1beta1/abci";
import { sleep } from "../../../test/utils/sleep";

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

export class NativeDexClient {
  protected constructor(
    readonly rpcUrl: string,
    protected t34: Tendermint34Client,
    readonly query: ReturnType<typeof NativeDexClient.createQueryClient>,
  ) {}
  static async connect(rpcUrl: string): Promise<NativeDexClient> {
    const t34 = await Tendermint34Client.connect(rpcUrl);
    const query = this.createQueryClient(t34);
    const instance = new this(rpcUrl, t34, query);
    return instance;
  }

  static getGeneratedTypes() {
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

  async createSigningClient(signer: OfflineSigner) {
    const nativeRegistry = new Registry([
      ...NativeDexClient.getGeneratedTypes(),
    ]);

    const client = await SigningStargateClient.connectWithSigner(
      this.rpcUrl,
      signer,
      {
        registry: nativeRegistry,
      } as const,
    );

    return client;
  }
  createTxClient(t34: Tendermint34Client) {
    return {
      // dispensation: new DispensationV1Tx.MsgCreateClaimResponse
    };
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
