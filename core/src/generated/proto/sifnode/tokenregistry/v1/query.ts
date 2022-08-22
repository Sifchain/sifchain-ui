/* eslint-disable */
import { Registry } from "./types";
import Long from "long";
import _m0 from "protobufjs/minimal";

export const protobufPackage = "sifnode.tokenregistry.v1";

export interface QueryEntriesResponse {
  registry?: Registry;
}

export interface QueryEntriesRequest {}

function createBaseQueryEntriesResponse(): QueryEntriesResponse {
  return { registry: undefined };
}

export const QueryEntriesResponse = {
  encode(
    message: QueryEntriesResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.registry !== undefined) {
      Registry.encode(message.registry, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): QueryEntriesResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryEntriesResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.registry = Registry.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryEntriesResponse {
    return {
      registry: isSet(object.registry)
        ? Registry.fromJSON(object.registry)
        : undefined,
    };
  },

  toJSON(message: QueryEntriesResponse): unknown {
    const obj: any = {};
    message.registry !== undefined &&
      (obj.registry = message.registry
        ? Registry.toJSON(message.registry)
        : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<QueryEntriesResponse>, I>>(
    object: I,
  ): QueryEntriesResponse {
    const message = createBaseQueryEntriesResponse();
    message.registry =
      object.registry !== undefined && object.registry !== null
        ? Registry.fromPartial(object.registry)
        : undefined;
    return message;
  },
};

function createBaseQueryEntriesRequest(): QueryEntriesRequest {
  return {};
}

export const QueryEntriesRequest = {
  encode(
    _: QueryEntriesRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QueryEntriesRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryEntriesRequest();
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

  fromJSON(_: any): QueryEntriesRequest {
    return {};
  },

  toJSON(_: QueryEntriesRequest): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<QueryEntriesRequest>, I>>(
    _: I,
  ): QueryEntriesRequest {
    const message = createBaseQueryEntriesRequest();
    return message;
  },
};

/** Query defines the gRPC querier service. */
export interface Query {
  Entries(request: QueryEntriesRequest): Promise<QueryEntriesResponse>;
}

export class QueryClientImpl implements Query {
  private readonly rpc: Rpc;
  constructor(rpc: Rpc) {
    this.rpc = rpc;
    this.Entries = this.Entries.bind(this);
  }
  Entries(request: QueryEntriesRequest): Promise<QueryEntriesResponse> {
    const data = QueryEntriesRequest.encode(request).finish();
    const promise = this.rpc.request(
      "sifnode.tokenregistry.v1.Query",
      "Entries",
      data,
    );
    return promise.then((data) =>
      QueryEntriesResponse.decode(new _m0.Reader(data)),
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
