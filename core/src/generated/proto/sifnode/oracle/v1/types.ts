/* eslint-disable */
import Long from "long";
import * as _m0 from "protobufjs/minimal";

export const protobufPackage = "sifnode.oracle.v1";

/** StatusText is an enum used to represent the status of the prophecy */
export enum StatusText {
  /** STATUS_TEXT_UNSPECIFIED - Default value */
  STATUS_TEXT_UNSPECIFIED = 0,
  /** STATUS_TEXT_PENDING - Pending status */
  STATUS_TEXT_PENDING = 1,
  /** STATUS_TEXT_SUCCESS - Success status */
  STATUS_TEXT_SUCCESS = 2,
  /** STATUS_TEXT_FAILED - Failed status */
  STATUS_TEXT_FAILED = 3,
  UNRECOGNIZED = -1,
}

export function statusTextFromJSON(object: any): StatusText {
  switch (object) {
    case 0:
    case "STATUS_TEXT_UNSPECIFIED":
      return StatusText.STATUS_TEXT_UNSPECIFIED;
    case 1:
    case "STATUS_TEXT_PENDING":
      return StatusText.STATUS_TEXT_PENDING;
    case 2:
    case "STATUS_TEXT_SUCCESS":
      return StatusText.STATUS_TEXT_SUCCESS;
    case 3:
    case "STATUS_TEXT_FAILED":
      return StatusText.STATUS_TEXT_FAILED;
    case -1:
    case "UNRECOGNIZED":
    default:
      return StatusText.UNRECOGNIZED;
  }
}

export function statusTextToJSON(object: StatusText): string {
  switch (object) {
    case StatusText.STATUS_TEXT_UNSPECIFIED:
      return "STATUS_TEXT_UNSPECIFIED";
    case StatusText.STATUS_TEXT_PENDING:
      return "STATUS_TEXT_PENDING";
    case StatusText.STATUS_TEXT_SUCCESS:
      return "STATUS_TEXT_SUCCESS";
    case StatusText.STATUS_TEXT_FAILED:
      return "STATUS_TEXT_FAILED";
    default:
      return "UNKNOWN";
  }
}

export interface GenesisState {
  addressWhitelist: string[];
  adminAddress: string;
  prophecies: DBProphecy[];
}

/**
 * Claim contains an arbitrary claim with arbitrary content made by a given
 * validator
 */
export interface Claim {
  id: string;
  validatorAddress: string;
  content: string;
}

/**
 * DBProphecy is what the prophecy becomes when being saved to the database.
 *  Tendermint/Amino does not support maps so we must serialize those variables
 *  into bytes.
 */
export interface DBProphecy {
  id: string;
  status?: Status;
  claimValidators: Uint8Array;
  validatorClaims: Uint8Array;
}

/** Status is a struct that contains the status of a given prophecy */
export interface Status {
  text: StatusText;
  finalClaim: string;
}

function createBaseGenesisState(): GenesisState {
  return { addressWhitelist: [], adminAddress: "", prophecies: [] };
}

