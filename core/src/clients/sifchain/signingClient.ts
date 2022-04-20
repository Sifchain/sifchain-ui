import { AminoMsg } from "@cosmjs/amino";
import {
  GeneratedType,
  isTsProtoGeneratedType,
  OfflineSigner,
  Registry,
} from "@cosmjs/proto-signing";
import {
  AminoConverters,
  AminoTypes,
  createAuthzAminoConverters,
  createBankAminoConverters,
  createDistributionAminoConverters,
  createFreegrantAminoConverters,
  createGovAminoConverters,
  createIbcAminoConverters,
  createStakingAminoConverters,
  defaultRegistryTypes as defaultStargateTypes,
  SigningStargateClient,
  SigningStargateClientOptions,
} from "@cosmjs/stargate";
import * as clpTx from "../../generated/proto/sifnode/clp/v1/tx";
import * as dispensationTx from "../../generated/proto/sifnode/dispensation/v1/tx";
import * as ethBridgeTx from "../../generated/proto/sifnode/ethbridge/v1/tx";
import * as tokenRegistryTx from "../../generated/proto/sifnode/tokenregistry/v1/tx";
import {
  convertToSnakeCaseDeep,
  createAminoTypeNameFromProtoTypeUrl,
} from "../native";
import { DEFAULT_GAS_PRICE } from "./fees";

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

const createSifchainAminoConverters = (): AminoConverters => {
  const protoTypes = [
    clpTx,
    dispensationTx,
    ethBridgeTx,
    tokenRegistryTx,
  ].flatMap(generateTypeUrlAndTypeRecords);

  return Object.fromEntries(
    protoTypes.map((x) => [
      x.typeUrl,
      {
        aminoType: createAminoTypeNameFromProtoTypeUrl(x.typeUrl),
        toAmino: (value: any): AminoMsg => convertToSnakeCaseDeep(value),
        fromAmino: (value: AminoMsg): any => convertToSnakeCaseDeep(value),
      },
    ]),
  );
};

const createDefaultTypes = () =>
  new AminoTypes({
    ...createAuthzAminoConverters(),
    ...createBankAminoConverters(),
    ...createDistributionAminoConverters(),
    ...createGovAminoConverters(),
    ...createStakingAminoConverters("sif"),
    ...createIbcAminoConverters(),
    ...createFreegrantAminoConverters(),
    ...createSifchainAminoConverters(),
  });

const createDefaultRegistry = () => {
  const registry = new Registry(defaultStargateTypes);
  [clpTx, dispensationTx, ethBridgeTx, tokenRegistryTx]
    .flatMap(generateTypeUrlAndTypeRecords)
    .forEach((x) => registry.register(x.typeUrl, x.type));
  return registry;
};

export const createSigningClient = (
  rpcUrl: string,
  signer: OfflineSigner,
  options?: SigningStargateClientOptions,
) =>
  SigningStargateClient.connectWithSigner(rpcUrl, signer, {
    registry: createDefaultRegistry(),
    aminoTypes: createDefaultTypes(),
    gasPrice: DEFAULT_GAS_PRICE,
    ...options,
  });
