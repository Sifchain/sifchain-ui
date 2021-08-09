import * as TokenRegistryV1Query from "../../../../generated/proto/sifnode/tokenregistry/v1/query";
import * as TokenRegistryV1Tx from "../../../../generated/proto/sifnode/tokenregistry/v1/query";
import * as CLPV1Query from "../../../../generated/proto/sifnode/clp/v1/querier";
import * as CLPV1Tx from "../../../../generated/proto/sifnode/clp/v1/tx";
import * as DispensationV1Query from "../../../../generated/proto/sifnode/dispensation/v1/query";
import * as DispensationV1Tx from "../../../../generated/proto/sifnode/dispensation/v1/tx";
import * as EthbridgeV1Query from "../../../../generated/proto/sifnode/ethbridge/v1/query";
import * as EthbridgeV1Tx from "../../../../generated/proto/sifnode/ethbridge/v1/tx";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import {
  DirectSecp256k1HdWallet,
  Registry,
  GeneratedType,
  isTsProtoGeneratedType,
  OfflineSigner,
} from "@cosmjs/stargate/node_modules/@cosmjs/proto-signing";
import {
  createProtobufRpcClient,
  defaultRegistryTypes,
  QueryClient,
  setupAuthExtension,
  setupBankExtension,
  setupIbcExtension,
  SigningStargateClient,
} from "@cosmjs/stargate";

export class NativeDexClient {
  query: ReturnType<typeof NativeDexClient.prototype.createQueryClient>;
  constructor(readonly rpcUrl: string) {
    this.query = this.createQueryClient();
  }

  async createTxClient(signer: OfflineSigner) {
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
    // Inside an async function...
    const client = await SigningStargateClient.connectWithSigner(
      this.rpcUrl,
      signer,
      {
        registry: nativeRegistry,
      },
    );
  }

  async createQueryClient() {
    const tendermintClient = await Tendermint34Client.connect(this.rpcUrl);
    return QueryClient.withExtensions(
      tendermintClient,
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
