import { AminoConverter, AminoTypes } from "@cosmjs/stargate";
import { NativeDexClient } from "./NativeDexClient";
import * as inflection from "inflection";
import { AminoMsg } from "@cosmjs/amino";
export class NativeAminoTypes extends AminoTypes {
  constructor() {
    const options = {
      additions: createAminoAdditions(),
      prefix: undefined,
    };
    super(options);
    const ibcAddition =
      options.additions?.["/ibc.applications.transfer.v1.MsgTransfer"];

    if (ibcAddition) {
      const originalToAmino = ibcAddition.toAmino;

      // @ts-ignore
      ibcAddition.toAmino = (value: any) => {
        value.timeoutHeight.revisionNumber = value.timeoutHeight.revisionNumber.toString();
        value.timeoutHeight.revisionHeight = value.timeoutHeight.revisionHeight.toString();
        const converted = originalToAmino(value);
        delete converted.timeout_timestamp;
        console.log("After converted", JSON.stringify(converted, null, 2));
        return converted;
      };
    }
  }
}

const createAminoTypeNameFromProtoTypeUrl = (typeUrl: string) => {
  if (typeUrl.startsWith("/ibc")) {
    return typeUrl
      .split(".")
      .filter(Boolean)
      .filter((part) => {
        return !/applications|v1|transfer/.test(part);
      })
      .map((part) => {
        if (part === "/ibc") return "cosmos-sdk";
        return part;
      })
      .join("/");
  }
  const [_namespace, cosmosModule, _version, messageType] = typeUrl.split(".");

  return `${cosmosModule}/${messageType}`;
};

const convertToSnakeCaseDeep = (obj: any): any => {
  if (typeof obj !== "object") {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => convertToSnakeCaseDeep(item));
  }
  const newObj: any = {};
  for (let prop in obj) {
    newObj[inflection.underscore(prop)] = convertToSnakeCaseDeep(obj[prop]);
  }
  return newObj;
};

const convertToCamelCaseDeep = (obj: any): any => {
  if (typeof obj !== "object") {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => convertToCamelCaseDeep(item));
  }
  const newObj: any = {};
  for (let prop in obj) {
    newObj[inflection.underscore(prop)] = convertToCamelCaseDeep(obj[prop]);
  }
  return newObj;
};

const createAminoAdditions = (): Record<string, AminoConverter> => {
  /* 

    export const liquidityTypes = {
      '/tendermint.liquidity.v1beta1.MsgCreatePool': {
        aminoType: 'liquidity/MsgCreatePool',
        toAmino: ({ poolCreatorAddress, poolTypeId, depositCoins }: MsgCreatePool): AminoMsgCreatePool['value'] => ({
          pool_creator_address: poolCreatorAddress,
          pool_type_id: poolTypeId,
          deposit_coins: [...depositCoins],
        }),
        fromAmino: ({ pool_creator_address, pool_type_id, deposit_coins }: AminoMsgCreatePool['value']): MsgCreatePool => ({
          poolCreatorAddress: pool_creator_address,
          poolTypeId: pool_type_id,
          depositCoins: [...deposit_coins],
        }),
      }
    };

  */
  const aminoAdditions: Record<string, AminoConverter> = {};
  const protogens = NativeDexClient.getGeneratedTypes();
  for (let [typeUrl, _genType] of protogens) {
    // if (!typeUrl.includes("sifnode")) continue;
    aminoAdditions[typeUrl] = {
      aminoType: createAminoTypeNameFromProtoTypeUrl(typeUrl),
      toAmino: (value: any): AminoMsg => convertToSnakeCaseDeep(value),
      fromAmino: (value: AminoMsg): any => convertToCamelCaseDeep(value),
    };
  }
  console.log({ aminoAdditions });
  return aminoAdditions;
};
