/* eslint-disable */
import Long from "long";
import * as _m0 from "protobufjs/minimal";

export const protobufPackage = "sifnode.clp.v1";

/** Params - used for initializing default parameter for clp at genesis */
export interface Params {
  minCreatePoolThreshold: Long;
}

/** These params are non-governable and are calculated on chain */
export interface PmtpRateParams {
  pmtpPeriodBlockRate: string;
  pmtpCurrentRunningRate: string;
  pmtpInterPolicyRate: string;
}

export interface PmtpParams {
  pmtpPeriodGovernanceRate: string;
  pmtpPeriodEpochLength: Long;
  pmtpPeriodStartBlock: Long;
  pmtpPeriodEndBlock: Long;
}

function createBaseParams(): Params {
  return { minCreatePoolThreshold: Long.UZERO };
}

export const Params = {
  encode(
    message: Params,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (!message.minCreatePoolThreshold.isZero()) {
      writer.uint32(8).uint64(message.minCreatePoolThreshold);
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
    };
  },

  toJSON(message: Params): unknown {
    const obj: any = {};
    message.minCreatePoolThreshold !== undefined &&
      (obj.minCreatePoolThreshold = (
        message.minCreatePoolThreshold || Long.UZERO
      ).toString());
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<Params>, I>>(object: I): Params {
    const message = createBaseParams();
    message.minCreatePoolThreshold =
      object.minCreatePoolThreshold !== undefined &&
      object.minCreatePoolThreshold !== null
        ? Long.fromValue(object.minCreatePoolThreshold)
        : Long.UZERO;
    return message;
  },
};

function createBasePmtpRateParams(): PmtpRateParams {
  return {
    pmtpPeriodBlockRate: "",
    pmtpCurrentRunningRate: "",
    pmtpInterPolicyRate: "",
  };
}

export const PmtpRateParams = {
  encode(
    message: PmtpRateParams,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.pmtpPeriodBlockRate !== "") {
      writer.uint32(18).string(message.pmtpPeriodBlockRate);
    }
    if (message.pmtpCurrentRunningRate !== "") {
      writer.uint32(26).string(message.pmtpCurrentRunningRate);
    }
    if (message.pmtpInterPolicyRate !== "") {
      writer.uint32(34).string(message.pmtpInterPolicyRate);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PmtpRateParams {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePmtpRateParams();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2:
          message.pmtpPeriodBlockRate = reader.string();
          break;
        case 3:
          message.pmtpCurrentRunningRate = reader.string();
          break;
        case 4:
          message.pmtpInterPolicyRate = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): PmtpRateParams {
    return {
      pmtpPeriodBlockRate: isSet(object.pmtpPeriodBlockRate)
        ? String(object.pmtpPeriodBlockRate)
        : "",
      pmtpCurrentRunningRate: isSet(object.pmtpCurrentRunningRate)
        ? String(object.pmtpCurrentRunningRate)
        : "",
      pmtpInterPolicyRate: isSet(object.pmtpInterPolicyRate)
        ? String(object.pmtpInterPolicyRate)
        : "",
    };
  },

  toJSON(message: PmtpRateParams): unknown {
    const obj: any = {};
    message.pmtpPeriodBlockRate !== undefined &&
      (obj.pmtpPeriodBlockRate = message.pmtpPeriodBlockRate);
    message.pmtpCurrentRunningRate !== undefined &&
      (obj.pmtpCurrentRunningRate = message.pmtpCurrentRunningRate);
    message.pmtpInterPolicyRate !== undefined &&
      (obj.pmtpInterPolicyRate = message.pmtpInterPolicyRate);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<PmtpRateParams>, I>>(
    object: I,
  ): PmtpRateParams {
    const message = createBasePmtpRateParams();
    message.pmtpPeriodBlockRate = object.pmtpPeriodBlockRate ?? "";
    message.pmtpCurrentRunningRate = object.pmtpCurrentRunningRate ?? "";
    message.pmtpInterPolicyRate = object.pmtpInterPolicyRate ?? "";
    return message;
  },
};

function createBasePmtpParams(): PmtpParams {
  return {
    pmtpPeriodGovernanceRate: "",
    pmtpPeriodEpochLength: Long.ZERO,
    pmtpPeriodStartBlock: Long.ZERO,
    pmtpPeriodEndBlock: Long.ZERO,
  };
}

export const PmtpParams = {
  encode(
    message: PmtpParams,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.pmtpPeriodGovernanceRate !== "") {
      writer.uint32(10).string(message.pmtpPeriodGovernanceRate);
    }
    if (!message.pmtpPeriodEpochLength.isZero()) {
      writer.uint32(16).int64(message.pmtpPeriodEpochLength);
    }
    if (!message.pmtpPeriodStartBlock.isZero()) {
      writer.uint32(24).int64(message.pmtpPeriodStartBlock);
    }
    if (!message.pmtpPeriodEndBlock.isZero()) {
      writer.uint32(32).int64(message.pmtpPeriodEndBlock);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PmtpParams {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePmtpParams();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.pmtpPeriodGovernanceRate = reader.string();
          break;
        case 2:
          message.pmtpPeriodEpochLength = reader.int64() as Long;
          break;
        case 3:
          message.pmtpPeriodStartBlock = reader.int64() as Long;
          break;
        case 4:
          message.pmtpPeriodEndBlock = reader.int64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): PmtpParams {
    return {
      pmtpPeriodGovernanceRate: isSet(object.pmtpPeriodGovernanceRate)
        ? String(object.pmtpPeriodGovernanceRate)
        : "",
      pmtpPeriodEpochLength: isSet(object.pmtpPeriodEpochLength)
        ? Long.fromString(object.pmtpPeriodEpochLength)
        : Long.ZERO,
      pmtpPeriodStartBlock: isSet(object.pmtpPeriodStartBlock)
        ? Long.fromString(object.pmtpPeriodStartBlock)
        : Long.ZERO,
      pmtpPeriodEndBlock: isSet(object.pmtpPeriodEndBlock)
        ? Long.fromString(object.pmtpPeriodEndBlock)
        : Long.ZERO,
    };
  },

  toJSON(message: PmtpParams): unknown {
    const obj: any = {};
    message.pmtpPeriodGovernanceRate !== undefined &&
      (obj.pmtpPeriodGovernanceRate = message.pmtpPeriodGovernanceRate);
    message.pmtpPeriodEpochLength !== undefined &&
      (obj.pmtpPeriodEpochLength = (
        message.pmtpPeriodEpochLength || Long.ZERO
      ).toString());
    message.pmtpPeriodStartBlock !== undefined &&
      (obj.pmtpPeriodStartBlock = (
        message.pmtpPeriodStartBlock || Long.ZERO
      ).toString());
    message.pmtpPeriodEndBlock !== undefined &&
      (obj.pmtpPeriodEndBlock = (
        message.pmtpPeriodEndBlock || Long.ZERO
      ).toString());
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<PmtpParams>, I>>(
    object: I,
  ): PmtpParams {
    const message = createBasePmtpParams();
    message.pmtpPeriodGovernanceRate = object.pmtpPeriodGovernanceRate ?? "";
    message.pmtpPeriodEpochLength =
      object.pmtpPeriodEpochLength !== undefined &&
      object.pmtpPeriodEpochLength !== null
        ? Long.fromValue(object.pmtpPeriodEpochLength)
        : Long.ZERO;
    message.pmtpPeriodStartBlock =
      object.pmtpPeriodStartBlock !== undefined &&
      object.pmtpPeriodStartBlock !== null
        ? Long.fromValue(object.pmtpPeriodStartBlock)
        : Long.ZERO;
    message.pmtpPeriodEndBlock =
      object.pmtpPeriodEndBlock !== undefined &&
      object.pmtpPeriodEndBlock !== null
        ? Long.fromValue(object.pmtpPeriodEndBlock)
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
