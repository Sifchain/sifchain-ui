/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";
import { MTP } from "../../../sifnode/margin/v1/types";

export const protobufPackage = "sifnode.margin.v1";

export interface MTPRequest {
  address: string;
  id: Long;
}

export interface MTPResponse {
  mtp?: MTP;
}

export interface PositionsForAddressRequest {
  address: string;
}

export interface PositionsForAddressResponse {
  mtps: MTP[];
}

function createBaseMTPRequest(): MTPRequest {
  return { address: "", id: Long.UZERO };
}

export const MTPRequest = {
  encode(
    message: MTPRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.address !== "") {
      writer.uint32(10).string(message.address);
    }
    if (!message.id.isZero()) {
      writer.uint32(16).uint64(message.id);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MTPRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMTPRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.address = reader.string();
          break;
        case 2:
          message.id = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MTPRequest {
    return {
      address: isSet(object.address) ? String(object.address) : "",
      id: isSet(object.id) ? Long.fromString(object.id) : Long.UZERO,
    };
  },

  toJSON(message: MTPRequest): unknown {
    const obj: any = {};
    message.address !== undefined && (obj.address = message.address);
    message.id !== undefined &&
      (obj.id = (message.id || Long.UZERO).toString());
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MTPRequest>, I>>(
    object: I,
  ): MTPRequest {
    const message = createBaseMTPRequest();
    message.address = object.address ?? "";
    message.id =
      object.id !== undefined && object.id !== null
        ? Long.fromValue(object.id)
        : Long.UZERO;
    return message;
  },
};

function createBaseMTPResponse(): MTPResponse {
  return { mtp: undefined };
}

export const MTPResponse = {
  encode(
    message: MTPResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.mtp !== undefined) {
      MTP.encode(message.mtp, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MTPResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMTPResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.mtp = MTP.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MTPResponse {
    return {
      mtp: isSet(object.mtp) ? MTP.fromJSON(object.mtp) : undefined,
    };
  },

  toJSON(message: MTPResponse): unknown {
    const obj: any = {};
    message.mtp !== undefined &&
      (obj.mtp = message.mtp ? MTP.toJSON(message.mtp) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MTPResponse>, I>>(
    object: I,
  ): MTPResponse {
    const message = createBaseMTPResponse();
    message.mtp =
      object.mtp !== undefined && object.mtp !== null
        ? MTP.fromPartial(object.mtp)
        : undefined;
    return message;
  },
};

function createBasePositionsForAddressRequest(): PositionsForAddressRequest {
  return { address: "" };
}

export const PositionsForAddressRequest = {
  encode(
    message: PositionsForAddressRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.address !== "") {
      writer.uint32(10).string(message.address);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): PositionsForAddressRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePositionsForAddressRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.address = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): PositionsForAddressRequest {
    return {
      address: isSet(object.address) ? String(object.address) : "",
    };
  },

  toJSON(message: PositionsForAddressRequest): unknown {
    const obj: any = {};
    message.address !== undefined && (obj.address = message.address);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<PositionsForAddressRequest>, I>>(
    object: I,
  ): PositionsForAddressRequest {
    const message = createBasePositionsForAddressRequest();
    message.address = object.address ?? "";
    return message;
  },
};

function createBasePositionsForAddressResponse(): PositionsForAddressResponse {
  return { mtps: [] };
}

export const PositionsForAddressResponse = {
  encode(
    message: PositionsForAddressResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    for (const v of message.mtps) {
      MTP.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): PositionsForAddressResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePositionsForAddressResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.mtps.push(MTP.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): PositionsForAddressResponse {
    return {
      mtps: Array.isArray(object?.mtps)
        ? object.mtps.map((e: any) => MTP.fromJSON(e))
        : [],
    };
  },

  toJSON(message: PositionsForAddressResponse): unknown {
    const obj: any = {};
    if (message.mtps) {
      obj.mtps = message.mtps.map((e) => (e ? MTP.toJSON(e) : undefined));
    } else {
      obj.mtps = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<PositionsForAddressResponse>, I>>(
    object: I,
  ): PositionsForAddressResponse {
    const message = createBasePositionsForAddressResponse();
    message.mtps = object.mtps?.map((e) => MTP.fromPartial(e)) || [];
    return message;
  },
};

export interface Query {
  GetMTP(request: MTPRequest): Promise<MTPResponse>;
  GetPositionsForAddress(
    request: PositionsForAddressRequest,
  ): Promise<PositionsForAddressResponse>;
}

export class QueryClientImpl implements Query {
  private readonly rpc: Rpc;
  constructor(rpc: Rpc) {
    this.rpc = rpc;
    this.GetMTP = this.GetMTP.bind(this);
    this.GetPositionsForAddress = this.GetPositionsForAddress.bind(this);
  }
  GetMTP(request: MTPRequest): Promise<MTPResponse> {
    const data = MTPRequest.encode(request).finish();
    const promise = this.rpc.request("sifnode.margin.v1.Query", "GetMTP", data);
    return promise.then((data) => MTPResponse.decode(new _m0.Reader(data)));
  }

  GetPositionsForAddress(
    request: PositionsForAddressRequest,
  ): Promise<PositionsForAddressResponse> {
    const data = PositionsForAddressRequest.encode(request).finish();
    const promise = this.rpc.request(
      "sifnode.margin.v1.Query",
      "GetPositionsForAddress",
      data,
    );
    return promise.then((data) =>
      PositionsForAddressResponse.decode(new _m0.Reader(data)),
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
