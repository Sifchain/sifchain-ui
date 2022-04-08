/* eslint-disable */
import Long from "long";
import * as _m0 from "protobufjs/minimal";

export const protobufPackage = "sifnode.clp.v1";

/** Params - used for initializing default parameter for clp at genesis */
export interface Params {
  minCreatePoolThreshold: Long;
  /** in blocks */
  liquidityRemovalLockPeriod: Long;
  /** in blocks */
  liquidityRemovalCancelPeriod: Long;
  rewardPeriods: RewardPeriod[];
}

export interface RewardPeriod {
  id: string;
  startBlock: Long;
  endBlock: Long;
  allocation: string;
  multipliers: PoolMultiplier[];
}

export interface PoolMultiplier {
  asset: string;
  multiplier: string;
}

function createBaseParams(): Params {
  return {
    minCreatePoolThreshold: Long.UZERO,
    liquidityRemovalLockPeriod: Long.UZERO,
    liquidityRemovalCancelPeriod: Long.UZERO,
    rewardPeriods: [],
  };
}

export const Params = {
  encode(
    message: Params,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (!message.minCreatePoolThreshold.isZero()) {
      writer.uint32(8).uint64(message.minCreatePoolThreshold);
    }
    if (!message.liquidityRemovalLockPeriod.isZero()) {
      writer.uint32(16).uint64(message.liquidityRemovalLockPeriod);
    }
    if (!message.liquidityRemovalCancelPeriod.isZero()) {
      writer.uint32(24).uint64(message.liquidityRemovalCancelPeriod);
    }
    for (const v of message.rewardPeriods) {
      RewardPeriod.encode(v!, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Params {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseParams();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.minCreatePoolThreshold = reader.uint64() as Long;
          break;
        case 2:
          message.liquidityRemovalLockPeriod = reader.uint64() as Long;
          break;
        case 3:
          message.liquidityRemovalCancelPeriod = reader.uint64() as Long;
          break;
        case 4:
          message.rewardPeriods.push(
            RewardPeriod.decode(reader, reader.uint32()),
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Params {
    return {
      minCreatePoolThreshold: isSet(object.minCreatePoolThreshold)
        ? Long.fromString(object.minCreatePoolThreshold)
        : Long.UZERO,
      liquidityRemovalLockPeriod: isSet(object.liquidityRemovalLockPeriod)
        ? Long.fromString(object.liquidityRemovalLockPeriod)
        : Long.UZERO,
      liquidityRemovalCancelPeriod: isSet(object.liquidityRemovalCancelPeriod)
        ? Long.fromString(object.liquidityRemovalCancelPeriod)
        : Long.UZERO,
      rewardPeriods: Array.isArray(object?.rewardPeriods)
        ? object.rewardPeriods.map((e: any) => RewardPeriod.fromJSON(e))
        : [],
    };
  },

  toJSON(message: Params): unknown {
    const obj: any = {};
    message.minCreatePoolThreshold !== undefined &&
      (obj.minCreatePoolThreshold = (
        message.minCreatePoolThreshold || Long.UZERO
      ).toString());
    message.liquidityRemovalLockPeriod !== undefined &&
      (obj.liquidityRemovalLockPeriod = (
        message.liquidityRemovalLockPeriod || Long.UZERO
      ).toString());
    message.liquidityRemovalCancelPeriod !== undefined &&
      (obj.liquidityRemovalCancelPeriod = (
        message.liquidityRemovalCancelPeriod || Long.UZERO
      ).toString());
    if (message.rewardPeriods) {
      obj.rewardPeriods = message.rewardPeriods.map((e) =>
        e ? RewardPeriod.toJSON(e) : undefined,
      );
    } else {
      obj.rewardPeriods = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<Params>, I>>(object: I): Params {
    const message = createBaseParams();
    message.minCreatePoolThreshold =
      object.minCreatePoolThreshold !== undefined &&
      object.minCreatePoolThreshold !== null
        ? Long.fromValue(object.minCreatePoolThreshold)
        : Long.UZERO;
    message.liquidityRemovalLockPeriod =
      object.liquidityRemovalLockPeriod !== undefined &&
      object.liquidityRemovalLockPeriod !== null
        ? Long.fromValue(object.liquidityRemovalLockPeriod)
        : Long.UZERO;
    message.liquidityRemovalCancelPeriod =
      object.liquidityRemovalCancelPeriod !== undefined &&
      object.liquidityRemovalCancelPeriod !== null
        ? Long.fromValue(object.liquidityRemovalCancelPeriod)
        : Long.UZERO;
    message.rewardPeriods =
      object.rewardPeriods?.map((e) => RewardPeriod.fromPartial(e)) || [];
    return message;
  },
};

function createBaseRewardPeriod(): RewardPeriod {
  return {
    id: "",
    startBlock: Long.UZERO,
    endBlock: Long.UZERO,
    allocation: "",
    multipliers: [],
  };
}

export const RewardPeriod = {
  encode(
    message: RewardPeriod,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (!message.startBlock.isZero()) {
      writer.uint32(16).uint64(message.startBlock);
    }
    if (!message.endBlock.isZero()) {
      writer.uint32(24).uint64(message.endBlock);
    }
    if (message.allocation !== "") {
      writer.uint32(34).string(message.allocation);
    }
    for (const v of message.multipliers) {
      PoolMultiplier.encode(v!, writer.uint32(42).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RewardPeriod {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRewardPeriod();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        case 2:
          message.startBlock = reader.uint64() as Long;
          break;
        case 3:
          message.endBlock = reader.uint64() as Long;
          break;
        case 4:
          message.allocation = reader.string();
          break;
        case 5:
          message.multipliers.push(
            PoolMultiplier.decode(reader, reader.uint32()),
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): RewardPeriod {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      startBlock: isSet(object.startBlock)
        ? Long.fromString(object.startBlock)
        : Long.UZERO,
      endBlock: isSet(object.endBlock)
        ? Long.fromString(object.endBlock)
        : Long.UZERO,
      allocation: isSet(object.allocation) ? String(object.allocation) : "",
      multipliers: Array.isArray(object?.multipliers)
        ? object.multipliers.map((e: any) => PoolMultiplier.fromJSON(e))
        : [],
    };
  },

  toJSON(message: RewardPeriod): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.startBlock !== undefined &&
      (obj.startBlock = (message.startBlock || Long.UZERO).toString());
    message.endBlock !== undefined &&
      (obj.endBlock = (message.endBlock || Long.UZERO).toString());
    message.allocation !== undefined && (obj.allocation = message.allocation);
    if (message.multipliers) {
      obj.multipliers = message.multipliers.map((e) =>
        e ? PoolMultiplier.toJSON(e) : undefined,
      );
    } else {
      obj.multipliers = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<RewardPeriod>, I>>(
    object: I,
  ): RewardPeriod {
    const message = createBaseRewardPeriod();
    message.id = object.id ?? "";
    message.startBlock =
      object.startBlock !== undefined && object.startBlock !== null
        ? Long.fromValue(object.startBlock)
        : Long.UZERO;
    message.endBlock =
      object.endBlock !== undefined && object.endBlock !== null
        ? Long.fromValue(object.endBlock)
        : Long.UZERO;
    message.allocation = object.allocation ?? "";
    message.multipliers =
      object.multipliers?.map((e) => PoolMultiplier.fromPartial(e)) || [];
    return message;
  },
};

function createBasePoolMultiplier(): PoolMultiplier {
  return { asset: "", multiplier: "" };
}

export const PoolMultiplier = {
  encode(
    message: PoolMultiplier,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.asset !== "") {
      writer.uint32(10).string(message.asset);
    }
    if (message.multiplier !== "") {
      writer.uint32(18).string(message.multiplier);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PoolMultiplier {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePoolMultiplier();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.asset = reader.string();
          break;
        case 2:
          message.multiplier = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): PoolMultiplier {
    return {
      asset: isSet(object.asset) ? String(object.asset) : "",
      multiplier: isSet(object.multiplier) ? String(object.multiplier) : "",
    };
  },

  toJSON(message: PoolMultiplier): unknown {
    const obj: any = {};
    message.asset !== undefined && (obj.asset = message.asset);
    message.multiplier !== undefined && (obj.multiplier = message.multiplier);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<PoolMultiplier>, I>>(
    object: I,
  ): PoolMultiplier {
    const message = createBasePoolMultiplier();
    message.asset = object.asset ?? "";
    message.multiplier = object.multiplier ?? "";
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
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & Record<
        Exclude<keyof I, KeysOfUnion<P>>,
        never
      >;

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
