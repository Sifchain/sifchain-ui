/* eslint-disable */
import Long from "long";
import * as _m0 from "protobufjs/minimal";
import { Status } from "../../../sifnode/oracle/v1/types";
import { EthBridgeClaim } from "../../../sifnode/ethbridge/v1/types";

export const protobufPackage = "sifnode.ethbridge.v1";

/** QueryEthProphecyRequest payload for EthProphecy rpc query */
export interface QueryEthProphecyRequest {
  ethereumChainId: number;
  /** bridge_contract_address is an EthereumAddress */
  bridgeContractAddress: string;
  nonce: number;
  symbol: string;
  /** token_contract_address is an EthereumAddress */
  tokenContractAddress: string;
  /** ethereum_sender is an EthereumAddress */
  ethereumSender: string;
}

/** QueryEthProphecyResponse payload for EthProphecy rpc query */
export interface QueryEthProphecyResponse {
  id: string;
  status?: Status;
  claims: EthBridgeClaim[];
}

export interface QueryBlacklistRequest {}

export interface QueryBlacklistResponse {
  addresses: string[];
}

function createBaseQueryEthProphecyRequest(): QueryEthProphecyRequest {
  return {
    ethereumChainId: 0,
    bridgeContractAddress: "",
    nonce: 0,
    symbol: "",
    tokenContractAddress: "",
    ethereumSender: "",
  };
}

