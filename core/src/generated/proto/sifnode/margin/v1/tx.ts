/* eslint-disable */
import { Position, Params, positionFromJSON, positionToJSON } from "./types";
import Long from "long";
import _m0 from "protobufjs/minimal";

export const protobufPackage = "sifnode.margin.v1";

export interface MsgOpen {
  signer: string;
  collateralAsset: string;
  collateralAmount: string;
  borrowAsset: string;
  position: Position;
  leverage: string;
}

export interface MsgOpenResponse {}

export interface MsgClose {
  signer: string;
  id: Long;
}

export interface MsgCloseResponse {}

export interface MsgForceClose {
  signer: string;
  mtpAddress: string;
  id: Long;
}

export interface MsgForceCloseResponse {}

export interface MsgUpdateParams {
  signer: string;
  params?: Params;
}

export interface MsgUpdateParamsResponse {}

export interface MsgUpdatePools {
  signer: string;
  pools: string[];
  closedPools: string[];
}

export interface MsgUpdatePoolsResponse {}

export interface MsgWhitelist {
  signer: string;
  whitelistedAddress: string;
}

export interface MsgWhitelistResponse {}

export interface MsgDewhitelist {
  signer: string;
  whitelistedAddress: string;
}

export interface MsgDewhitelistResponse {}

function createBaseMsgOpen(): MsgOpen {
  return {
    signer: "",
    collateralAsset: "",
    collateralAmount: "",
    borrowAsset: "",
    position: 0,
    leverage: "",
  };
}

