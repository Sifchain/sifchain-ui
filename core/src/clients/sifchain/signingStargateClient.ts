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
  SignerData,
  SigningStargateClient,
  SigningStargateClientOptions,
  StdFee,
} from "@cosmjs/stargate";
import { HttpEndpoint, Tendermint34Client } from "@cosmjs/tendermint-rpc";
import * as clpTx from "../../generated/proto/sifnode/clp/v1/tx";
import * as dispensationTx from "../../generated/proto/sifnode/dispensation/v1/tx";
import * as ethBridgeTx from "../../generated/proto/sifnode/ethbridge/v1/tx";
import * as tokenRegistryTx from "../../generated/proto/sifnode/tokenregistry/v1/tx";
import {
  convertToCamelCaseDeep,
  convertToSnakeCaseDeep,
  createAminoTypeNameFromProtoTypeUrl,
} from "../native";
import { DEFAULT_GAS_PRICE } from "./fees";
import { SifchainEncodeObject } from "./messages";

const MODULES = [clpTx, dispensationTx, ethBridgeTx, tokenRegistryTx];

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

const createSifchainAminoConverters = (): AminoConverters =>
  Object.fromEntries(
    MODULES.flatMap(generateTypeUrlAndTypeRecords).map((x) => [
      x.typeUrl,
      {
        aminoType: createAminoTypeNameFromProtoTypeUrl(x.typeUrl),
        toAmino: (value) => convertToSnakeCaseDeep(value),
        fromAmino: (value) => convertToCamelCaseDeep(value),
      },
    ]),
  );

export const createDefaultTypes = (prefix: string) =>
  new AminoTypes({
    ...createAuthzAminoConverters(),
    ...createBankAminoConverters(),
    ...createDistributionAminoConverters(),
    ...createGovAminoConverters(),
    ...createStakingAminoConverters(prefix),
    ...createIbcAminoConverters(),
    ...createFreegrantAminoConverters(),
    ...createSifchainAminoConverters(),
  });

export const createDefaultRegistry = () => {
  const registry = new Registry(defaultStargateTypes);
  MODULES.flatMap(generateTypeUrlAndTypeRecords).forEach((x) =>
    registry.register(x.typeUrl, x.type),
  );
  return registry;
};

export class SifSigningStargateClient extends SigningStargateClient {
  static override async connectWithSigner(
    endpoint: string | HttpEndpoint,
    signer: OfflineSigner,
    options: SigningStargateClientOptions = {},
  ) {
    const tmClient = await Tendermint34Client.connect(endpoint);
    return new this(tmClient, signer, options);
  }

  static override async offline(
    signer: OfflineSigner,
    options: SigningStargateClientOptions = {},
  ) {
    return new this(undefined, signer, options);
  }

  protected constructor(
    tmClient: Tendermint34Client | undefined,
    signer: OfflineSigner,
    options: SigningStargateClientOptions,
  ) {
    super(tmClient, signer, {
      prefix: "sif",
      registry: createDefaultRegistry(),
      aminoTypes: createDefaultTypes(options.prefix ?? "sif"),
      gasPrice: DEFAULT_GAS_PRICE,
      ...options,
    });
  }

  override simulate(
    signerAddress: string,
    messages: readonly SifchainEncodeObject[],
    memo: string | undefined,
  ) {
    return super.simulate(signerAddress, messages, memo);
  }

  override sign(
    signerAddress: string,
    messages: readonly SifchainEncodeObject[],
    fee: StdFee,
    memo: string,
    explicitSignerData?: SignerData,
  ) {
    return super.sign(signerAddress, messages, fee, memo, explicitSignerData);
  }

  override signAndBroadcast(
    signerAddress: string,
    messages: readonly SifchainEncodeObject[],
    fee: number | StdFee | "auto",
    memo?: string,
  ) {
    return super.signAndBroadcast(signerAddress, messages, fee, memo);
  }
}