export const QueryEthProphecyRequest = {
  encode(
    message: QueryEthProphecyRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.ethereumChainId !== 0) {
      writer.uint32(8).int64(message.ethereumChainId);
    }
    if (message.bridgeContractAddress !== "") {
      writer.uint32(18).string(message.bridgeContractAddress);
    }
    if (message.nonce !== 0) {
      writer.uint32(24).int64(message.nonce);
    }
    if (message.symbol !== "") {
      writer.uint32(34).string(message.symbol);
    }
    if (message.tokenContractAddress !== "") {
      writer.uint32(42).string(message.tokenContractAddress);
    }
    if (message.ethereumSender !== "") {
      writer.uint32(50).string(message.ethereumSender);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): QueryEthProphecyRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryEthProphecyRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.ethereumChainId = longToNumber(reader.int64() as Long);
          break;
        case 2:
          message.bridgeContractAddress = reader.string();
          break;
        case 3:
          message.nonce = longToNumber(reader.int64() as Long);
          break;
        case 4:
          message.symbol = reader.string();
          break;
        case 5:
          message.tokenContractAddress = reader.string();
          break;
        case 6:
          message.ethereumSender = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryEthProphecyRequest {
    return {
      ethereumChainId: isSet(object.ethereumChainId)
        ? Number(object.ethereumChainId)
        : 0,
      bridgeContractAddress: isSet(object.bridgeContractAddress)
        ? String(object.bridgeContractAddress)
        : "",
      nonce: isSet(object.nonce) ? Number(object.nonce) : 0,
      symbol: isSet(object.symbol) ? String(object.symbol) : "",
      tokenContractAddress: isSet(object.tokenContractAddress)
        ? String(object.tokenContractAddress)
        : "",
      ethereumSender: isSet(object.ethereumSender)
        ? String(object.ethereumSender)
        : "",
    };
  },

  toJSON(message: QueryEthProphecyRequest): unknown {
    const obj: any = {};
    message.ethereumChainId !== undefined &&
      (obj.ethereumChainId = Math.round(message.ethereumChainId));
    message.bridgeContractAddress !== undefined &&
      (obj.bridgeContractAddress = message.bridgeContractAddress);
    message.nonce !== undefined && (obj.nonce = Math.round(message.nonce));
    message.symbol !== undefined && (obj.symbol = message.symbol);
    message.tokenContractAddress !== undefined &&
      (obj.tokenContractAddress = message.tokenContractAddress);
    message.ethereumSender !== undefined &&
      (obj.ethereumSender = message.ethereumSender);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<QueryEthProphecyRequest>, I>>(
    object: I,
  ): QueryEthProphecyRequest {
    const message = createBaseQueryEthProphecyRequest();
    message.ethereumChainId = object.ethereumChainId ?? 0;
    message.bridgeContractAddress = object.bridgeContractAddress ?? "";
    message.nonce = object.nonce ?? 0;
    message.symbol = object.symbol ?? "";
    message.tokenContractAddress = object.tokenContractAddress ?? "";
    message.ethereumSender = object.ethereumSender ?? "";
    return message;
  },
};

function createBaseQueryEthProphecyResponse(): QueryEthProphecyResponse {
  return { id: "", status: undefined, claims: [] };
}

export const QueryEthProphecyResponse = {
  encode(
    message: QueryEthProphecyResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.status !== undefined) {
      Status.encode(message.status, writer.uint32(18).fork()).ldelim();
    }
    for (const v of message.claims) {
      EthBridgeClaim.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): QueryEthProphecyResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryEthProphecyResponse();
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
          message.claims.push(EthBridgeClaim.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryEthProphecyResponse {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      status: isSet(object.status) ? Status.fromJSON(object.status) : undefined,
      claims: Array.isArray(object?.claims)
        ? object.claims.map((e: any) => EthBridgeClaim.fromJSON(e))
        : [],
    };
  },

  toJSON(message: QueryEthProphecyResponse): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.status !== undefined &&
      (obj.status = message.status ? Status.toJSON(message.status) : undefined);
    if (message.claims) {
      obj.claims = message.claims.map((e) =>
        e ? EthBridgeClaim.toJSON(e) : undefined,
      );
    } else {
      obj.claims = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<QueryEthProphecyResponse>, I>>(
    object: I,
  ): QueryEthProphecyResponse {
    const message = createBaseQueryEthProphecyResponse();
    message.id = object.id ?? "";
    message.status =
      object.status !== undefined && object.status !== null
        ? Status.fromPartial(object.status)
        : undefined;
    message.claims =
      object.claims?.map((e) => EthBridgeClaim.fromPartial(e)) || [];
    return message;
  },
};

function createBaseQueryBlacklistRequest(): QueryBlacklistRequest {
  return {};
}

export const QueryBlacklistRequest = {
  encode(
    _: QueryBlacklistRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): QueryBlacklistRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryBlacklistRequest();
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

  fromJSON(_: any): QueryBlacklistRequest {
    return {};
  },

  toJSON(_: QueryBlacklistRequest): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<QueryBlacklistRequest>, I>>(
    _: I,
  ): QueryBlacklistRequest {
    const message = createBaseQueryBlacklistRequest();
    return message;
  },
};

function createBaseQueryBlacklistResponse(): QueryBlacklistResponse {
  return { addresses: [] };
}

export const QueryBlacklistResponse = {
  encode(
    message: QueryBlacklistResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    for (const v of message.addresses) {
      writer.uint32(10).string(v!);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): QueryBlacklistResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryBlacklistResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.addresses.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryBlacklistResponse {
    return {
      addresses: Array.isArray(object?.addresses)
        ? object.addresses.map((e: any) => String(e))
        : [],
    };
  },

  toJSON(message: QueryBlacklistResponse): unknown {
    const obj: any = {};
    if (message.addresses) {
      obj.addresses = message.addresses.map((e) => e);
    } else {
      obj.addresses = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<QueryBlacklistResponse>, I>>(
    object: I,
  ): QueryBlacklistResponse {
    const message = createBaseQueryBlacklistResponse();
    message.addresses = object.addresses?.map((e) => e) || [];
    return message;
  },
};

/** Query service for queries */
export interface Query {
  /** EthProphecy queries an EthProphecy */
  EthProphecy(
    request: QueryEthProphecyRequest,
  ): Promise<QueryEthProphecyResponse>;
  GetBlacklist(request: QueryBlacklistRequest): Promise<QueryBlacklistResponse>;
}

export class QueryClientImpl implements Query {
  private readonly rpc: Rpc;
  constructor(rpc: Rpc) {
    this.rpc = rpc;
    this.EthProphecy = this.EthProphecy.bind(this);
    this.GetBlacklist = this.GetBlacklist.bind(this);
  }
  EthProphecy(
    request: QueryEthProphecyRequest,
  ): Promise<QueryEthProphecyResponse> {
    const data = QueryEthProphecyRequest.encode(request).finish();
    const promise = this.rpc.request(
      "sifnode.ethbridge.v1.Query",
      "EthProphecy",
      data,
    );
    return promise.then((data) =>
      QueryEthProphecyResponse.decode(new _m0.Reader(data)),
    );
  }

  GetBlacklist(
    request: QueryBlacklistRequest,
  ): Promise<QueryBlacklistResponse> {
    const data = QueryBlacklistRequest.encode(request).finish();
    const promise = this.rpc.request(
      "sifnode.ethbridge.v1.Query",
      "GetBlacklist",
      data,
    );
    return promise.then((data) =>
      QueryBlacklistResponse.decode(new _m0.Reader(data)),
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
