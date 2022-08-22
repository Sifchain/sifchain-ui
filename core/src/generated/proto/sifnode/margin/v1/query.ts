/* eslint-disable */
import { MTP, Params } from "./types";
import {
  PageRequest,
  PageResponse,
} from "../../../cosmos/base/query/v1beta1/pagination";
import Long from "long";
import _m0 from "protobufjs/minimal";

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
  pagination?: PageRequest;
}

export interface PositionsForAddressResponse {
  mtps: MTP[];
  pagination?: PageResponse;
}

export interface PositionsByPoolRequest {
  asset: string;
  pagination?: PageRequest;
}

export interface PositionsByPoolResponse {
  mtps: MTP[];
  pagination?: PageResponse;
}

export interface PositionsRequest {
  pagination?: PageRequest;
}

export interface PositionsResponse {
  mtps: MTP[];
  pagination?: PageResponse;
}

export interface ParamsRequest {}

export interface ParamsResponse {
  params?: Params;
}

export interface StatusRequest {}

export interface StatusResponse {
  openMtpCount: Long;
  lifetimeMtpCount: Long;
}

export interface WhitelistRequest {
  pagination?: PageRequest;
}

export interface WhitelistResponse {
  whitelist: string[];
  pagination?: PageResponse;
}

export interface GetSQParamsRequest {
  pool: string;
}

export interface GetSQParamsResponse {
  beginBlock: Long;
}

export interface IsWhitelistedRequest {
  address: string;
}

export interface IsWhitelistedResponse {
  address: string;
  isWhitelisted: boolean;
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
      id: isSet(object.id) ? Long.fromValue(object.id) : Long.UZERO,
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
  return { address: "", pagination: undefined };
}

export const PositionsForAddressRequest = {
  encode(
    message: PositionsForAddressRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.address !== "") {
      writer.uint32(10).string(message.address);
    }
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(18).fork()).ldelim();
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
        case 2:
          message.pagination = PageRequest.decode(reader, reader.uint32());
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
      pagination: isSet(object.pagination)
        ? PageRequest.fromJSON(object.pagination)
        : undefined,
    };
  },

  toJSON(message: PositionsForAddressRequest): unknown {
    const obj: any = {};
    message.address !== undefined && (obj.address = message.address);
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageRequest.toJSON(message.pagination)
        : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<PositionsForAddressRequest>, I>>(
    object: I,
  ): PositionsForAddressRequest {
    const message = createBasePositionsForAddressRequest();
    message.address = object.address ?? "";
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageRequest.fromPartial(object.pagination)
        : undefined;
    return message;
  },
};

function createBasePositionsForAddressResponse(): PositionsForAddressResponse {
  return { mtps: [], pagination: undefined };
}

export const PositionsForAddressResponse = {
  encode(
    message: PositionsForAddressResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    for (const v of message.mtps) {
      MTP.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.pagination !== undefined) {
      PageResponse.encode(
        message.pagination,
        writer.uint32(18).fork(),
      ).ldelim();
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
        case 2:
          message.pagination = PageResponse.decode(reader, reader.uint32());
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
      pagination: isSet(object.pagination)
        ? PageResponse.fromJSON(object.pagination)
        : undefined,
    };
  },

  toJSON(message: PositionsForAddressResponse): unknown {
    const obj: any = {};
    if (message.mtps) {
      obj.mtps = message.mtps.map((e) => (e ? MTP.toJSON(e) : undefined));
    } else {
      obj.mtps = [];
    }
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageResponse.toJSON(message.pagination)
        : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<PositionsForAddressResponse>, I>>(
    object: I,
  ): PositionsForAddressResponse {
    const message = createBasePositionsForAddressResponse();
    message.mtps = object.mtps?.map((e) => MTP.fromPartial(e)) || [];
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageResponse.fromPartial(object.pagination)
        : undefined;
    return message;
  },
};

function createBasePositionsByPoolRequest(): PositionsByPoolRequest {
  return { asset: "", pagination: undefined };
}

export const PositionsByPoolRequest = {
  encode(
    message: PositionsByPoolRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.asset !== "") {
      writer.uint32(10).string(message.asset);
    }
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): PositionsByPoolRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePositionsByPoolRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.asset = reader.string();
          break;
        case 2:
          message.pagination = PageRequest.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): PositionsByPoolRequest {
    return {
      asset: isSet(object.asset) ? String(object.asset) : "",
      pagination: isSet(object.pagination)
        ? PageRequest.fromJSON(object.pagination)
        : undefined,
    };
  },

  toJSON(message: PositionsByPoolRequest): unknown {
    const obj: any = {};
    message.asset !== undefined && (obj.asset = message.asset);
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageRequest.toJSON(message.pagination)
        : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<PositionsByPoolRequest>, I>>(
    object: I,
  ): PositionsByPoolRequest {
    const message = createBasePositionsByPoolRequest();
    message.asset = object.asset ?? "";
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageRequest.fromPartial(object.pagination)
        : undefined;
    return message;
  },
};

