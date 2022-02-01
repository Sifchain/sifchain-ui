/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";

export const protobufPackage = "sifnode.margin.v1";

export interface MsgOpenLong {
  signer: string;
  collateralAsset: string;
  collateralAmount: string;
  borrowAsset: string;
}

export interface MsgOpenLongResponse {}

export interface MsgCloseLong {
  signer: string;
  collateralAsset: string;
  borrowAsset: string;
}

export interface MsgCloseLongResponse {}

function createBaseMsgOpenLong(): MsgOpenLong {
  return {
    signer: "",
    collateralAsset: "",
    collateralAmount: "",
    borrowAsset: "",
  };
}

export const MsgOpenLong = {
  encode(
    message: MsgOpenLong,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.signer !== "") {
      writer.uint32(10).string(message.signer);
    }
    if (message.collateralAsset !== "") {
      writer.uint32(18).string(message.collateralAsset);
    }
    if (message.collateralAmount !== "") {
      writer.uint32(26).string(message.collateralAmount);
    }
    if (message.borrowAsset !== "") {
      writer.uint32(34).string(message.borrowAsset);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgOpenLong {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgOpenLong();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.signer = reader.string();
          break;
        case 2:
          message.collateralAsset = reader.string();
          break;
        case 3:
          message.collateralAmount = reader.string();
          break;
        case 4:
          message.borrowAsset = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgOpenLong {
    return {
      signer: isSet(object.signer) ? String(object.signer) : "",
      collateralAsset: isSet(object.collateralAsset)
        ? String(object.collateralAsset)
        : "",
      collateralAmount: isSet(object.collateralAmount)
        ? String(object.collateralAmount)
        : "",
      borrowAsset: isSet(object.borrowAsset) ? String(object.borrowAsset) : "",
    };
  },

  toJSON(message: MsgOpenLong): unknown {
    const obj: any = {};
    message.signer !== undefined && (obj.signer = message.signer);
    message.collateralAsset !== undefined &&
      (obj.collateralAsset = message.collateralAsset);
    message.collateralAmount !== undefined &&
      (obj.collateralAmount = message.collateralAmount);
    message.borrowAsset !== undefined &&
      (obj.borrowAsset = message.borrowAsset);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgOpenLong>, I>>(
    object: I,
  ): MsgOpenLong {
    const message = createBaseMsgOpenLong();
    message.signer = object.signer ?? "";
    message.collateralAsset = object.collateralAsset ?? "";
    message.collateralAmount = object.collateralAmount ?? "";
    message.borrowAsset = object.borrowAsset ?? "";
    return message;
  },
};

function createBaseMsgOpenLongResponse(): MsgOpenLongResponse {
  return {};
}

export const MsgOpenLongResponse = {
  encode(
    _: MsgOpenLongResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgOpenLongResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgOpenLongResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): MsgOpenLongResponse {
    return {};
  },

  toJSON(_: MsgOpenLongResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgOpenLongResponse>, I>>(
    _: I,
  ): MsgOpenLongResponse {
    const message = createBaseMsgOpenLongResponse();
    return message;
  },
};

function createBaseMsgCloseLong(): MsgCloseLong {
  return { signer: "", collateralAsset: "", borrowAsset: "" };
}

export const MsgCloseLong = {
  encode(
    message: MsgCloseLong,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.signer !== "") {
      writer.uint32(10).string(message.signer);
    }
    if (message.collateralAsset !== "") {
      writer.uint32(18).string(message.collateralAsset);
    }
    if (message.borrowAsset !== "") {
      writer.uint32(26).string(message.borrowAsset);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgCloseLong {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCloseLong();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.signer = reader.string();
          break;
        case 2:
          message.collateralAsset = reader.string();
          break;
        case 3:
          message.borrowAsset = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgCloseLong {
    return {
      signer: isSet(object.signer) ? String(object.signer) : "",
      collateralAsset: isSet(object.collateralAsset)
        ? String(object.collateralAsset)
        : "",
      borrowAsset: isSet(object.borrowAsset) ? String(object.borrowAsset) : "",
    };
  },

  toJSON(message: MsgCloseLong): unknown {
    const obj: any = {};
    message.signer !== undefined && (obj.signer = message.signer);
    message.collateralAsset !== undefined &&
      (obj.collateralAsset = message.collateralAsset);
    message.borrowAsset !== undefined &&
      (obj.borrowAsset = message.borrowAsset);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgCloseLong>, I>>(
    object: I,
  ): MsgCloseLong {
    const message = createBaseMsgCloseLong();
    message.signer = object.signer ?? "";
    message.collateralAsset = object.collateralAsset ?? "";
    message.borrowAsset = object.borrowAsset ?? "";
    return message;
  },
};

function createBaseMsgCloseLongResponse(): MsgCloseLongResponse {
  return {};
}

export const MsgCloseLongResponse = {
  encode(
    _: MsgCloseLongResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): MsgCloseLongResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCloseLongResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): MsgCloseLongResponse {
    return {};
  },

  toJSON(_: MsgCloseLongResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgCloseLongResponse>, I>>(
    _: I,
  ): MsgCloseLongResponse {
    const message = createBaseMsgCloseLongResponse();
    return message;
  },
};

export interface Msg {
  OpenLong(request: MsgOpenLong): Promise<MsgOpenLongResponse>;
  CloseLong(request: MsgCloseLong): Promise<MsgCloseLongResponse>;
}

export class MsgClientImpl implements Msg {
  private readonly rpc: Rpc;
  constructor(rpc: Rpc) {
    this.rpc = rpc;
    this.OpenLong = this.OpenLong.bind(this);
    this.CloseLong = this.CloseLong.bind(this);
  }
  OpenLong(request: MsgOpenLong): Promise<MsgOpenLongResponse> {
    const data = MsgOpenLong.encode(request).finish();
    const promise = this.rpc.request("sifnode.margin.v1.Msg", "OpenLong", data);
    return promise.then((data) =>
      MsgOpenLongResponse.decode(new _m0.Reader(data)),
    );
  }

  CloseLong(request: MsgCloseLong): Promise<MsgCloseLongResponse> {
    const data = MsgCloseLong.encode(request).finish();
    const promise = this.rpc.request(
      "sifnode.margin.v1.Msg",
      "CloseLong",
      data,
    );
    return promise.then((data) =>
      MsgCloseLongResponse.decode(new _m0.Reader(data)),
    );
  }
}

interface Rpc {
  request(
    service: string,
    method: string,
    data: Uint8Array,
  ): Promise<Uint8Array>;
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
