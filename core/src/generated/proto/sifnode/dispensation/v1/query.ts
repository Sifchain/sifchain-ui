/* eslint-disable */
import {
  DistributionStatus,
  DistributionRecords,
  DistributionType,
  Distribution,
  UserClaim,
  distributionStatusFromJSON,
  distributionStatusToJSON,
  distributionTypeFromJSON,
  distributionTypeToJSON,
} from "./types";
import Long from "long";
import _m0 from "protobufjs/minimal";

export const protobufPackage = "sifnode.dispensation.v1";

export interface QueryAllDistributionsRequest {}

export interface QueryAllDistributionsResponse {
  distributions: Distribution[];
  height: Long;
}

export interface QueryRecordsByDistributionNameRequest {
  distributionName: string;
  status: DistributionStatus;
}

export interface QueryRecordsByDistributionNameResponse {
  distributionRecords?: DistributionRecords;
  height: Long;
}

export interface QueryRecordsByRecipientAddrRequest {
  address: string;
}

export interface QueryRecordsByRecipientAddrResponse {
  distributionRecords?: DistributionRecords;
  height: Long;
}

export interface QueryClaimsByTypeRequest {
  userClaimType: DistributionType;
}

export interface QueryClaimsResponse {
  claims: UserClaim[];
  height: Long;
}

function createBaseQueryAllDistributionsRequest(): QueryAllDistributionsRequest {
  return {};
}

export const QueryAllDistributionsRequest = {
  encode(
    _: QueryAllDistributionsRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): QueryAllDistributionsRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryAllDistributionsRequest();
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

  fromJSON(_: any): QueryAllDistributionsRequest {
    return {};
  },

  toJSON(_: QueryAllDistributionsRequest): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<QueryAllDistributionsRequest>, I>>(
    _: I,
  ): QueryAllDistributionsRequest {
    const message = createBaseQueryAllDistributionsRequest();
    return message;
  },
};

function createBaseQueryAllDistributionsResponse(): QueryAllDistributionsResponse {
  return { distributions: [], height: Long.ZERO };
}

