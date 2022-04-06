/* eslint-disable */
import Long from "long";
import * as _m0 from "protobufjs/minimal";
import { Asset } from "../../../sifnode/clp/v1/types";

export const protobufPackage = "sifnode.clp.v1";

export interface MsgRemoveLiquidity {
  signer: string;
  externalAsset?: Asset;
  wBasisPoints: string;
  asymmetry: string;
}

export interface MsgRemoveLiquidityResponse {}

export interface MsgCreatePool {
  signer: string;
  externalAsset?: Asset;
  nativeAssetAmount: string;
  externalAssetAmount: string;
}

export interface MsgCreatePoolResponse {}

export interface MsgAddLiquidity {
  signer: string;
  externalAsset?: Asset;
  nativeAssetAmount: string;
  externalAssetAmount: string;
}

export interface MsgAddLiquidityResponse {}

export interface MsgModifyPmtpRates {
  signer: string;
  blockRate: string;
  runningRate: string;
  endPolicy: boolean;
}

export interface MsgModifyPmtpRatesResponse {}

export interface MsgUpdatePmtpParams {
  signer: string;
  pmtpPeriodGovernanceRate: string;
  startNewPolicy: boolean;
  pmtpPeriodEpochLength: Long;
  pmtpPeriodStartBlock: Long;
  pmtpPeriodEndBlock: Long;
}

export interface MsgUpdatePmtpParamsResponse {}

export interface MsgSwap {
  signer: string;
  sentAsset?: Asset;
  receivedAsset?: Asset;
  sentAmount: string;
  minReceivingAmount: string;
}

export interface MsgSwapResponse {}

export interface MsgDecommissionPool {
  signer: string;
  symbol: string;
}

export interface MsgDecommissionPoolResponse {}

function createBaseMsgRemoveLiquidity(): MsgRemoveLiquidity {
  return {
    signer: "",
    externalAsset: undefined,
    wBasisPoints: "",
    asymmetry: "",
  };
}