function createBasePositionsByPoolResponse(): PositionsByPoolResponse {
  return { mtps: [], pagination: undefined };
}

export const PositionsByPoolResponse = {
  encode(
    message: PositionsByPoolResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    for (const v of message.mtps) {
      MTP.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.pagination !== undefined) {
      PageResponse.encode(
        message.pagination,
        writer.uint32(18).fork(),
      ).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): PositionsByPoolResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePositionsByPoolResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.mtps.push(MTP.decode(reader, reader.uint32()));
          break;
        case 2:
          message.pagination = PageResponse.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): PositionsByPoolResponse {
    return {
      mtps: Array.isArray(object?.mtps)
        ? object.mtps.map((e: any) => MTP.fromJSON(e))
        : [],
      pagination: isSet(object.pagination)
        ? PageResponse.fromJSON(object.pagination)
        : undefined,
    };
  },

  toJSON(message: PositionsByPoolResponse): unknown {
    const obj: any = {};
    if (message.mtps) {
      obj.mtps = message.mtps.map((e) => (e ? MTP.toJSON(e) : undefined));
    } else {
      obj.mtps = [];
    }
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageResponse.toJSON(message.pagination)
        : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<PositionsByPoolResponse>, I>>(
    object: I,
  ): PositionsByPoolResponse {
    const message = createBasePositionsByPoolResponse();
    message.mtps = object.mtps?.map((e) => MTP.fromPartial(e)) || [];
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageResponse.fromPartial(object.pagination)
        : undefined;
    return message;
  },
};

function createBasePositionsRequest(): PositionsRequest {
  return { pagination: undefined };
}

export const PositionsRequest = {
  encode(
    message: PositionsRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PositionsRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePositionsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.pagination = PageRequest.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): PositionsRequest {
    return {
      pagination: isSet(object.pagination)
        ? PageRequest.fromJSON(object.pagination)
        : undefined,
    };
  },

  toJSON(message: PositionsRequest): unknown {
    const obj: any = {};
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageRequest.toJSON(message.pagination)
        : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<PositionsRequest>, I>>(
    object: I,
  ): PositionsRequest {
    const message = createBasePositionsRequest();
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageRequest.fromPartial(object.pagination)
        : undefined;
    return message;
  },
};

function createBasePositionsResponse(): PositionsResponse {
  return { mtps: [], pagination: undefined };
}

export const PositionsResponse = {
  encode(
    message: PositionsResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    for (const v of message.mtps) {
      MTP.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.pagination !== undefined) {
      PageResponse.encode(
        message.pagination,
        writer.uint32(18).fork(),
      ).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PositionsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePositionsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.mtps.push(MTP.decode(reader, reader.uint32()));
          break;
        case 2:
          message.pagination = PageResponse.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): PositionsResponse {
    return {
      mtps: Array.isArray(object?.mtps)
        ? object.mtps.map((e: any) => MTP.fromJSON(e))
        : [],
      pagination: isSet(object.pagination)
        ? PageResponse.fromJSON(object.pagination)
        : undefined,
    };
  },

  toJSON(message: PositionsResponse): unknown {
    const obj: any = {};
    if (message.mtps) {
      obj.mtps = message.mtps.map((e) => (e ? MTP.toJSON(e) : undefined));
    } else {
      obj.mtps = [];
    }
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageResponse.toJSON(message.pagination)
        : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<PositionsResponse>, I>>(
    object: I,
  ): PositionsResponse {
    const message = createBasePositionsResponse();
    message.mtps = object.mtps?.map((e) => MTP.fromPartial(e)) || [];
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageResponse.fromPartial(object.pagination)
        : undefined;
    return message;
  },
};

function createBaseParamsRequest(): ParamsRequest {
  return {};
}

export const ParamsRequest = {
  encode(
    _: ParamsRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ParamsRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseParamsRequest();
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

  fromJSON(_: any): ParamsRequest {
    return {};
  },

  toJSON(_: ParamsRequest): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<ParamsRequest>, I>>(
    _: I,
  ): ParamsRequest {
    const message = createBaseParamsRequest();
    return message;
  },
};

function createBaseParamsResponse(): ParamsResponse {
  return { params: undefined };
}

export const ParamsResponse = {
  encode(
    message: ParamsResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.params !== undefined) {
      Params.encode(message.params, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ParamsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseParamsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.params = Params.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ParamsResponse {
    return {
      params: isSet(object.params) ? Params.fromJSON(object.params) : undefined,
    };
  },

  toJSON(message: ParamsResponse): unknown {
    const obj: any = {};
    message.params !== undefined &&
      (obj.params = message.params ? Params.toJSON(message.params) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<ParamsResponse>, I>>(
    object: I,
  ): ParamsResponse {
    const message = createBaseParamsResponse();
    message.params =
      object.params !== undefined && object.params !== null
        ? Params.fromPartial(object.params)
        : undefined;
    return message;
  },
};

function createBaseStatusRequest(): StatusRequest {
  return {};
}

export const StatusRequest = {
  encode(
    _: StatusRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): StatusRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStatusRequest();
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

  fromJSON(_: any): StatusRequest {
    return {};
  },

  toJSON(_: StatusRequest): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<StatusRequest>, I>>(
    _: I,
  ): StatusRequest {
    const message = createBaseStatusRequest();
    return message;
  },
};

function createBaseStatusResponse(): StatusResponse {
  return { openMtpCount: Long.UZERO, lifetimeMtpCount: Long.UZERO };
}

export const StatusResponse = {
  encode(
    message: StatusResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (!message.openMtpCount.isZero()) {
      writer.uint32(8).uint64(message.openMtpCount);
    }
    if (!message.lifetimeMtpCount.isZero()) {
      writer.uint32(16).uint64(message.lifetimeMtpCount);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): StatusResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStatusResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.openMtpCount = reader.uint64() as Long;
          break;
        case 2:
          message.lifetimeMtpCount = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): StatusResponse {
    return {
      openMtpCount: isSet(object.openMtpCount)
        ? Long.fromValue(object.openMtpCount)
        : Long.UZERO,
      lifetimeMtpCount: isSet(object.lifetimeMtpCount)
        ? Long.fromValue(object.lifetimeMtpCount)
        : Long.UZERO,
    };
  },

  toJSON(message: StatusResponse): unknown {
    const obj: any = {};
    message.openMtpCount !== undefined &&
      (obj.openMtpCount = (message.openMtpCount || Long.UZERO).toString());
    message.lifetimeMtpCount !== undefined &&
      (obj.lifetimeMtpCount = (
        message.lifetimeMtpCount || Long.UZERO
      ).toString());
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<StatusResponse>, I>>(
    object: I,
  ): StatusResponse {
    const message = createBaseStatusResponse();
    message.openMtpCount =
      object.openMtpCount !== undefined && object.openMtpCount !== null
        ? Long.fromValue(object.openMtpCount)
        : Long.UZERO;
    message.lifetimeMtpCount =
      object.lifetimeMtpCount !== undefined && object.lifetimeMtpCount !== null
        ? Long.fromValue(object.lifetimeMtpCount)
        : Long.UZERO;
    return message;
  },
};

function createBaseWhitelistRequest(): WhitelistRequest {
  return { pagination: undefined };
}

export const WhitelistRequest = {
  encode(
    message: WhitelistRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): WhitelistRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseWhitelistRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.pagination = PageRequest.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): WhitelistRequest {
    return {
      pagination: isSet(object.pagination)
        ? PageRequest.fromJSON(object.pagination)
        : undefined,
    };
  },

  toJSON(message: WhitelistRequest): unknown {
    const obj: any = {};
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageRequest.toJSON(message.pagination)
        : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<WhitelistRequest>, I>>(
    object: I,
  ): WhitelistRequest {
    const message = createBaseWhitelistRequest();
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageRequest.fromPartial(object.pagination)
        : undefined;
    return message;
  },
};

function createBaseWhitelistResponse(): WhitelistResponse {
  return { whitelist: [], pagination: undefined };
}

export const WhitelistResponse = {
  encode(
    message: WhitelistResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    for (const v of message.whitelist) {
      writer.uint32(10).string(v!);
    }
    if (message.pagination !== undefined) {
      PageResponse.encode(
        message.pagination,
        writer.uint32(18).fork(),
      ).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): WhitelistResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseWhitelistResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.whitelist.push(reader.string());
          break;
        case 2:
          message.pagination = PageResponse.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): WhitelistResponse {
    return {
      whitelist: Array.isArray(object?.whitelist)
        ? object.whitelist.map((e: any) => String(e))
        : [],
      pagination: isSet(object.pagination)
        ? PageResponse.fromJSON(object.pagination)
        : undefined,
    };
  },

  toJSON(message: WhitelistResponse): unknown {
    const obj: any = {};
    if (message.whitelist) {
      obj.whitelist = message.whitelist.map((e) => e);
    } else {
      obj.whitelist = [];
    }
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageResponse.toJSON(message.pagination)
        : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<WhitelistResponse>, I>>(
    object: I,
  ): WhitelistResponse {
    const message = createBaseWhitelistResponse();
    message.whitelist = object.whitelist?.map((e) => e) || [];
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageResponse.fromPartial(object.pagination)
        : undefined;
    return message;
  },
};

function createBaseGetSQParamsRequest(): GetSQParamsRequest {
  return { pool: "" };
}

export const GetSQParamsRequest = {
  encode(
    message: GetSQParamsRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.pool !== "") {
      writer.uint32(10).string(message.pool);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetSQParamsRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetSQParamsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.pool = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): GetSQParamsRequest {
    return {
      pool: isSet(object.pool) ? String(object.pool) : "",
    };
  },

  toJSON(message: GetSQParamsRequest): unknown {
    const obj: any = {};
    message.pool !== undefined && (obj.pool = message.pool);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<GetSQParamsRequest>, I>>(
    object: I,
  ): GetSQParamsRequest {
    const message = createBaseGetSQParamsRequest();
    message.pool = object.pool ?? "";
    return message;
  },
};

function createBaseGetSQParamsResponse(): GetSQParamsResponse {
  return { beginBlock: Long.ZERO };
}

export const GetSQParamsResponse = {
  encode(
    message: GetSQParamsResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (!message.beginBlock.isZero()) {
      writer.uint32(8).int64(message.beginBlock);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetSQParamsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetSQParamsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.beginBlock = reader.int64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): GetSQParamsResponse {
    return {
      beginBlock: isSet(object.beginBlock)
        ? Long.fromValue(object.beginBlock)
        : Long.ZERO,
    };
  },

  toJSON(message: GetSQParamsResponse): unknown {
    const obj: any = {};
    message.beginBlock !== undefined &&
      (obj.beginBlock = (message.beginBlock || Long.ZERO).toString());
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<GetSQParamsResponse>, I>>(
    object: I,
  ): GetSQParamsResponse {
    const message = createBaseGetSQParamsResponse();
    message.beginBlock =
      object.beginBlock !== undefined && object.beginBlock !== null
        ? Long.fromValue(object.beginBlock)
        : Long.ZERO;
    return message;
  },
};

function createBaseIsWhitelistedRequest(): IsWhitelistedRequest {
  return { address: "" };
}

export const IsWhitelistedRequest = {
  encode(
    message: IsWhitelistedRequest,
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
  ): IsWhitelistedRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseIsWhitelistedRequest();
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

  fromJSON(object: any): IsWhitelistedRequest {
    return {
      address: isSet(object.address) ? String(object.address) : "",
    };
  },

  toJSON(message: IsWhitelistedRequest): unknown {
    const obj: any = {};
    message.address !== undefined && (obj.address = message.address);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<IsWhitelistedRequest>, I>>(
    object: I,
  ): IsWhitelistedRequest {
    const message = createBaseIsWhitelistedRequest();
    message.address = object.address ?? "";
    return message;
  },
};

function createBaseIsWhitelistedResponse(): IsWhitelistedResponse {
  return { address: "", isWhitelisted: false };
}

export const IsWhitelistedResponse = {
  encode(
    message: IsWhitelistedResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.address !== "") {
      writer.uint32(10).string(message.address);
    }
    if (message.isWhitelisted === true) {
      writer.uint32(16).bool(message.isWhitelisted);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): IsWhitelistedResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseIsWhitelistedResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.address = reader.string();
          break;
        case 2:
          message.isWhitelisted = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): IsWhitelistedResponse {
    return {
      address: isSet(object.address) ? String(object.address) : "",
      isWhitelisted: isSet(object.isWhitelisted)
        ? Boolean(object.isWhitelisted)
        : false,
    };
  },

  toJSON(message: IsWhitelistedResponse): unknown {
    const obj: any = {};
    message.address !== undefined && (obj.address = message.address);
    message.isWhitelisted !== undefined &&
      (obj.isWhitelisted = message.isWhitelisted);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<IsWhitelistedResponse>, I>>(
    object: I,
  ): IsWhitelistedResponse {
    const message = createBaseIsWhitelistedResponse();
    message.address = object.address ?? "";
    message.isWhitelisted = object.isWhitelisted ?? false;
    return message;
  },
};

export interface Query {
  GetMTP(request: MTPRequest): Promise<MTPResponse>;
  GetPositions(request: PositionsRequest): Promise<PositionsResponse>;
  GetPositionsForAddress(
    request: PositionsForAddressRequest,
  ): Promise<PositionsForAddressResponse>;
  GetPositionsByPool(
    request: PositionsByPoolRequest,
  ): Promise<PositionsByPoolResponse>;
  GetParams(request: ParamsRequest): Promise<ParamsResponse>;
  GetStatus(request: StatusRequest): Promise<StatusResponse>;
  GetSQParams(request: GetSQParamsRequest): Promise<GetSQParamsResponse>;
  GetWhitelist(request: WhitelistRequest): Promise<WhitelistResponse>;
  IsWhitelisted(request: IsWhitelistedRequest): Promise<IsWhitelistedResponse>;
}

export class QueryClientImpl implements Query {
  private readonly rpc: Rpc;
  constructor(rpc: Rpc) {
    this.rpc = rpc;
    this.GetMTP = this.GetMTP.bind(this);
    this.GetPositions = this.GetPositions.bind(this);
    this.GetPositionsForAddress = this.GetPositionsForAddress.bind(this);
    this.GetPositionsByPool = this.GetPositionsByPool.bind(this);
    this.GetParams = this.GetParams.bind(this);
    this.GetStatus = this.GetStatus.bind(this);
    this.GetSQParams = this.GetSQParams.bind(this);
    this.GetWhitelist = this.GetWhitelist.bind(this);
    this.IsWhitelisted = this.IsWhitelisted.bind(this);
  }
  GetMTP(request: MTPRequest): Promise<MTPResponse> {
    const data = MTPRequest.encode(request).finish();
    const promise = this.rpc.request("sifnode.margin.v1.Query", "GetMTP", data);
    return promise.then((data) => MTPResponse.decode(new _m0.Reader(data)));
  }

  GetPositions(request: PositionsRequest): Promise<PositionsResponse> {
    const data = PositionsRequest.encode(request).finish();
    const promise = this.rpc.request(
      "sifnode.margin.v1.Query",
      "GetPositions",
      data,
    );
    return promise.then((data) =>
      PositionsResponse.decode(new _m0.Reader(data)),
    );
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

  GetPositionsByPool(
    request: PositionsByPoolRequest,
  ): Promise<PositionsByPoolResponse> {
    const data = PositionsByPoolRequest.encode(request).finish();
    const promise = this.rpc.request(
      "sifnode.margin.v1.Query",
      "GetPositionsByPool",
      data,
    );
    return promise.then((data) =>
      PositionsByPoolResponse.decode(new _m0.Reader(data)),
    );
  }

  GetParams(request: ParamsRequest): Promise<ParamsResponse> {
    const data = ParamsRequest.encode(request).finish();
    const promise = this.rpc.request(
      "sifnode.margin.v1.Query",
      "GetParams",
      data,
    );
    return promise.then((data) => ParamsResponse.decode(new _m0.Reader(data)));
  }

  GetStatus(request: StatusRequest): Promise<StatusResponse> {
    const data = StatusRequest.encode(request).finish();
    const promise = this.rpc.request(
      "sifnode.margin.v1.Query",
      "GetStatus",
      data,
    );
    return promise.then((data) => StatusResponse.decode(new _m0.Reader(data)));
  }

  GetSQParams(request: GetSQParamsRequest): Promise<GetSQParamsResponse> {
    const data = GetSQParamsRequest.encode(request).finish();
    const promise = this.rpc.request(
      "sifnode.margin.v1.Query",
      "GetSQParams",
      data,
    );
    return promise.then((data) =>
      GetSQParamsResponse.decode(new _m0.Reader(data)),
    );
  }

  GetWhitelist(request: WhitelistRequest): Promise<WhitelistResponse> {
    const data = WhitelistRequest.encode(request).finish();
    const promise = this.rpc.request(
      "sifnode.margin.v1.Query",
      "GetWhitelist",
      data,
    );
    return promise.then((data) =>
      WhitelistResponse.decode(new _m0.Reader(data)),
    );
  }

  IsWhitelisted(request: IsWhitelistedRequest): Promise<IsWhitelistedResponse> {
    const data = IsWhitelistedRequest.encode(request).finish();
    const promise = this.rpc.request(
      "sifnode.margin.v1.Query",
      "IsWhitelisted",
      data,
    );
    return promise.then((data) =>
      IsWhitelistedResponse.decode(new _m0.Reader(data)),
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