export const QueryAllDistributionsResponse = {
  encode(
    message: QueryAllDistributionsResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    for (const v of message.distributions) {
      Distribution.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (!message.height.isZero()) {
      writer.uint32(16).int64(message.height);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): QueryAllDistributionsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryAllDistributionsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.distributions.push(
            Distribution.decode(reader, reader.uint32()),
          );
          break;
        case 2:
          message.height = reader.int64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryAllDistributionsResponse {
    return {
      distributions: Array.isArray(object?.distributions)
        ? object.distributions.map((e: any) => Distribution.fromJSON(e))
        : [],
      height: isSet(object.height) ? Long.fromValue(object.height) : Long.ZERO,
    };
  },

  toJSON(message: QueryAllDistributionsResponse): unknown {
    const obj: any = {};
    if (message.distributions) {
      obj.distributions = message.distributions.map((e) =>
        e ? Distribution.toJSON(e) : undefined,
      );
    } else {
      obj.distributions = [];
    }
    message.height !== undefined &&
      (obj.height = (message.height || Long.ZERO).toString());
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<QueryAllDistributionsResponse>, I>>(
    object: I,
  ): QueryAllDistributionsResponse {
    const message = createBaseQueryAllDistributionsResponse();
    message.distributions =
      object.distributions?.map((e) => Distribution.fromPartial(e)) || [];
    message.height =
      object.height !== undefined && object.height !== null
        ? Long.fromValue(object.height)
        : Long.ZERO;
    return message;
  },
};

function createBaseQueryRecordsByDistributionNameRequest(): QueryRecordsByDistributionNameRequest {
  return { distributionName: "", status: 0 };
}

export const QueryRecordsByDistributionNameRequest = {
  encode(
    message: QueryRecordsByDistributionNameRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.distributionName !== "") {
      writer.uint32(10).string(message.distributionName);
    }
    if (message.status !== 0) {
      writer.uint32(16).int32(message.status);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): QueryRecordsByDistributionNameRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryRecordsByDistributionNameRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.distributionName = reader.string();
          break;
        case 2:
          message.status = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryRecordsByDistributionNameRequest {
    return {
      distributionName: isSet(object.distributionName)
        ? String(object.distributionName)
        : "",
      status: isSet(object.status)
        ? distributionStatusFromJSON(object.status)
        : 0,
    };
  },

  toJSON(message: QueryRecordsByDistributionNameRequest): unknown {
    const obj: any = {};
    message.distributionName !== undefined &&
      (obj.distributionName = message.distributionName);
    message.status !== undefined &&
      (obj.status = distributionStatusToJSON(message.status));
    return obj;
  },

  fromPartial<
    I extends Exact<DeepPartial<QueryRecordsByDistributionNameRequest>, I>,
  >(object: I): QueryRecordsByDistributionNameRequest {
    const message = createBaseQueryRecordsByDistributionNameRequest();
    message.distributionName = object.distributionName ?? "";
    message.status = object.status ?? 0;
    return message;
  },
};

function createBaseQueryRecordsByDistributionNameResponse(): QueryRecordsByDistributionNameResponse {
  return { distributionRecords: undefined, height: Long.ZERO };
}

export const QueryRecordsByDistributionNameResponse = {
  encode(
    message: QueryRecordsByDistributionNameResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.distributionRecords !== undefined) {
      DistributionRecords.encode(
        message.distributionRecords,
        writer.uint32(10).fork(),
      ).ldelim();
    }
    if (!message.height.isZero()) {
      writer.uint32(16).int64(message.height);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): QueryRecordsByDistributionNameResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryRecordsByDistributionNameResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.distributionRecords = DistributionRecords.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 2:
          message.height = reader.int64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryRecordsByDistributionNameResponse {
    return {
      distributionRecords: isSet(object.distributionRecords)
        ? DistributionRecords.fromJSON(object.distributionRecords)
        : undefined,
      height: isSet(object.height) ? Long.fromValue(object.height) : Long.ZERO,
    };
  },

  toJSON(message: QueryRecordsByDistributionNameResponse): unknown {
    const obj: any = {};
    message.distributionRecords !== undefined &&
      (obj.distributionRecords = message.distributionRecords
        ? DistributionRecords.toJSON(message.distributionRecords)
        : undefined);
    message.height !== undefined &&
      (obj.height = (message.height || Long.ZERO).toString());
    return obj;
  },

  fromPartial<
    I extends Exact<DeepPartial<QueryRecordsByDistributionNameResponse>, I>,
  >(object: I): QueryRecordsByDistributionNameResponse {
    const message = createBaseQueryRecordsByDistributionNameResponse();
    message.distributionRecords =
      object.distributionRecords !== undefined &&
      object.distributionRecords !== null
        ? DistributionRecords.fromPartial(object.distributionRecords)
        : undefined;
    message.height =
      object.height !== undefined && object.height !== null
        ? Long.fromValue(object.height)
        : Long.ZERO;
    return message;
  },
};

function createBaseQueryRecordsByRecipientAddrRequest(): QueryRecordsByRecipientAddrRequest {
  return { address: "" };
}

export const QueryRecordsByRecipientAddrRequest = {
  encode(
    message: QueryRecordsByRecipientAddrRequest,
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
  ): QueryRecordsByRecipientAddrRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryRecordsByRecipientAddrRequest();
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

  fromJSON(object: any): QueryRecordsByRecipientAddrRequest {
    return {
      address: isSet(object.address) ? String(object.address) : "",
    };
  },

  toJSON(message: QueryRecordsByRecipientAddrRequest): unknown {
    const obj: any = {};
    message.address !== undefined && (obj.address = message.address);
    return obj;
  },

  fromPartial<
    I extends Exact<DeepPartial<QueryRecordsByRecipientAddrRequest>, I>,
  >(object: I): QueryRecordsByRecipientAddrRequest {
    const message = createBaseQueryRecordsByRecipientAddrRequest();
    message.address = object.address ?? "";
    return message;
  },
};

function createBaseQueryRecordsByRecipientAddrResponse(): QueryRecordsByRecipientAddrResponse {
  return { distributionRecords: undefined, height: Long.ZERO };
}

export const QueryRecordsByRecipientAddrResponse = {
  encode(
    message: QueryRecordsByRecipientAddrResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.distributionRecords !== undefined) {
      DistributionRecords.encode(
        message.distributionRecords,
        writer.uint32(10).fork(),
      ).ldelim();
    }
    if (!message.height.isZero()) {
      writer.uint32(16).int64(message.height);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): QueryRecordsByRecipientAddrResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryRecordsByRecipientAddrResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.distributionRecords = DistributionRecords.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 2:
          message.height = reader.int64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryRecordsByRecipientAddrResponse {
    return {
      distributionRecords: isSet(object.distributionRecords)
        ? DistributionRecords.fromJSON(object.distributionRecords)
        : undefined,
      height: isSet(object.height) ? Long.fromValue(object.height) : Long.ZERO,
    };
  },

  toJSON(message: QueryRecordsByRecipientAddrResponse): unknown {
    const obj: any = {};
    message.distributionRecords !== undefined &&
      (obj.distributionRecords = message.distributionRecords
        ? DistributionRecords.toJSON(message.distributionRecords)
        : undefined);
    message.height !== undefined &&
      (obj.height = (message.height || Long.ZERO).toString());
    return obj;
  },

  fromPartial<
    I extends Exact<DeepPartial<QueryRecordsByRecipientAddrResponse>, I>,
  >(object: I): QueryRecordsByRecipientAddrResponse {
    const message = createBaseQueryRecordsByRecipientAddrResponse();
    message.distributionRecords =
      object.distributionRecords !== undefined &&
      object.distributionRecords !== null
        ? DistributionRecords.fromPartial(object.distributionRecords)
        : undefined;
    message.height =
      object.height !== undefined && object.height !== null
        ? Long.fromValue(object.height)
        : Long.ZERO;
    return message;
  },
};

function createBaseQueryClaimsByTypeRequest(): QueryClaimsByTypeRequest {
  return { userClaimType: 0 };
}

export const QueryClaimsByTypeRequest = {
  encode(
    message: QueryClaimsByTypeRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.userClaimType !== 0) {
      writer.uint32(8).int32(message.userClaimType);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): QueryClaimsByTypeRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryClaimsByTypeRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.userClaimType = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryClaimsByTypeRequest {
    return {
      userClaimType: isSet(object.userClaimType)
        ? distributionTypeFromJSON(object.userClaimType)
        : 0,
    };
  },

  toJSON(message: QueryClaimsByTypeRequest): unknown {
    const obj: any = {};
    message.userClaimType !== undefined &&
      (obj.userClaimType = distributionTypeToJSON(message.userClaimType));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<QueryClaimsByTypeRequest>, I>>(
    object: I,
  ): QueryClaimsByTypeRequest {
    const message = createBaseQueryClaimsByTypeRequest();
    message.userClaimType = object.userClaimType ?? 0;
    return message;
  },
};

function createBaseQueryClaimsResponse(): QueryClaimsResponse {
  return { claims: [], height: Long.ZERO };
}

export const QueryClaimsResponse = {
  encode(
    message: QueryClaimsResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    for (const v of message.claims) {
      UserClaim.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (!message.height.isZero()) {
      writer.uint32(16).int64(message.height);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QueryClaimsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryClaimsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.claims.push(UserClaim.decode(reader, reader.uint32()));
          break;
        case 2:
          message.height = reader.int64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryClaimsResponse {
    return {
      claims: Array.isArray(object?.claims)
        ? object.claims.map((e: any) => UserClaim.fromJSON(e))
        : [],
      height: isSet(object.height) ? Long.fromValue(object.height) : Long.ZERO,
    };
  },

  toJSON(message: QueryClaimsResponse): unknown {
    const obj: any = {};
    if (message.claims) {
      obj.claims = message.claims.map((e) =>
        e ? UserClaim.toJSON(e) : undefined,
      );
    } else {
      obj.claims = [];
    }
    message.height !== undefined &&
      (obj.height = (message.height || Long.ZERO).toString());
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<QueryClaimsResponse>, I>>(
    object: I,
  ): QueryClaimsResponse {
    const message = createBaseQueryClaimsResponse();
    message.claims = object.claims?.map((e) => UserClaim.fromPartial(e)) || [];
    message.height =
      object.height !== undefined && object.height !== null
        ? Long.fromValue(object.height)
        : Long.ZERO;
    return message;
  },
};

export interface Query {
  AllDistributions(
    request: QueryAllDistributionsRequest,
  ): Promise<QueryAllDistributionsResponse>;
  RecordsByDistributionName(
    request: QueryRecordsByDistributionNameRequest,
  ): Promise<QueryRecordsByDistributionNameResponse>;
  RecordsByRecipient(
    request: QueryRecordsByRecipientAddrRequest,
  ): Promise<QueryRecordsByRecipientAddrResponse>;
  ClaimsByType(request: QueryClaimsByTypeRequest): Promise<QueryClaimsResponse>;
}

export class QueryClientImpl implements Query {
  private readonly rpc: Rpc;
  constructor(rpc: Rpc) {
    this.rpc = rpc;
    this.AllDistributions = this.AllDistributions.bind(this);
    this.RecordsByDistributionName = this.RecordsByDistributionName.bind(this);
    this.RecordsByRecipient = this.RecordsByRecipient.bind(this);
    this.ClaimsByType = this.ClaimsByType.bind(this);
  }
  AllDistributions(
    request: QueryAllDistributionsRequest,
  ): Promise<QueryAllDistributionsResponse> {
    const data = QueryAllDistributionsRequest.encode(request).finish();
    const promise = this.rpc.request(
      "sifnode.dispensation.v1.Query",
      "AllDistributions",
      data,
    );
    return promise.then((data) =>
      QueryAllDistributionsResponse.decode(new _m0.Reader(data)),
    );
  }

  RecordsByDistributionName(
    request: QueryRecordsByDistributionNameRequest,
  ): Promise<QueryRecordsByDistributionNameResponse> {
    const data = QueryRecordsByDistributionNameRequest.encode(request).finish();
    const promise = this.rpc.request(
      "sifnode.dispensation.v1.Query",
      "RecordsByDistributionName",
      data,
    );
    return promise.then((data) =>
      QueryRecordsByDistributionNameResponse.decode(new _m0.Reader(data)),
    );
  }

  RecordsByRecipient(
    request: QueryRecordsByRecipientAddrRequest,
  ): Promise<QueryRecordsByRecipientAddrResponse> {
    const data = QueryRecordsByRecipientAddrRequest.encode(request).finish();
    const promise = this.rpc.request(
      "sifnode.dispensation.v1.Query",
      "RecordsByRecipient",
      data,
    );
    return promise.then((data) =>
      QueryRecordsByRecipientAddrResponse.decode(new _m0.Reader(data)),
    );
  }

  ClaimsByType(
    request: QueryClaimsByTypeRequest,
  ): Promise<QueryClaimsResponse> {
    const data = QueryClaimsByTypeRequest.encode(request).finish();
    const promise = this.rpc.request(
      "sifnode.dispensation.v1.Query",
      "ClaimsByType",
      data,
    );
    return promise.then((data) =>
      QueryClaimsResponse.decode(new _m0.Reader(data)),
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