export const MsgRemoveLiquidity = {
  encode(
    message: MsgRemoveLiquidity,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.signer !== "") {
      writer.uint32(10).string(message.signer);
    }
    if (message.externalAsset !== undefined) {
      Asset.encode(message.externalAsset, writer.uint32(18).fork()).ldelim();
    }
    if (message.wBasisPoints !== "") {
      writer.uint32(26).string(message.wBasisPoints);
    }
    if (message.asymmetry !== "") {
      writer.uint32(34).string(message.asymmetry);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgRemoveLiquidity {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgRemoveLiquidity();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.signer = reader.string();
          break;
        case 2:
          message.externalAsset = Asset.decode(reader, reader.uint32());
          break;
        case 3:
          message.wBasisPoints = reader.string();
          break;
        case 4:
          message.asymmetry = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgRemoveLiquidity {
    return {
      signer: isSet(object.signer) ? String(object.signer) : "",
      externalAsset: isSet(object.externalAsset)
        ? Asset.fromJSON(object.externalAsset)
        : undefined,
      wBasisPoints: isSet(object.wBasisPoints)
        ? String(object.wBasisPoints)
        : "",
      asymmetry: isSet(object.asymmetry) ? String(object.asymmetry) : "",
    };
  },

  toJSON(message: MsgRemoveLiquidity): unknown {
    const obj: any = {};
    message.signer !== undefined && (obj.signer = message.signer);
    message.externalAsset !== undefined &&
      (obj.externalAsset = message.externalAsset
        ? Asset.toJSON(message.externalAsset)
        : undefined);
    message.wBasisPoints !== undefined &&
      (obj.wBasisPoints = message.wBasisPoints);
    message.asymmetry !== undefined && (obj.asymmetry = message.asymmetry);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgRemoveLiquidity>, I>>(
    object: I,
  ): MsgRemoveLiquidity {
    const message = createBaseMsgRemoveLiquidity();
    message.signer = object.signer ?? "";
    message.externalAsset =
      object.externalAsset !== undefined && object.externalAsset !== null
        ? Asset.fromPartial(object.externalAsset)
        : undefined;
    message.wBasisPoints = object.wBasisPoints ?? "";
    message.asymmetry = object.asymmetry ?? "";
    return message;
  },
};

function createBaseMsgRemoveLiquidityResponse(): MsgRemoveLiquidityResponse {
  return {};
}

export const MsgRemoveLiquidityResponse = {
  encode(
    _: MsgRemoveLiquidityResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): MsgRemoveLiquidityResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgRemoveLiquidityResponse();
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

  fromJSON(_: any): MsgRemoveLiquidityResponse {
    return {};
  },

  toJSON(_: MsgRemoveLiquidityResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgRemoveLiquidityResponse>, I>>(
    _: I,
  ): MsgRemoveLiquidityResponse {
    const message = createBaseMsgRemoveLiquidityResponse();
    return message;
  },
};

function createBaseMsgCreatePool(): MsgCreatePool {
  return {
    signer: "",
    externalAsset: undefined,
    nativeAssetAmount: "",
    externalAssetAmount: "",
  };
}

export const MsgCreatePool = {
  encode(
    message: MsgCreatePool,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.signer !== "") {
      writer.uint32(10).string(message.signer);
    }
    if (message.externalAsset !== undefined) {
      Asset.encode(message.externalAsset, writer.uint32(18).fork()).ldelim();
    }
    if (message.nativeAssetAmount !== "") {
      writer.uint32(26).string(message.nativeAssetAmount);
    }
    if (message.externalAssetAmount !== "") {
      writer.uint32(34).string(message.externalAssetAmount);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgCreatePool {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreatePool();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.signer = reader.string();
          break;
        case 2:
          message.externalAsset = Asset.decode(reader, reader.uint32());
          break;
        case 3:
          message.nativeAssetAmount = reader.string();
          break;
        case 4:
          message.externalAssetAmount = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgCreatePool {
    return {
      signer: isSet(object.signer) ? String(object.signer) : "",
      externalAsset: isSet(object.externalAsset)
        ? Asset.fromJSON(object.externalAsset)
        : undefined,
      nativeAssetAmount: isSet(object.nativeAssetAmount)
        ? String(object.nativeAssetAmount)
        : "",
      externalAssetAmount: isSet(object.externalAssetAmount)
        ? String(object.externalAssetAmount)
        : "",
    };
  },

  toJSON(message: MsgCreatePool): unknown {
    const obj: any = {};
    message.signer !== undefined && (obj.signer = message.signer);
    message.externalAsset !== undefined &&
      (obj.externalAsset = message.externalAsset
        ? Asset.toJSON(message.externalAsset)
        : undefined);
    message.nativeAssetAmount !== undefined &&
      (obj.nativeAssetAmount = message.nativeAssetAmount);
    message.externalAssetAmount !== undefined &&
      (obj.externalAssetAmount = message.externalAssetAmount);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgCreatePool>, I>>(
    object: I,
  ): MsgCreatePool {
    const message = createBaseMsgCreatePool();
    message.signer = object.signer ?? "";
    message.externalAsset =
      object.externalAsset !== undefined && object.externalAsset !== null
        ? Asset.fromPartial(object.externalAsset)
        : undefined;
    message.nativeAssetAmount = object.nativeAssetAmount ?? "";
    message.externalAssetAmount = object.externalAssetAmount ?? "";
    return message;
  },
};

function createBaseMsgCreatePoolResponse(): MsgCreatePoolResponse {
  return {};
}

export const MsgCreatePoolResponse = {
  encode(
    _: MsgCreatePoolResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): MsgCreatePoolResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreatePoolResponse();
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

  fromJSON(_: any): MsgCreatePoolResponse {
    return {};
  },

  toJSON(_: MsgCreatePoolResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgCreatePoolResponse>, I>>(
    _: I,
  ): MsgCreatePoolResponse {
    const message = createBaseMsgCreatePoolResponse();
    return message;
  },
};

function createBaseMsgAddLiquidity(): MsgAddLiquidity {
  return {
    signer: "",
    externalAsset: undefined,
    nativeAssetAmount: "",
    externalAssetAmount: "",
  };
}

export const MsgAddLiquidity = {
  encode(
    message: MsgAddLiquidity,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.signer !== "") {
      writer.uint32(10).string(message.signer);
    }
    if (message.externalAsset !== undefined) {
      Asset.encode(message.externalAsset, writer.uint32(18).fork()).ldelim();
    }
    if (message.nativeAssetAmount !== "") {
      writer.uint32(26).string(message.nativeAssetAmount);
    }
    if (message.externalAssetAmount !== "") {
      writer.uint32(34).string(message.externalAssetAmount);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgAddLiquidity {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgAddLiquidity();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.signer = reader.string();
          break;
        case 2:
          message.externalAsset = Asset.decode(reader, reader.uint32());
          break;
        case 3:
          message.nativeAssetAmount = reader.string();
          break;
        case 4:
          message.externalAssetAmount = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgAddLiquidity {
    return {
      signer: isSet(object.signer) ? String(object.signer) : "",
      externalAsset: isSet(object.externalAsset)
        ? Asset.fromJSON(object.externalAsset)
        : undefined,
      nativeAssetAmount: isSet(object.nativeAssetAmount)
        ? String(object.nativeAssetAmount)
        : "",
      externalAssetAmount: isSet(object.externalAssetAmount)
        ? String(object.externalAssetAmount)
        : "",
    };
  },

  toJSON(message: MsgAddLiquidity): unknown {
    const obj: any = {};
    message.signer !== undefined && (obj.signer = message.signer);
    message.externalAsset !== undefined &&
      (obj.externalAsset = message.externalAsset
        ? Asset.toJSON(message.externalAsset)
        : undefined);
    message.nativeAssetAmount !== undefined &&
      (obj.nativeAssetAmount = message.nativeAssetAmount);
    message.externalAssetAmount !== undefined &&
      (obj.externalAssetAmount = message.externalAssetAmount);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgAddLiquidity>, I>>(
    object: I,
  ): MsgAddLiquidity {
    const message = createBaseMsgAddLiquidity();
    message.signer = object.signer ?? "";
    message.externalAsset =
      object.externalAsset !== undefined && object.externalAsset !== null
        ? Asset.fromPartial(object.externalAsset)
        : undefined;
    message.nativeAssetAmount = object.nativeAssetAmount ?? "";
    message.externalAssetAmount = object.externalAssetAmount ?? "";
    return message;
  },
};

function createBaseMsgAddLiquidityResponse(): MsgAddLiquidityResponse {
  return {};
}

export const MsgAddLiquidityResponse = {
  encode(
    _: MsgAddLiquidityResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): MsgAddLiquidityResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgAddLiquidityResponse();
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

  fromJSON(_: any): MsgAddLiquidityResponse {
    return {};
  },

  toJSON(_: MsgAddLiquidityResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgAddLiquidityResponse>, I>>(
    _: I,
  ): MsgAddLiquidityResponse {
    const message = createBaseMsgAddLiquidityResponse();
    return message;
  },
};

function createBaseMsgModifyPmtpRates(): MsgModifyPmtpRates {
  return { signer: "", blockRate: "", runningRate: "", endPolicy: false };
}

export const MsgModifyPmtpRates = {
  encode(
    message: MsgModifyPmtpRates,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.signer !== "") {
      writer.uint32(10).string(message.signer);
    }
    if (message.blockRate !== "") {
      writer.uint32(18).string(message.blockRate);
    }
    if (message.runningRate !== "") {
      writer.uint32(26).string(message.runningRate);
    }
    if (message.endPolicy === true) {
      writer.uint32(32).bool(message.endPolicy);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgModifyPmtpRates {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgModifyPmtpRates();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.signer = reader.string();
          break;
        case 2:
          message.blockRate = reader.string();
          break;
        case 3:
          message.runningRate = reader.string();
          break;
        case 4:
          message.endPolicy = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgModifyPmtpRates {
    return {
      signer: isSet(object.signer) ? String(object.signer) : "",
      blockRate: isSet(object.blockRate) ? String(object.blockRate) : "",
      runningRate: isSet(object.runningRate) ? String(object.runningRate) : "",
      endPolicy: isSet(object.endPolicy) ? Boolean(object.endPolicy) : false,
    };
  },

  toJSON(message: MsgModifyPmtpRates): unknown {
    const obj: any = {};
    message.signer !== undefined && (obj.signer = message.signer);
    message.blockRate !== undefined && (obj.blockRate = message.blockRate);
    message.runningRate !== undefined &&
      (obj.runningRate = message.runningRate);
    message.endPolicy !== undefined && (obj.endPolicy = message.endPolicy);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgModifyPmtpRates>, I>>(
    object: I,
  ): MsgModifyPmtpRates {
    const message = createBaseMsgModifyPmtpRates();
    message.signer = object.signer ?? "";
    message.blockRate = object.blockRate ?? "";
    message.runningRate = object.runningRate ?? "";
    message.endPolicy = object.endPolicy ?? false;
    return message;
  },
};

function createBaseMsgModifyPmtpRatesResponse(): MsgModifyPmtpRatesResponse {
  return {};
}

export const MsgModifyPmtpRatesResponse = {
  encode(
    _: MsgModifyPmtpRatesResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): MsgModifyPmtpRatesResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgModifyPmtpRatesResponse();
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

  fromJSON(_: any): MsgModifyPmtpRatesResponse {
    return {};
  },

  toJSON(_: MsgModifyPmtpRatesResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgModifyPmtpRatesResponse>, I>>(
    _: I,
  ): MsgModifyPmtpRatesResponse {
    const message = createBaseMsgModifyPmtpRatesResponse();
    return message;
  },
};

function createBaseMsgUpdatePmtpParams(): MsgUpdatePmtpParams {
  return {
    signer: "",
    pmtpPeriodGovernanceRate: "",
    startNewPolicy: false,
    pmtpPeriodEpochLength: Long.ZERO,
    pmtpPeriodStartBlock: Long.ZERO,
    pmtpPeriodEndBlock: Long.ZERO,
  };
}

export const MsgUpdatePmtpParams = {
  encode(
    message: MsgUpdatePmtpParams,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.signer !== "") {
      writer.uint32(10).string(message.signer);
    }
    if (message.pmtpPeriodGovernanceRate !== "") {
      writer.uint32(18).string(message.pmtpPeriodGovernanceRate);
    }
    if (message.startNewPolicy === true) {
      writer.uint32(24).bool(message.startNewPolicy);
    }
    if (!message.pmtpPeriodEpochLength.isZero()) {
      writer.uint32(32).int64(message.pmtpPeriodEpochLength);
    }
    if (!message.pmtpPeriodStartBlock.isZero()) {
      writer.uint32(40).int64(message.pmtpPeriodStartBlock);
    }
    if (!message.pmtpPeriodEndBlock.isZero()) {
      writer.uint32(48).int64(message.pmtpPeriodEndBlock);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgUpdatePmtpParams {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdatePmtpParams();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.signer = reader.string();
          break;
        case 2:
          message.pmtpPeriodGovernanceRate = reader.string();
          break;
        case 3:
          message.startNewPolicy = reader.bool();
          break;
        case 4:
          message.pmtpPeriodEpochLength = reader.int64() as Long;
          break;
        case 5:
          message.pmtpPeriodStartBlock = reader.int64() as Long;
          break;
        case 6:
          message.pmtpPeriodEndBlock = reader.int64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgUpdatePmtpParams {
    return {
      signer: isSet(object.signer) ? String(object.signer) : "",
      pmtpPeriodGovernanceRate: isSet(object.pmtpPeriodGovernanceRate)
        ? String(object.pmtpPeriodGovernanceRate)
        : "",
      startNewPolicy: isSet(object.startNewPolicy)
        ? Boolean(object.startNewPolicy)
        : false,
      pmtpPeriodEpochLength: isSet(object.pmtpPeriodEpochLength)
        ? Long.fromString(object.pmtpPeriodEpochLength)
        : Long.ZERO,
      pmtpPeriodStartBlock: isSet(object.pmtpPeriodStartBlock)
        ? Long.fromString(object.pmtpPeriodStartBlock)
        : Long.ZERO,
      pmtpPeriodEndBlock: isSet(object.pmtpPeriodEndBlock)
        ? Long.fromString(object.pmtpPeriodEndBlock)
        : Long.ZERO,
    };
  },

  toJSON(message: MsgUpdatePmtpParams): unknown {
    const obj: any = {};
    message.signer !== undefined && (obj.signer = message.signer);
    message.pmtpPeriodGovernanceRate !== undefined &&
      (obj.pmtpPeriodGovernanceRate = message.pmtpPeriodGovernanceRate);
    message.startNewPolicy !== undefined &&
      (obj.startNewPolicy = message.startNewPolicy);
    message.pmtpPeriodEpochLength !== undefined &&
      (obj.pmtpPeriodEpochLength = (
        message.pmtpPeriodEpochLength || Long.ZERO
      ).toString());
    message.pmtpPeriodStartBlock !== undefined &&
      (obj.pmtpPeriodStartBlock = (
        message.pmtpPeriodStartBlock || Long.ZERO
      ).toString());
    message.pmtpPeriodEndBlock !== undefined &&
      (obj.pmtpPeriodEndBlock = (
        message.pmtpPeriodEndBlock || Long.ZERO
      ).toString());
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgUpdatePmtpParams>, I>>(
    object: I,
  ): MsgUpdatePmtpParams {
    const message = createBaseMsgUpdatePmtpParams();
    message.signer = object.signer ?? "";
    message.pmtpPeriodGovernanceRate = object.pmtpPeriodGovernanceRate ?? "";
    message.startNewPolicy = object.startNewPolicy ?? false;
    message.pmtpPeriodEpochLength =
      object.pmtpPeriodEpochLength !== undefined &&
      object.pmtpPeriodEpochLength !== null
        ? Long.fromValue(object.pmtpPeriodEpochLength)
        : Long.ZERO;
    message.pmtpPeriodStartBlock =
      object.pmtpPeriodStartBlock !== undefined &&
      object.pmtpPeriodStartBlock !== null
        ? Long.fromValue(object.pmtpPeriodStartBlock)
        : Long.ZERO;
    message.pmtpPeriodEndBlock =
      object.pmtpPeriodEndBlock !== undefined &&
      object.pmtpPeriodEndBlock !== null
        ? Long.fromValue(object.pmtpPeriodEndBlock)
        : Long.ZERO;
    return message;
  },
};

function createBaseMsgUpdatePmtpParamsResponse(): MsgUpdatePmtpParamsResponse {
  return {};
}

export const MsgUpdatePmtpParamsResponse = {
  encode(
    _: MsgUpdatePmtpParamsResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): MsgUpdatePmtpParamsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdatePmtpParamsResponse();
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

  fromJSON(_: any): MsgUpdatePmtpParamsResponse {
    return {};
  },

  toJSON(_: MsgUpdatePmtpParamsResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgUpdatePmtpParamsResponse>, I>>(
    _: I,
  ): MsgUpdatePmtpParamsResponse {
    const message = createBaseMsgUpdatePmtpParamsResponse();
    return message;
  },
};

function createBaseMsgSwap(): MsgSwap {
  return {
    signer: "",
    sentAsset: undefined,
    receivedAsset: undefined,
    sentAmount: "",
    minReceivingAmount: "",
  };
}

export const MsgSwap = {
  encode(
    message: MsgSwap,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.signer !== "") {
      writer.uint32(10).string(message.signer);
    }
    if (message.sentAsset !== undefined) {
      Asset.encode(message.sentAsset, writer.uint32(18).fork()).ldelim();
    }
    if (message.receivedAsset !== undefined) {
      Asset.encode(message.receivedAsset, writer.uint32(26).fork()).ldelim();
    }
    if (message.sentAmount !== "") {
      writer.uint32(34).string(message.sentAmount);
    }
    if (message.minReceivingAmount !== "") {
      writer.uint32(42).string(message.minReceivingAmount);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgSwap {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSwap();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.signer = reader.string();
          break;
        case 2:
          message.sentAsset = Asset.decode(reader, reader.uint32());
          break;
        case 3:
          message.receivedAsset = Asset.decode(reader, reader.uint32());
          break;
        case 4:
          message.sentAmount = reader.string();
          break;
        case 5:
          message.minReceivingAmount = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgSwap {
    return {
      signer: isSet(object.signer) ? String(object.signer) : "",
      sentAsset: isSet(object.sentAsset)
        ? Asset.fromJSON(object.sentAsset)
        : undefined,
      receivedAsset: isSet(object.receivedAsset)
        ? Asset.fromJSON(object.receivedAsset)
        : undefined,
      sentAmount: isSet(object.sentAmount) ? String(object.sentAmount) : "",
      minReceivingAmount: isSet(object.minReceivingAmount)
        ? String(object.minReceivingAmount)
        : "",
    };
  },

  toJSON(message: MsgSwap): unknown {
    const obj: any = {};
    message.signer !== undefined && (obj.signer = message.signer);
    message.sentAsset !== undefined &&
      (obj.sentAsset = message.sentAsset
        ? Asset.toJSON(message.sentAsset)
        : undefined);
    message.receivedAsset !== undefined &&
      (obj.receivedAsset = message.receivedAsset
        ? Asset.toJSON(message.receivedAsset)
        : undefined);
    message.sentAmount !== undefined && (obj.sentAmount = message.sentAmount);
    message.minReceivingAmount !== undefined &&
      (obj.minReceivingAmount = message.minReceivingAmount);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgSwap>, I>>(object: I): MsgSwap {
    const message = createBaseMsgSwap();
    message.signer = object.signer ?? "";
    message.sentAsset =
      object.sentAsset !== undefined && object.sentAsset !== null
        ? Asset.fromPartial(object.sentAsset)
        : undefined;
    message.receivedAsset =
      object.receivedAsset !== undefined && object.receivedAsset !== null
        ? Asset.fromPartial(object.receivedAsset)
        : undefined;
    message.sentAmount = object.sentAmount ?? "";
    message.minReceivingAmount = object.minReceivingAmount ?? "";
    return message;
  },
};

function createBaseMsgSwapResponse(): MsgSwapResponse {
  return {};
}

export const MsgSwapResponse = {
  encode(
    _: MsgSwapResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgSwapResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSwapResponse();
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

  fromJSON(_: any): MsgSwapResponse {
    return {};
  },

  toJSON(_: MsgSwapResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgSwapResponse>, I>>(
    _: I,
  ): MsgSwapResponse {
    const message = createBaseMsgSwapResponse();
    return message;
  },
};

function createBaseMsgDecommissionPool(): MsgDecommissionPool {
  return { signer: "", symbol: "" };
}

export const MsgDecommissionPool = {
  encode(
    message: MsgDecommissionPool,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.signer !== "") {
      writer.uint32(10).string(message.signer);
    }
    if (message.symbol !== "") {
      writer.uint32(18).string(message.symbol);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgDecommissionPool {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgDecommissionPool();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.signer = reader.string();
          break;
        case 2:
          message.symbol = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgDecommissionPool {
    return {
      signer: isSet(object.signer) ? String(object.signer) : "",
      symbol: isSet(object.symbol) ? String(object.symbol) : "",
    };
  },

  toJSON(message: MsgDecommissionPool): unknown {
    const obj: any = {};
    message.signer !== undefined && (obj.signer = message.signer);
    message.symbol !== undefined && (obj.symbol = message.symbol);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgDecommissionPool>, I>>(
    object: I,
  ): MsgDecommissionPool {
    const message = createBaseMsgDecommissionPool();
    message.signer = object.signer ?? "";
    message.symbol = object.symbol ?? "";
    return message;
  },
};

function createBaseMsgDecommissionPoolResponse(): MsgDecommissionPoolResponse {
  return {};
}

export const MsgDecommissionPoolResponse = {
  encode(
    _: MsgDecommissionPoolResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): MsgDecommissionPoolResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgDecommissionPoolResponse();
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

  fromJSON(_: any): MsgDecommissionPoolResponse {
    return {};
  },

  toJSON(_: MsgDecommissionPoolResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgDecommissionPoolResponse>, I>>(
    _: I,
  ): MsgDecommissionPoolResponse {
    const message = createBaseMsgDecommissionPoolResponse();
    return message;
  },
};

export interface Msg {
  RemoveLiquidity(
    request: MsgRemoveLiquidity,
  ): Promise<MsgRemoveLiquidityResponse>;
  CreatePool(request: MsgCreatePool): Promise<MsgCreatePoolResponse>;
  AddLiquidity(request: MsgAddLiquidity): Promise<MsgAddLiquidityResponse>;
  Swap(request: MsgSwap): Promise<MsgSwapResponse>;
  DecommissionPool(
    request: MsgDecommissionPool,
  ): Promise<MsgDecommissionPoolResponse>;
  ModifyPmtpRates(
    request: MsgModifyPmtpRates,
  ): Promise<MsgModifyPmtpRatesResponse>;
  UpdatePmtpParams(
    request: MsgUpdatePmtpParams,
  ): Promise<MsgUpdatePmtpParamsResponse>;
}

export class MsgClientImpl implements Msg {
  private readonly rpc: Rpc;
  constructor(rpc: Rpc) {
    this.rpc = rpc;
    this.RemoveLiquidity = this.RemoveLiquidity.bind(this);
    this.CreatePool = this.CreatePool.bind(this);
    this.AddLiquidity = this.AddLiquidity.bind(this);
    this.Swap = this.Swap.bind(this);
    this.DecommissionPool = this.DecommissionPool.bind(this);
    this.ModifyPmtpRates = this.ModifyPmtpRates.bind(this);
    this.UpdatePmtpParams = this.UpdatePmtpParams.bind(this);
  }
  RemoveLiquidity(
    request: MsgRemoveLiquidity,
  ): Promise<MsgRemoveLiquidityResponse> {
    const data = MsgRemoveLiquidity.encode(request).finish();
    const promise = this.rpc.request(
      "sifnode.clp.v1.Msg",
      "RemoveLiquidity",
      data,
    );
    return promise.then((data) =>
      MsgRemoveLiquidityResponse.decode(new _m0.Reader(data)),
    );
  }

  CreatePool(request: MsgCreatePool): Promise<MsgCreatePoolResponse> {
    const data = MsgCreatePool.encode(request).finish();
    const promise = this.rpc.request("sifnode.clp.v1.Msg", "CreatePool", data);
    return promise.then((data) =>
      MsgCreatePoolResponse.decode(new _m0.Reader(data)),
    );
  }

  AddLiquidity(request: MsgAddLiquidity): Promise<MsgAddLiquidityResponse> {
    const data = MsgAddLiquidity.encode(request).finish();
    const promise = this.rpc.request(
      "sifnode.clp.v1.Msg",
      "AddLiquidity",
      data,
    );
    return promise.then((data) =>
      MsgAddLiquidityResponse.decode(new _m0.Reader(data)),
    );
  }

  Swap(request: MsgSwap): Promise<MsgSwapResponse> {
    const data = MsgSwap.encode(request).finish();
    const promise = this.rpc.request("sifnode.clp.v1.Msg", "Swap", data);
    return promise.then((data) => MsgSwapResponse.decode(new _m0.Reader(data)));
  }

  DecommissionPool(
    request: MsgDecommissionPool,
  ): Promise<MsgDecommissionPoolResponse> {
    const data = MsgDecommissionPool.encode(request).finish();
    const promise = this.rpc.request(
      "sifnode.clp.v1.Msg",
      "DecommissionPool",
      data,
    );
    return promise.then((data) =>
      MsgDecommissionPoolResponse.decode(new _m0.Reader(data)),
    );
  }

  ModifyPmtpRates(
    request: MsgModifyPmtpRates,
  ): Promise<MsgModifyPmtpRatesResponse> {
    const data = MsgModifyPmtpRates.encode(request).finish();
    const promise = this.rpc.request(
      "sifnode.clp.v1.Msg",
      "ModifyPmtpRates",
      data,
    );
    return promise.then((data) =>
      MsgModifyPmtpRatesResponse.decode(new _m0.Reader(data)),
    );
  }

  UpdatePmtpParams(
    request: MsgUpdatePmtpParams,
  ): Promise<MsgUpdatePmtpParamsResponse> {
    const data = MsgUpdatePmtpParams.encode(request).finish();
    const promise = this.rpc.request(
      "sifnode.clp.v1.Msg",
      "UpdatePmtpParams",
      data,
    );
    return promise.then((data) =>
      MsgUpdatePmtpParamsResponse.decode(new _m0.Reader(data)),
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
