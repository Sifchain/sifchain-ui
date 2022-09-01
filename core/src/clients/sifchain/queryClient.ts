import {
  createProtobufRpcClient,
  QueryClient,
  setupAuthExtension,
  setupBankExtension,
  setupStakingExtension,
  setupTxExtension,
} from "@cosmjs/stargate";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { QueryClientImpl as ClpQueryClient } from "../../generated/proto/sifnode/clp/v1/querier";
import { QueryClientImpl as DispensationQueryClient } from "../../generated/proto/sifnode/dispensation/v1/query";
import { QueryClientImpl as EthBridgeQueryClient } from "../../generated/proto/sifnode/ethbridge/v1/query";
import { QueryClientImpl as TokenRegistryQueryClient } from "../../generated/proto/sifnode/tokenregistry/v1/query";
import { QueryClientImpl as MarginQueryClient } from "../../generated/proto/sifnode/margin/v1/query";
import { Rpc, StringLiteral } from "./types";

const setupBareExtension =
  <TModule, TClient>(
    moduleName: StringLiteral<TModule>,
    client: { new (rpc: Rpc): TClient },
  ) =>
  (base: QueryClient) => {
    const rpc = createProtobufRpcClient(base);
    return {
      [moduleName]: new client(rpc),
    } as { [P in StringLiteral<TModule>]: TClient };
  };

export const createQueryClient = async (url: string) =>
  QueryClient.withExtensions(
    await Tendermint34Client.connect(url),
    setupAuthExtension,
    setupBankExtension,
    setupStakingExtension,
    setupTxExtension,
    setupBareExtension("clp", ClpQueryClient),
    setupBareExtension("dispensation", DispensationQueryClient),
    setupBareExtension("ethBridge", EthBridgeQueryClient),
    setupBareExtension("tokenRegistry", TokenRegistryQueryClient),
    setupBareExtension("margin", MarginQueryClient),
  );
