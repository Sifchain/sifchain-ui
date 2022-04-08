/* eslint-disable */
import Long from "long";
import * as _m0 from "protobufjs/minimal";

export const protobufPackage = "sifnode.clp.v1";

/** Params - used for initializing default parameter for clp at genesis */
export interface Params {
  minCreatePoolThreshold: number;
  /** in blocks */
  liquidityRemovalLockPeriod: number;
  /** in blocks */
  liquidityRemovalCancelPeriod: number;
  rewardPeriods: RewardPeriod[];
}

export interface RewardPeriod {
  id: string;
  startBlock: number;
  endBlock: number;
  allocation: string;
  multipliers: PoolMultiplier[];
}

export interface PoolMultiplier {
  asset: string;
  multiplier: string;
}

function createBaseParams(): Params {
  return {
    minCreatePoolThreshold: 0,
    liquidityRemovalLockPeriod: 0,
    liquidityRemovalCancelPeriod: 0,
    rewardPeriods: [],
  };
}

export const Params = {
  encode(
    message: Params,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.minCreatePoolThreshold !== 0) {
      writer.uint32(8).uint64(message.minCreatePoolThreshold);
    }
    if (message.liquidityRemovalLockPeriod !== 0) {
      writer.uint32(16).uint64(message.liquidityRemovalLockPeriod);
    }
    if (message.liquidityRemovalCancelPeriod !== 0) {
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
          message.minCreatePoolThreshold = longToNumber(
            reader.uint64() as Long,
          );
          break;
        case 2:
          message.liquidityRemovalLockPeriod = longToNumber(
            reader.uint64() as Long,
          );
          break;
        case 3:
          message.liquidityRemovalCancelPeriod = longToNumber(
            reader.uint64() as Long,
          );
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
        ? Number(object.minCreatePoolThreshold)
        : 0,
      liquidityRemovalLockPeriod: isSet(object.liquidityRemovalLockPeriod)
        ? Number(object.liquidityRemovalLockPeriod)
        : 0,
      liquidityRemovalCancelPeriod: isSet(object.liquidityRemovalCancelPeriod)
        ? Number(object.liquidityRemovalCancelPeriod)
        : 0,
      rewardPeriods: Array.isArray(object?.rewardPeriods)
        ? object.rewardPeriods.map((e: any) => RewardPeriod.fromJSON(e))
        : [],
    };
  },

  toJSON(message: Params): unknown {
    const obj: any = {};
    message.minCreatePoolThreshold !== undefined &&
      (obj.minCreatePoolThreshold = Math.round(message.minCreatePoolThreshold));
    message.liquidityRemovalLockPeriod !== undefined &&
      (obj.liquidityRemovalLockPeriod = Math.round(
        message.liquidityRemovalLockPeriod,
      ));
    message.liquidityRemovalCancelPeriod !== undefined &&
      (obj.liquidityRemovalCancelPeriod = Math.round(
        message.liquidityRemovalCancelPeriod,
      ));
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
    message.minCreatePoolThreshold = object.minCreatePoolThreshold ?? 0;
    message.liquidityRemovalLockPeriod = object.liquidityRemovalLockPeriod ?? 0;
    message.liquidityRemovalCancelPeriod =
      object.liquidityRemovalCancelPeriod ?? 0;
    message.rewardPeriods =
      object.rewardPeriods?.map((e) => RewardPeriod.fromPartial(e)) || [];
    return message;
  },
};

function createBaseRewardPeriod(): RewardPeriod {
  return {
    id: "",
    startBlock: 0,
    endBlock: 0,
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
    if (message.startBlock !== 0) {
      writer.uint32(16).uint64(message.startBlock);
    }
    if (message.endBlock !== 0) {
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
          message.startBlock = longToNumber(reader.uint64() as Long);
          break;
        case 3:
          message.endBlock = longToNumber(reader.uint64() as Long);
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
      startBlock: isSet(object.startBlock) ? Number(object.startBlock) : 0,
      endBlock: isSet(object.endBlock) ? Number(object.endBlock) : 0,
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
      (obj.startBlock = Math.round(message.startBlock));
    message.endBlock !== undefined &&
      (obj.endBlock = Math.round(message.endBlock));
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
    message.startBlock = object.startBlock ?? 0;
    message.endBlock = object.endBlock ?? 0;
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

declare var self: any | undefined;
declare var window: any | undefined;
declare var global: any | undefined;
var globalThis: any = (() => {
  if (typeof globalThis !== "undefined") return globalThis;
  if (typeof self !== "undefined") return self;
  if (typeof window !== "undefined") return window;
  if (typeof global !== "undefined") return global;
  throw "Unable to locate global object";
})();

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

function longToNumber(long: Long): number {
  if (long.gt(Number.MAX_SAFE_INTEGER)) {
    throw new globalThis.Error("Value is larger than Number.MAX_SAFE_INTEGER");
  }
  return long.toNumber();
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
