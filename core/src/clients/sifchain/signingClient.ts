import {
  GeneratedType,
  isTsProtoGeneratedType,
  OfflineSigner,
  Registry,
} from "@cosmjs/proto-signing";
import {
  defaultRegistryTypes as defaultStargateTypes,
  SigningStargateClient,
} from "@cosmjs/stargate";
import * as clpTx from "../../generated/sifnode/clp/v1/tx";
import * as dispensationTx from "../../generated/sifnode/dispensation/v1/tx";
import * as ethBridgeTx from "../../generated/sifnode/ethbridge/v1/tx";
import * as tokenRegistryTx from "../../generated/sifnode/tokenregistry/v1/tx";

const generateTypeUrlAndTypeRecords = (
  proto: Record<string, GeneratedType | any> & {
    protobufPackage: string;
  },
) =>
  Object.entries(proto)
    .filter(([_, value]) => isTsProtoGeneratedType(value))
    .map(([key, value]) => ({
      typeUrl: `/${proto.protobufPackage}.${key}`,
      type: value,
    }));

export const createSigningClient = (rpcUrl: string, signer: OfflineSigner) => {
  const registry = new Registry(defaultStargateTypes);

  [clpTx, dispensationTx, ethBridgeTx, tokenRegistryTx]
    .flatMap(generateTypeUrlAndTypeRecords)
    .forEach((x) => registry.register(x.typeUrl, x.type));

  return SigningStargateClient.connectWithSigner(rpcUrl, signer, {
    registry,
  });
};
