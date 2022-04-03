import { createProtobufRpcClient, QueryClient } from "@cosmjs/stargate";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { QueryClientImpl as ClpQueryClient } from "../../generated/sifnode/clp/v1/querier";
import { QueryClientImpl as DispensationQueryClient } from "../../generated/sifnode/dispensation/v1/query";
import { QueryClientImpl as EthBridgeQueryClient } from "../../generated/sifnode/ethbridge/v1/query";
import { QueryClientImpl as TokenRegistryQueryClient } from "../../generated/sifnode/tokenregistry/v1/query";

export const createQueryClient = async (url: string) => {
  const tendermintClient = await Tendermint34Client.connect(url);
  const queryClient = new QueryClient(tendermintClient);
  const rpcClient = createProtobufRpcClient(queryClient);

  return {
    clpQueryClient: new ClpQueryClient(rpcClient),
    dispensationQueryClient: new DispensationQueryClient(rpcClient),
    ethBridgeQueryClient: new EthBridgeQueryClient(rpcClient),
    tokenRegistryQueryClient: new TokenRegistryQueryClient(rpcClient),
  };
};