export const GenesisState = {
  encode(
    message: GenesisState,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    for (const v of message.addressWhitelist) {
      writer.uint32(10).string(v!);
    }
    if (message.adminAddress !== "") {
      writer.uint32(18).string(message.adminAddress);
    }
    for (const v of message.prophecies) {
      DBProphecy.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GenesisState {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGenesisState();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.addressWhitelist.push(reader.string());
          break;
        case 2:
          message.adminAddress = reader.string();
          break;
        case 3:
          message.prophecies.push(DBProphecy.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): GenesisState {
    return {
      addressWhitelist: Array.isArray(object?.addressWhitelist)
        ? object.addressWhitelist.map((e: any) => String(e))
        : [],
      adminAddress: isSet(object.adminAddress)
        ? String(object.adminAddress)
        : "",
      prophecies: Array.isArray(object?.prophecies)
        ? object.prophecies.map((e: any) => DBProphecy.fromJSON(e))
        : [],
    };
  },

  toJSON(message: GenesisState): unknown {
    const obj: any = {};
    if (message.addressWhitelist) {
      obj.addressWhitelist = message.addressWhitelist.map((e) => e);
    } else {
      obj.addressWhitelist = [];
    }
    message.adminAddress !== undefined &&
      (obj.adminAddress = message.adminAddress);
    if (message.prophecies) {
      obj.prophecies = message.prophecies.map((e) =>
        e ? DBProphecy.toJSON(e) : undefined,
      );
    } else {
      obj.prophecies = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<GenesisState>, I>>(
    object: I,
  ): GenesisState {
    const message = createBaseGenesisState();
    message.addressWhitelist = object.addressWhitelist?.map((e) => e) || [];
    message.adminAddress = object.adminAddress ?? "";
    message.prophecies =
      object.prophecies?.map((e) => DBProphecy.fromPartial(e)) || [];
    return message;
  },
};

function createBaseClaim(): Claim {
  return { id: "", validatorAddress: "", content: "" };
}

export const Claim = {
  encode(message: Claim, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.validatorAddress !== "") {
      writer.uint32(18).string(message.validatorAddress);
    }
    if (message.content !== "") {
      writer.uint32(26).string(message.content);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Claim {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseClaim();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        case 2:
          message.validatorAddress = reader.string();
          break;
        case 3:
          message.content = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Claim {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      validatorAddress: isSet(object.validatorAddress)
        ? String(object.validatorAddress)
        : "",
      content: isSet(object.content) ? String(object.content) : "",
    };
  },

  toJSON(message: Claim): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.validatorAddress !== undefined &&
      (obj.validatorAddress = message.validatorAddress);
    message.content !== undefined && (obj.content = message.content);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<Claim>, I>>(object: I): Claim {
    const message = createBaseClaim();
    message.id = object.id ?? "";
    message.validatorAddress = object.validatorAddress ?? "";
    message.content = object.content ?? "";
    return message;
  },
};

function createBaseDBProphecy(): DBProphecy {
  return {
    id: "",
    status: undefined,
    claimValidators: new Uint8Array(),
    validatorClaims: new Uint8Array(),
  };
}

export const DBProphecy = {
  encode(
    message: DBProphecy,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.status !== undefined) {
      Status.encode(message.status, writer.uint32(18).fork()).ldelim();
    }
    if (message.claimValidators.length !== 0) {
      writer.uint32(26).bytes(message.claimValidators);
    }
    if (message.validatorClaims.length !== 0) {
      writer.uint32(34).bytes(message.validatorClaims);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DBProphecy {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDBProphecy();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        case 2:
          message.status = Status.decode(reader, reader.uint32());
          break;
        case 3:
          message.claimValidators = reader.bytes();
          break;
        case 4:
          message.validatorClaims = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DBProphecy {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      status: isSet(object.status) ? Status.fromJSON(object.status) : undefined,
      claimValidators: isSet(object.claimValidators)
        ? bytesFromBase64(object.claimValidators)
        : new Uint8Array(),
      validatorClaims: isSet(object.validatorClaims)
        ? bytesFromBase64(object.validatorClaims)
        : new Uint8Array(),
    };
  },

  toJSON(message: DBProphecy): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.status !== undefined &&
      (obj.status = message.status ? Status.toJSON(message.status) : undefined);
    message.claimValidators !== undefined &&
      (obj.claimValidators = base64FromBytes(
        message.claimValidators !== undefined
          ? message.claimValidators
          : new Uint8Array(),
      ));
    message.validatorClaims !== undefined &&
      (obj.validatorClaims = base64FromBytes(
        message.validatorClaims !== undefined
          ? message.validatorClaims
          : new Uint8Array(),
      ));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DBProphecy>, I>>(
    object: I,
  ): DBProphecy {
    const message = createBaseDBProphecy();
    message.id = object.id ?? "";
    message.status =
      object.status !== undefined && object.status !== null
        ? Status.fromPartial(object.status)
        : undefined;
    message.claimValidators = object.claimValidators ?? new Uint8Array();
    message.validatorClaims = object.validatorClaims ?? new Uint8Array();
    return message;
  },
};

function createBaseStatus(): Status {
  return { text: 0, finalClaim: "" };
}

export const Status = {
  encode(
    message: Status,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.text !== 0) {
      writer.uint32(8).int32(message.text);
    }
    if (message.finalClaim !== "") {
      writer.uint32(18).string(message.finalClaim);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Status {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStatus();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.text = reader.int32() as any;
          break;
        case 2:
          message.finalClaim = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Status {
    return {
      text: isSet(object.text) ? statusTextFromJSON(object.text) : 0,
      finalClaim: isSet(object.finalClaim) ? String(object.finalClaim) : "",
    };
  },

  toJSON(message: Status): unknown {
    const obj: any = {};
    message.text !== undefined && (obj.text = statusTextToJSON(message.text));
    message.finalClaim !== undefined && (obj.finalClaim = message.finalClaim);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<Status>, I>>(object: I): Status {
    const message = createBaseStatus();
    message.text = object.text ?? 0;
    message.finalClaim = object.finalClaim ?? "";
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

const atob: (b64: string) => string =
  globalThis.atob ||
  ((b64) => globalThis.Buffer.from(b64, "base64").toString("binary"));
function bytesFromBase64(b64: string): Uint8Array {
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; ++i) {
    arr[i] = bin.charCodeAt(i);
  }
  return arr;
}

const btoa: (bin: string) => string =
  globalThis.btoa ||
  ((bin) => globalThis.Buffer.from(bin, "binary").toString("base64"));
function base64FromBytes(arr: Uint8Array): string {
  const bin: string[] = [];
  arr.forEach((byte) => {
    bin.push(String.fromCharCode(byte));
  });
  return btoa(bin.join(""));
}

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
