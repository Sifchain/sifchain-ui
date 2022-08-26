/* eslint-disable */
import Long from "long";
import { AdminAccount } from "./types";
import _m0 from "protobufjs/minimal";

export const protobufPackage = "sifnode.admin.v1";

export interface ListAccountsRequest {}

export interface ListAccountsResponse {
  keys: AdminAccount[];
}

function createBaseListAccountsRequest(): ListAccountsRequest {
  return {};
}

export const ListAccountsRequest = {
  encode(
    _: ListAccountsRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ListAccountsRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseListAccountsRequest();
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

  fromJSON(_: any): ListAccountsRequest {
    return {};
  },

  toJSON(_: ListAccountsRequest): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<ListAccountsRequest>, I>>(
    _: I,
  ): ListAccountsRequest {
    const message = createBaseListAccountsRequest();
    return message;
  },
};

function createBaseListAccountsResponse(): ListAccountsResponse {
  return { keys: [] };
}

export const ListAccountsResponse = {
  encode(
    message: ListAccountsResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    for (const v of message.keys) {
      AdminAccount.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): ListAccountsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseListAccountsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2:
          message.keys.push(AdminAccount.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ListAccountsResponse {
    return {
      keys: Array.isArray(object?.keys)
        ? object.keys.map((e: any) => AdminAccount.fromJSON(e))
        : [],
    };
  },

  toJSON(message: ListAccountsResponse): unknown {
    const obj: any = {};
    if (message.keys) {
      obj.keys = message.keys.map((e) =>
        e ? AdminAccount.toJSON(e) : undefined,
      );
    } else {
      obj.keys = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<ListAccountsResponse>, I>>(
    object: I,
  ): ListAccountsResponse {
    const message = createBaseListAccountsResponse();
    message.keys = object.keys?.map((e) => AdminAccount.fromPartial(e)) || [];
    return message;
  },
};

/** Query defines the gRPC querier service. */
export interface Query {
  ListAccounts(request: ListAccountsRequest): Promise<ListAccountsResponse>;
}

export class QueryClientImpl implements Query {
  private readonly rpc: Rpc;
  constructor(rpc: Rpc) {
    this.rpc = rpc;
    this.ListAccounts = this.ListAccounts.bind(this);
  }
  ListAccounts(request: ListAccountsRequest): Promise<ListAccountsResponse> {
    const data = ListAccountsRequest.encode(request).finish();
    const promise = this.rpc.request(
      "sifnode.admin.v1.Query",
      "ListAccounts",
      data,
    );
    return promise.then((data) =>
      ListAccountsResponse.decode(new _m0.Reader(data)),
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
