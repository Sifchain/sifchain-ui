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

const baseMsgOpenLong: object = {
  signer: "",
  collateralAsset: "",
  collateralAmount: "",
  borrowAsset: "",
};

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
    const message = { ...baseMsgOpenLong } as MsgOpenLong;
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
    const message = { ...baseMsgOpenLong } as MsgOpenLong;
    if (object.signer !== undefined && object.signer !== null) {
      message.signer = String(object.signer);
    } else {
      message.signer = "";
    }
    if (
      object.collateralAsset !== undefined &&
      object.collateralAsset !== null
    ) {
      message.collateralAsset = String(object.collateralAsset);
    } else {
      message.collateralAsset = "";
    }
    if (
      object.collateralAmount !== undefined &&
      object.collateralAmount !== null
    ) {
      message.collateralAmount = String(object.collateralAmount);
    } else {
      message.collateralAmount = "";
    }
    if (object.borrowAsset !== undefined && object.borrowAsset !== null) {
      message.borrowAsset = String(object.borrowAsset);
    } else {
      message.borrowAsset = "";
    }
    return message;
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

  fromPartial(object: DeepPartial<MsgOpenLong>): MsgOpenLong {
    const message = { ...baseMsgOpenLong } as MsgOpenLong;
    if (object.signer !== undefined && object.signer !== null) {
      message.signer = object.signer;
    } else {
      message.signer = "";
    }
    if (
      object.collateralAsset !== undefined &&
      object.collateralAsset !== null
    ) {
      message.collateralAsset = object.collateralAsset;
    } else {
      message.collateralAsset = "";
    }
    if (
      object.collateralAmount !== undefined &&
      object.collateralAmount !== null
    ) {
      message.collateralAmount = object.collateralAmount;
    } else {
      message.collateralAmount = "";
    }
    if (object.borrowAsset !== undefined && object.borrowAsset !== null) {
      message.borrowAsset = object.borrowAsset;
    } else {
      message.borrowAsset = "";
    }
    return message;
  },
};

const baseMsgOpenLongResponse: object = {};

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
    const message = { ...baseMsgOpenLongResponse } as MsgOpenLongResponse;
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
    const message = { ...baseMsgOpenLongResponse } as MsgOpenLongResponse;
    return message;
  },

  toJSON(_: MsgOpenLongResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial(_: DeepPartial<MsgOpenLongResponse>): MsgOpenLongResponse {
    const message = { ...baseMsgOpenLongResponse } as MsgOpenLongResponse;
    return message;
  },
};

const baseMsgCloseLong: object = {
  signer: "",
  collateralAsset: "",
  borrowAsset: "",
};

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
    const message = { ...baseMsgCloseLong } as MsgCloseLong;
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
    const message = { ...baseMsgCloseLong } as MsgCloseLong;
    if (object.signer !== undefined && object.signer !== null) {
      message.signer = String(object.signer);
    } else {
      message.signer = "";
    }
    if (
      object.collateralAsset !== undefined &&
      object.collateralAsset !== null
    ) {
      message.collateralAsset = String(object.collateralAsset);
    } else {
      message.collateralAsset = "";
    }
    if (object.borrowAsset !== undefined && object.borrowAsset !== null) {
      message.borrowAsset = String(object.borrowAsset);
    } else {
      message.borrowAsset = "";
    }
    return message;
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

  fromPartial(object: DeepPartial<MsgCloseLong>): MsgCloseLong {
    const message = { ...baseMsgCloseLong } as MsgCloseLong;
    if (object.signer !== undefined && object.signer !== null) {
      message.signer = object.signer;
    } else {
      message.signer = "";
    }
    if (
      object.collateralAsset !== undefined &&
      object.collateralAsset !== null
    ) {
      message.collateralAsset = object.collateralAsset;
    } else {
      message.collateralAsset = "";
    }
    if (object.borrowAsset !== undefined && object.borrowAsset !== null) {
      message.borrowAsset = object.borrowAsset;
    } else {
      message.borrowAsset = "";
    }
    return message;
  },
};

const baseMsgCloseLongResponse: object = {};

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
    const message = { ...baseMsgCloseLongResponse } as MsgCloseLongResponse;
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
    const message = { ...baseMsgCloseLongResponse } as MsgCloseLongResponse;
    return message;
  },

  toJSON(_: MsgCloseLongResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial(_: DeepPartial<MsgCloseLongResponse>): MsgCloseLongResponse {
    const message = { ...baseMsgCloseLongResponse } as MsgCloseLongResponse;
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
  | undefined
  | Long;
export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends {}
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}
