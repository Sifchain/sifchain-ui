/* eslint-disable */
import { Asset } from "./types";
import Long from "long";
import _m0 from "protobufjs/minimal";

export const protobufPackage = "sifnode.clp.v1";

export interface Pool {
  externalAsset?: Asset;
  nativeAssetBalance: string;
  externalAssetBalance: string;
  poolUnits: string;
  swapPriceNative: string;
  swapPriceExternal: string;
  rewardPeriodNativeDistributed: string;
  externalLiabilities: string;
  externalCustody: string;
  nativeLiabilities: string;
  nativeCustody: string;
  health: string;
  interestRate: string;
  lastHeightInterestRateComputed: Long;
}

function createBasePool(): Pool {
  return {
    externalAsset: undefined,
    nativeAssetBalance: "",
    externalAssetBalance: "",
    poolUnits: "",
    swapPriceNative: "",
    swapPriceExternal: "",
    rewardPeriodNativeDistributed: "",
    externalLiabilities: "",
    externalCustody: "",
    nativeLiabilities: "",
    nativeCustody: "",
    health: "",
    interestRate: "",
    lastHeightInterestRateComputed: Long.ZERO,
  };
}

export const Pool = {
  encode(message: Pool, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.externalAsset !== undefined) {
      Asset.encode(message.externalAsset, writer.uint32(10).fork()).ldelim();
    }
    if (message.nativeAssetBalance !== "") {
      writer.uint32(18).string(message.nativeAssetBalance);
    }
    if (message.externalAssetBalance !== "") {
      writer.uint32(26).string(message.externalAssetBalance);
    }
    if (message.poolUnits !== "") {
      writer.uint32(34).string(message.poolUnits);
    }
    if (message.swapPriceNative !== "") {
      writer.uint32(42).string(message.swapPriceNative);
    }
    if (message.swapPriceExternal !== "") {
      writer.uint32(50).string(message.swapPriceExternal);
    }
    if (message.rewardPeriodNativeDistributed !== "") {
      writer.uint32(58).string(message.rewardPeriodNativeDistributed);
    }
    if (message.externalLiabilities !== "") {
      writer.uint32(66).string(message.externalLiabilities);
    }
    if (message.externalCustody !== "") {
      writer.uint32(74).string(message.externalCustody);
    }
    if (message.nativeLiabilities !== "") {
      writer.uint32(82).string(message.nativeLiabilities);
    }
    if (message.nativeCustody !== "") {
      writer.uint32(90).string(message.nativeCustody);
    }
    if (message.health !== "") {
      writer.uint32(98).string(message.health);
    }
    if (message.interestRate !== "") {
      writer.uint32(106).string(message.interestRate);
    }
    if (!message.lastHeightInterestRateComputed.isZero()) {
      writer.uint32(112).int64(message.lastHeightInterestRateComputed);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Pool {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePool();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.externalAsset = Asset.decode(reader, reader.uint32());
          break;
        case 2:
          message.nativeAssetBalance = reader.string();
          break;
        case 3:
          message.externalAssetBalance = reader.string();
          break;
        case 4:
          message.poolUnits = reader.string();
          break;
        case 5:
          message.swapPriceNative = reader.string();
          break;
        case 6:
          message.swapPriceExternal = reader.string();
          break;
        case 7:
          message.rewardPeriodNativeDistributed = reader.string();
          break;
        case 8:
          message.externalLiabilities = reader.string();
          break;
        case 9:
          message.externalCustody = reader.string();
          break;
        case 10:
          message.nativeLiabilities = reader.string();
          break;
        case 11:
          message.nativeCustody = reader.string();
          break;
        case 12:
          message.health = reader.string();
          break;
        case 13:
          message.interestRate = reader.string();
          break;
        case 14:
          message.lastHeightInterestRateComputed = reader.int64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Pool {
    return {
      externalAsset: isSet(object.externalAsset)
        ? Asset.fromJSON(object.externalAsset)
        : undefined,
      nativeAssetBalance: isSet(object.nativeAssetBalance)
        ? String(object.nativeAssetBalance)
        : "",
      externalAssetBalance: isSet(object.externalAssetBalance)
        ? String(object.externalAssetBalance)
        : "",
      poolUnits: isSet(object.poolUnits) ? String(object.poolUnits) : "",
      swapPriceNative: isSet(object.swapPriceNative)
        ? String(object.swapPriceNative)
        : "",
      swapPriceExternal: isSet(object.swapPriceExternal)
        ? String(object.swapPriceExternal)
        : "",
      rewardPeriodNativeDistributed: isSet(object.rewardPeriodNativeDistributed)
        ? String(object.rewardPeriodNativeDistributed)
        : "",
      externalLiabilities: isSet(object.externalLiabilities)
        ? String(object.externalLiabilities)
        : "",
      externalCustody: isSet(object.externalCustody)
        ? String(object.externalCustody)
        : "",
      nativeLiabilities: isSet(object.nativeLiabilities)
        ? String(object.nativeLiabilities)
        : "",
      nativeCustody: isSet(object.nativeCustody)
        ? String(object.nativeCustody)
        : "",
      health: isSet(object.health) ? String(object.health) : "",
      interestRate: isSet(object.interestRate)
        ? String(object.interestRate)
        : "",
      lastHeightInterestRateComputed: isSet(
        object.lastHeightInterestRateComputed,
      )
        ? Long.fromValue(object.lastHeightInterestRateComputed)
        : Long.ZERO,
    };
  },

  toJSON(message: Pool): unknown {
    const obj: any = {};
    message.externalAsset !== undefined &&
      (obj.externalAsset = message.externalAsset
        ? Asset.toJSON(message.externalAsset)
        : undefined);
    message.nativeAssetBalance !== undefined &&
      (obj.nativeAssetBalance = message.nativeAssetBalance);
    message.externalAssetBalance !== undefined &&
      (obj.externalAssetBalance = message.externalAssetBalance);
    message.poolUnits !== undefined && (obj.poolUnits = message.poolUnits);
    message.swapPriceNative !== undefined &&
      (obj.swapPriceNative = message.swapPriceNative);
    message.swapPriceExternal !== undefined &&
      (obj.swapPriceExternal = message.swapPriceExternal);
    message.rewardPeriodNativeDistributed !== undefined &&
      (obj.rewardPeriodNativeDistributed =
        message.rewardPeriodNativeDistributed);
    message.externalLiabilities !== undefined &&
      (obj.externalLiabilities = message.externalLiabilities);
    message.externalCustody !== undefined &&
      (obj.externalCustody = message.externalCustody);
    message.nativeLiabilities !== undefined &&
      (obj.nativeLiabilities = message.nativeLiabilities);
    message.nativeCustody !== undefined &&
      (obj.nativeCustody = message.nativeCustody);
    message.health !== undefined && (obj.health = message.health);
    message.interestRate !== undefined &&
      (obj.interestRate = message.interestRate);
    message.lastHeightInterestRateComputed !== undefined &&
      (obj.lastHeightInterestRateComputed = (
        message.lastHeightInterestRateComputed || Long.ZERO
      ).toString());
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<Pool>, I>>(object: I): Pool {
    const message = createBasePool();
    message.externalAsset =
      object.externalAsset !== undefined && object.externalAsset !== null
        ? Asset.fromPartial(object.externalAsset)
        : undefined;
    message.nativeAssetBalance = object.nativeAssetBalance ?? "";
    message.externalAssetBalance = object.externalAssetBalance ?? "";
    message.poolUnits = object.poolUnits ?? "";
    message.swapPriceNative = object.swapPriceNative ?? "";
    message.swapPriceExternal = object.swapPriceExternal ?? "";
    message.rewardPeriodNativeDistributed =
      object.rewardPeriodNativeDistributed ?? "";
    message.externalLiabilities = object.externalLiabilities ?? "";
    message.externalCustody = object.externalCustody ?? "";
    message.nativeLiabilities = object.nativeLiabilities ?? "";
    message.nativeCustody = object.nativeCustody ?? "";
    message.health = object.health ?? "";
    message.interestRate = object.interestRate ?? "";
    message.lastHeightInterestRateComputed =
      object.lastHeightInterestRateComputed !== undefined &&
      object.lastHeightInterestRateComputed !== null
        ? Long.fromValue(object.lastHeightInterestRateComputed)
        : Long.ZERO;
    return message;
  },
};

type Builtin =
  | Date
  | Function
  | Uint8Array
  | string
  | number
  | boolean
  | undefined;

export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Long
  ? string | number | Long
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends {}
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin
  ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & {
      [K in Exclude<keyof I, KeysOfUnion<P>>]: never;
    };

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