export const MsgOpen = {
  encode(
    message: MsgOpen,
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
    if (message.position !== 0) {
      writer.uint32(40).int32(message.position);
    }
    if (message.leverage !== "") {
      writer.uint32(50).string(message.leverage);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgOpen {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgOpen();
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
        case 5:
          message.position = reader.int32() as any;
          break;
        case 6:
          message.leverage = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgOpen {
    return {
      signer: isSet(object.signer) ? String(object.signer) : "",
      collateralAsset: isSet(object.collateralAsset)
        ? String(object.collateralAsset)
        : "",
      collateralAmount: isSet(object.collateralAmount)
        ? String(object.collateralAmount)
        : "",
      borrowAsset: isSet(object.borrowAsset) ? String(object.borrowAsset) : "",
      position: isSet(object.position) ? positionFromJSON(object.position) : 0,
      leverage: isSet(object.leverage) ? String(object.leverage) : "",
    };
  },

  toJSON(message: MsgOpen): unknown {
    const obj: any = {};
    message.signer !== undefined && (obj.signer = message.signer);
    message.collateralAsset !== undefined &&
      (obj.collateralAsset = message.collateralAsset);
    message.collateralAmount !== undefined &&
      (obj.collateralAmount = message.collateralAmount);
    message.borrowAsset !== undefined &&
      (obj.borrowAsset = message.borrowAsset);
    message.position !== undefined &&
      (obj.position = positionToJSON(message.position));
    message.leverage !== undefined && (obj.leverage = message.leverage);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgOpen>, I>>(object: I): MsgOpen {
    const message = createBaseMsgOpen();
    message.signer = object.signer ?? "";
    message.collateralAsset = object.collateralAsset ?? "";
    message.collateralAmount = object.collateralAmount ?? "";
    message.borrowAsset = object.borrowAsset ?? "";
    message.position = object.position ?? 0;
    message.leverage = object.leverage ?? "";
    return message;
  },
};

function createBaseMsgOpenResponse(): MsgOpenResponse {
  return {};
}

export const MsgOpenResponse = {
  encode(
    _: MsgOpenResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgOpenResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgOpenResponse();
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

  fromJSON(_: any): MsgOpenResponse {
    return {};
  },

  toJSON(_: MsgOpenResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgOpenResponse>, I>>(
    _: I,
  ): MsgOpenResponse {
    const message = createBaseMsgOpenResponse();
    return message;
  },
};

function createBaseMsgClose(): MsgClose {
  return { signer: "", id: Long.UZERO };
}

export const MsgClose = {
  encode(
    message: MsgClose,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.signer !== "") {
      writer.uint32(10).string(message.signer);
    }
    if (!message.id.isZero()) {
      writer.uint32(16).uint64(message.id);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgClose {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgClose();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.signer = reader.string();
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

  fromJSON(object: any): MsgClose {
    return {
      signer: isSet(object.signer) ? String(object.signer) : "",
      id: isSet(object.id) ? Long.fromValue(object.id) : Long.UZERO,
    };
  },

  toJSON(message: MsgClose): unknown {
    const obj: any = {};
    message.signer !== undefined && (obj.signer = message.signer);
    message.id !== undefined &&
      (obj.id = (message.id || Long.UZERO).toString());
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgClose>, I>>(object: I): MsgClose {
    const message = createBaseMsgClose();
    message.signer = object.signer ?? "";
    message.id =
      object.id !== undefined && object.id !== null
        ? Long.fromValue(object.id)
        : Long.UZERO;
    return message;
  },
};

function createBaseMsgCloseResponse(): MsgCloseResponse {
  return {};
}

export const MsgCloseResponse = {
  encode(
    _: MsgCloseResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgCloseResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCloseResponse();
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

  fromJSON(_: any): MsgCloseResponse {
    return {};
  },

  toJSON(_: MsgCloseResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgCloseResponse>, I>>(
    _: I,
  ): MsgCloseResponse {
    const message = createBaseMsgCloseResponse();
    return message;
  },
};

function createBaseMsgForceClose(): MsgForceClose {
  return { signer: "", mtpAddress: "", id: Long.UZERO };
}

export const MsgForceClose = {
  encode(
    message: MsgForceClose,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.signer !== "") {
      writer.uint32(10).string(message.signer);
    }
    if (message.mtpAddress !== "") {
      writer.uint32(18).string(message.mtpAddress);
    }
    if (!message.id.isZero()) {
      writer.uint32(24).uint64(message.id);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgForceClose {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgForceClose();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.signer = reader.string();
          break;
        case 2:
          message.mtpAddress = reader.string();
          break;
        case 3:
          message.id = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgForceClose {
    return {
      signer: isSet(object.signer) ? String(object.signer) : "",
      mtpAddress: isSet(object.mtpAddress) ? String(object.mtpAddress) : "",
      id: isSet(object.id) ? Long.fromValue(object.id) : Long.UZERO,
    };
  },

  toJSON(message: MsgForceClose): unknown {
    const obj: any = {};
    message.signer !== undefined && (obj.signer = message.signer);
    message.mtpAddress !== undefined && (obj.mtpAddress = message.mtpAddress);
    message.id !== undefined &&
      (obj.id = (message.id || Long.UZERO).toString());
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgForceClose>, I>>(
    object: I,
  ): MsgForceClose {
    const message = createBaseMsgForceClose();
    message.signer = object.signer ?? "";
    message.mtpAddress = object.mtpAddress ?? "";
    message.id =
      object.id !== undefined && object.id !== null
        ? Long.fromValue(object.id)
        : Long.UZERO;
    return message;
  },
};

function createBaseMsgForceCloseResponse(): MsgForceCloseResponse {
  return {};
}

export const MsgForceCloseResponse = {
  encode(
    _: MsgForceCloseResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): MsgForceCloseResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgForceCloseResponse();
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

  fromJSON(_: any): MsgForceCloseResponse {
    return {};
  },

  toJSON(_: MsgForceCloseResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgForceCloseResponse>, I>>(
    _: I,
  ): MsgForceCloseResponse {
    const message = createBaseMsgForceCloseResponse();
    return message;
  },
};

function createBaseMsgUpdateParams(): MsgUpdateParams {
  return { signer: "", params: undefined };
}

export const MsgUpdateParams = {
  encode(
    message: MsgUpdateParams,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.signer !== "") {
      writer.uint32(10).string(message.signer);
    }
    if (message.params !== undefined) {
      Params.encode(message.params, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgUpdateParams {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdateParams();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.signer = reader.string();
          break;
        case 2:
          message.params = Params.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgUpdateParams {
    return {
      signer: isSet(object.signer) ? String(object.signer) : "",
      params: isSet(object.params) ? Params.fromJSON(object.params) : undefined,
    };
  },

  toJSON(message: MsgUpdateParams): unknown {
    const obj: any = {};
    message.signer !== undefined && (obj.signer = message.signer);
    message.params !== undefined &&
      (obj.params = message.params ? Params.toJSON(message.params) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgUpdateParams>, I>>(
    object: I,
  ): MsgUpdateParams {
    const message = createBaseMsgUpdateParams();
    message.signer = object.signer ?? "";
    message.params =
      object.params !== undefined && object.params !== null
        ? Params.fromPartial(object.params)
        : undefined;
    return message;
  },
};

function createBaseMsgUpdateParamsResponse(): MsgUpdateParamsResponse {
  return {};
}

export const MsgUpdateParamsResponse = {
  encode(
    _: MsgUpdateParamsResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): MsgUpdateParamsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdateParamsResponse();
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

  fromJSON(_: any): MsgUpdateParamsResponse {
    return {};
  },

  toJSON(_: MsgUpdateParamsResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgUpdateParamsResponse>, I>>(
    _: I,
  ): MsgUpdateParamsResponse {
    const message = createBaseMsgUpdateParamsResponse();
    return message;
  },
};

function createBaseMsgUpdatePools(): MsgUpdatePools {
  return { signer: "", pools: [], closedPools: [] };
}

export const MsgUpdatePools = {
  encode(
    message: MsgUpdatePools,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.signer !== "") {
      writer.uint32(10).string(message.signer);
    }
    for (const v of message.pools) {
      writer.uint32(18).string(v!);
    }
    for (const v of message.closedPools) {
      writer.uint32(26).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgUpdatePools {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdatePools();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.signer = reader.string();
          break;
        case 2:
          message.pools.push(reader.string());
          break;
        case 3:
          message.closedPools.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgUpdatePools {
    return {
      signer: isSet(object.signer) ? String(object.signer) : "",
      pools: Array.isArray(object?.pools)
        ? object.pools.map((e: any) => String(e))
        : [],
      closedPools: Array.isArray(object?.closedPools)
        ? object.closedPools.map((e: any) => String(e))
        : [],
    };
  },

  toJSON(message: MsgUpdatePools): unknown {
    const obj: any = {};
    message.signer !== undefined && (obj.signer = message.signer);
    if (message.pools) {
      obj.pools = message.pools.map((e) => e);
    } else {
      obj.pools = [];
    }
    if (message.closedPools) {
      obj.closedPools = message.closedPools.map((e) => e);
    } else {
      obj.closedPools = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgUpdatePools>, I>>(
    object: I,
  ): MsgUpdatePools {
    const message = createBaseMsgUpdatePools();
    message.signer = object.signer ?? "";
    message.pools = object.pools?.map((e) => e) || [];
    message.closedPools = object.closedPools?.map((e) => e) || [];
    return message;
  },
};

function createBaseMsgUpdatePoolsResponse(): MsgUpdatePoolsResponse {
  return {};
}

export const MsgUpdatePoolsResponse = {
  encode(
    _: MsgUpdatePoolsResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): MsgUpdatePoolsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdatePoolsResponse();
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

  fromJSON(_: any): MsgUpdatePoolsResponse {
    return {};
  },

  toJSON(_: MsgUpdatePoolsResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgUpdatePoolsResponse>, I>>(
    _: I,
  ): MsgUpdatePoolsResponse {
    const message = createBaseMsgUpdatePoolsResponse();
    return message;
  },
};

function createBaseMsgWhitelist(): MsgWhitelist {
  return { signer: "", whitelistedAddress: "" };
}

export const MsgWhitelist = {
  encode(
    message: MsgWhitelist,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.signer !== "") {
      writer.uint32(10).string(message.signer);
    }
    if (message.whitelistedAddress !== "") {
      writer.uint32(18).string(message.whitelistedAddress);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgWhitelist {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgWhitelist();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.signer = reader.string();
          break;
        case 2:
          message.whitelistedAddress = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgWhitelist {
    return {
      signer: isSet(object.signer) ? String(object.signer) : "",
      whitelistedAddress: isSet(object.whitelistedAddress)
        ? String(object.whitelistedAddress)
        : "",
    };
  },

  toJSON(message: MsgWhitelist): unknown {
    const obj: any = {};
    message.signer !== undefined && (obj.signer = message.signer);
    message.whitelistedAddress !== undefined &&
      (obj.whitelistedAddress = message.whitelistedAddress);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgWhitelist>, I>>(
    object: I,
  ): MsgWhitelist {
    const message = createBaseMsgWhitelist();
    message.signer = object.signer ?? "";
    message.whitelistedAddress = object.whitelistedAddress ?? "";
    return message;
  },
};

function createBaseMsgWhitelistResponse(): MsgWhitelistResponse {
  return {};
}

export const MsgWhitelistResponse = {
  encode(
    _: MsgWhitelistResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): MsgWhitelistResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgWhitelistResponse();
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

  fromJSON(_: any): MsgWhitelistResponse {
    return {};
  },

  toJSON(_: MsgWhitelistResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgWhitelistResponse>, I>>(
    _: I,
  ): MsgWhitelistResponse {
    const message = createBaseMsgWhitelistResponse();
    return message;
  },
};

function createBaseMsgDewhitelist(): MsgDewhitelist {
  return { signer: "", whitelistedAddress: "" };
}

export const MsgDewhitelist = {
  encode(
    message: MsgDewhitelist,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.signer !== "") {
      writer.uint32(10).string(message.signer);
    }
    if (message.whitelistedAddress !== "") {
      writer.uint32(18).string(message.whitelistedAddress);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgDewhitelist {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgDewhitelist();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.signer = reader.string();
          break;
        case 2:
          message.whitelistedAddress = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgDewhitelist {
    return {
      signer: isSet(object.signer) ? String(object.signer) : "",
      whitelistedAddress: isSet(object.whitelistedAddress)
        ? String(object.whitelistedAddress)
        : "",
    };
  },

  toJSON(message: MsgDewhitelist): unknown {
    const obj: any = {};
    message.signer !== undefined && (obj.signer = message.signer);
    message.whitelistedAddress !== undefined &&
      (obj.whitelistedAddress = message.whitelistedAddress);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgDewhitelist>, I>>(
    object: I,
  ): MsgDewhitelist {
    const message = createBaseMsgDewhitelist();
    message.signer = object.signer ?? "";
    message.whitelistedAddress = object.whitelistedAddress ?? "";
    return message;
  },
};

function createBaseMsgDewhitelistResponse(): MsgDewhitelistResponse {
  return {};
}

export const MsgDewhitelistResponse = {
  encode(
    _: MsgDewhitelistResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): MsgDewhitelistResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgDewhitelistResponse();
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

  fromJSON(_: any): MsgDewhitelistResponse {
    return {};
  },

  toJSON(_: MsgDewhitelistResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgDewhitelistResponse>, I>>(
    _: I,
  ): MsgDewhitelistResponse {
    const message = createBaseMsgDewhitelistResponse();
    return message;
  },
};

export interface Msg {
  Open(request: MsgOpen): Promise<MsgOpenResponse>;
  Close(request: MsgClose): Promise<MsgCloseResponse>;
  ForceClose(request: MsgForceClose): Promise<MsgForceCloseResponse>;
  UpdateParams(request: MsgUpdateParams): Promise<MsgUpdateParamsResponse>;
  UpdatePools(request: MsgUpdatePools): Promise<MsgUpdatePoolsResponse>;
  Whitelist(request: MsgWhitelist): Promise<MsgWhitelistResponse>;
  Dewhitelist(request: MsgDewhitelist): Promise<MsgDewhitelistResponse>;
}

export class MsgClientImpl implements Msg {
  private readonly rpc: Rpc;
  constructor(rpc: Rpc) {
    this.rpc = rpc;
    this.Open = this.Open.bind(this);
    this.Close = this.Close.bind(this);
    this.ForceClose = this.ForceClose.bind(this);
    this.UpdateParams = this.UpdateParams.bind(this);
    this.UpdatePools = this.UpdatePools.bind(this);
    this.Whitelist = this.Whitelist.bind(this);
    this.Dewhitelist = this.Dewhitelist.bind(this);
  }
  Open(request: MsgOpen): Promise<MsgOpenResponse> {
    const data = MsgOpen.encode(request).finish();
    const promise = this.rpc.request("sifnode.margin.v1.Msg", "Open", data);
    return promise.then((data) => MsgOpenResponse.decode(new _m0.Reader(data)));
  }

  Close(request: MsgClose): Promise<MsgCloseResponse> {
    const data = MsgClose.encode(request).finish();
    const promise = this.rpc.request("sifnode.margin.v1.Msg", "Close", data);
    return promise.then((data) =>
      MsgCloseResponse.decode(new _m0.Reader(data)),
    );
  }

  ForceClose(request: MsgForceClose): Promise<MsgForceCloseResponse> {
    const data = MsgForceClose.encode(request).finish();
    const promise = this.rpc.request(
      "sifnode.margin.v1.Msg",
      "ForceClose",
      data,
    );
    return promise.then((data) =>
      MsgForceCloseResponse.decode(new _m0.Reader(data)),
    );
  }

  UpdateParams(request: MsgUpdateParams): Promise<MsgUpdateParamsResponse> {
    const data = MsgUpdateParams.encode(request).finish();
    const promise = this.rpc.request(
      "sifnode.margin.v1.Msg",
      "UpdateParams",
      data,
    );
    return promise.then((data) =>
      MsgUpdateParamsResponse.decode(new _m0.Reader(data)),
    );
  }

  UpdatePools(request: MsgUpdatePools): Promise<MsgUpdatePoolsResponse> {
    const data = MsgUpdatePools.encode(request).finish();
    const promise = this.rpc.request(
      "sifnode.margin.v1.Msg",
      "UpdatePools",
      data,
    );
    return promise.then((data) =>
      MsgUpdatePoolsResponse.decode(new _m0.Reader(data)),
    );
  }

  Whitelist(request: MsgWhitelist): Promise<MsgWhitelistResponse> {
    const data = MsgWhitelist.encode(request).finish();
    const promise = this.rpc.request(
      "sifnode.margin.v1.Msg",
      "Whitelist",
      data,
    );
    return promise.then((data) =>
      MsgWhitelistResponse.decode(new _m0.Reader(data)),
    );
  }

  Dewhitelist(request: MsgDewhitelist): Promise<MsgDewhitelistResponse> {
    const data = MsgDewhitelist.encode(request).finish();
    const promise = this.rpc.request(
      "sifnode.margin.v1.Msg",
      "Dewhitelist",
      data,
    );
    return promise.then((data) =>
      MsgDewhitelistResponse.decode(new _m0.Reader(data)),
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
