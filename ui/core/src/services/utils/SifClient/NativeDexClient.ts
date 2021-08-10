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
  TimeoutError,
} from "@cosmjs/stargate";
import { BroadcastTxCommitResponse } from "@cosmjs/tendermint-rpc/build/tendermint34";
import { SimulationResponse } from "@cosmjs/stargate/build/codec/cosmos/base/abci/v1beta1/abci";
import { sleep } from "../../../test/utils/sleep";

export class NativeDexClient {
  query?: ReturnType<typeof NativeDexClient.prototype.createQueryClient>;
  protected t34?: Tendermint34Client;
  constructor(readonly rpcUrl: string) {}
  async connect(resolver?: (t: this) => void) {
    return (
      this.t34 ??
      Tendermint34Client.connect(this.rpcUrl).then((t34) => {
        this.query = this.createQueryClient(t34);
        return resolver?.(this);
      })
    );
  }

  async createSigningClient(signer: OfflineSigner) {
    const createCustomTypesForModule = (
      nativeModule: Record<string, GeneratedType | any> & {
        protobufPackage: string;
      },
    ): Iterable<[string, GeneratedType]> => {
      let types: [string, GeneratedType][] = [];
      for (const [prop, type] of Object.entries(nativeModule)) {
        if (!isTsProtoGeneratedType(type)) {
          continue;
        }
        types.push([`/${nativeModule.protobufPackage}.${prop}`, type]);
      }
      return types;
    };
    const nativeRegistry = new Registry([
      ...defaultRegistryTypes,
      ...createCustomTypesForModule(EthbridgeV1Tx),
      ...createCustomTypesForModule(DispensationV1Tx),
      ...createCustomTypesForModule(CLPV1Tx),
      ...createCustomTypesForModule(TokenRegistryV1Tx),
    ]);
    const client = await SigningStargateClient.connectWithSigner(
      this.rpcUrl,
      signer,
      {
        registry: nativeRegistry,
      },
    );

    return client;
  }

  private createQueryClient(t34: Tendermint34Client) {
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

new NativeDexClient("http").connect((client) => {}).then((client) => {});
