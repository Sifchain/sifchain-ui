/* eslint-disable */
import {
  Pool,
  LiquidityProvider,
  PmtpEpoch,
  Asset,
  LiquidityProviderData,
} from "./types";
import {
  PageRequest,
  PageResponse,
} from "../../../cosmos/base/query/v1beta1/pagination";
import {
  Params,
  RewardParams,
  PmtpParams,
  PmtpRateParams,
  LiquidityProtectionParams,
  LiquidityProtectionRateParams,
  ProviderDistributionParams,
  SwapFeeTokenParams,
} from "./params";
import Long from "long";
import _m0 from "protobufjs/minimal";

export const protobufPackage = "sifnode.clp.v1";

export enum SwapStatus {
  UNSPECIFIED = 0,
  NO_SWAP = 1,
  SELL_NATIVE = 2,
  BUY_NATIVE = 3,
  UNRECOGNIZED = -1,
}

export function swapStatusFromJSON(object: any): SwapStatus {
  switch (object) {
    case 0:
    case "UNSPECIFIED":
      return SwapStatus.UNSPECIFIED;
    case 1:
    case "NO_SWAP":
      return SwapStatus.NO_SWAP;
    case 2:
    case "SELL_NATIVE":
      return SwapStatus.SELL_NATIVE;
    case 3:
    case "BUY_NATIVE":
      return SwapStatus.BUY_NATIVE;
    case -1:
    case "UNRECOGNIZED":
    default:
      return SwapStatus.UNRECOGNIZED;
  }
}

export function swapStatusToJSON(object: SwapStatus): string {
  switch (object) {
    case SwapStatus.UNSPECIFIED:
      return "UNSPECIFIED";
    case SwapStatus.NO_SWAP:
      return "NO_SWAP";
    case SwapStatus.SELL_NATIVE:
      return "SELL_NATIVE";
    case SwapStatus.BUY_NATIVE:
      return "BUY_NATIVE";
    case SwapStatus.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface PoolReq {
  symbol: string;
}

export interface PoolRes {
  pool?: Pool;
  clpModuleAddress: string;
  height: Long;
}

export interface PoolsReq {
  pagination?: PageRequest;
}

export interface PoolsRes {
  pools: Pool[];
  clpModuleAddress: string;
  height: Long;
  pagination?: PageResponse;
}

export interface LiquidityProviderReq {
  symbol: string;
  lpAddress: string;
}

export interface LiquidityProviderRes {
  liquidityProvider?: LiquidityProvider;
  nativeAssetBalance: string;
  externalAssetBalance: string;
  height: Long;
}

export interface AssetListReq {
  lpAddress: string;
  pagination?: PageRequest;
}

export interface AssetListRes {
  assets: Asset[];
  height: Long;
  pagination?: PageResponse;
}

export interface LiquidityProviderDataReq {
  lpAddress: string;
  pagination?: PageRequest;
}

export interface LiquidityProviderDataRes {
  liquidityProviderData: LiquidityProviderData[];
  height: Long;
  pagination?: PageRequest;
}

export interface LiquidityProviderListReq {
  symbol: string;
  /** pagination defines an optional pagination for the request. */
  pagination?: PageRequest;
}

export interface LiquidityProviderListRes {
  liquidityProviders: LiquidityProvider[];
  height: Long;
  /** pagination defines the pagination in the response. */
  pagination?: PageResponse;
}

export interface LiquidityProvidersReq {
  pagination?: PageRequest;
}

export interface LiquidityProvidersRes {
  liquidityProviders: LiquidityProvider[];
  height: Long;
  pagination?: PageResponse;
}

export interface ParamsReq {}

export interface ParamsRes {
  params?: Params;
  symmetryThreshold: string;
  symmetryRatioThreshold: string;
}

export interface RewardParamsReq {}

export interface RewardParamsRes {
  params?: RewardParams;
}

export interface PmtpParamsReq {}

export interface PmtpParamsRes {
  params?: PmtpParams;
  pmtpRateParams?: PmtpRateParams;
  pmtpEpoch?: PmtpEpoch;
  height: Long;
}

export interface LiquidityProtectionParamsReq {}

export interface LiquidityProtectionParamsRes {
  params?: LiquidityProtectionParams;
  rateParams?: LiquidityProtectionRateParams;
  height: Long;
}

export interface ProviderDistributionParamsReq {}

export interface ProviderDistributionParamsRes {
  params?: ProviderDistributionParams;
}

export interface SwapFeeParamsReq {}

export interface SwapFeeParamsRes {
  defaultSwapFeeRate: string;
  tokenParams: SwapFeeTokenParams[];
}

export interface PoolShareEstimateReq {
  externalAsset?: Asset;
  nativeAssetAmount: string;
  externalAssetAmount: string;
}

export interface PoolShareEstimateRes {
  percentage: string;
  nativeAssetAmount: string;
  externalAssetAmount: string;
  swapInfo?: SwapInfo;
}

export interface SwapInfo {
  status: SwapStatus;
  fee: string;
  feeRate: string;
  amount: string;
  result: string;
}

function createBasePoolReq(): PoolReq {
  return { symbol: "" };
}

export const PoolReq = {
  encode(
    message: PoolReq,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.symbol !== "") {
      writer.uint32(10).string(message.symbol);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PoolReq {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePoolReq();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.symbol = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): PoolReq {
    return {
      symbol: isSet(object.symbol) ? String(object.symbol) : "",
    };
  },

  toJSON(message: PoolReq): unknown {
    const obj: any = {};
    message.symbol !== undefined && (obj.symbol = message.symbol);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<PoolReq>, I>>(object: I): PoolReq {
    const message = createBasePoolReq();
    message.symbol = object.symbol ?? "";
    return message;
  },
};

function createBasePoolRes(): PoolRes {
  return { pool: undefined, clpModuleAddress: "", height: Long.ZERO };
}

export const PoolRes = {
  encode(
    message: PoolRes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.pool !== undefined) {
      Pool.encode(message.pool, writer.uint32(10).fork()).ldelim();
    }
    if (message.clpModuleAddress !== "") {
      writer.uint32(18).string(message.clpModuleAddress);
    }
    if (!message.height.isZero()) {
      writer.uint32(24).int64(message.height);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PoolRes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePoolRes();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.pool = Pool.decode(reader, reader.uint32());
          break;
        case 2:
          message.clpModuleAddress = reader.string();
          break;
        case 3:
          message.height = reader.int64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): PoolRes {
    return {
      pool: isSet(object.pool) ? Pool.fromJSON(object.pool) : undefined,
      clpModuleAddress: isSet(object.clpModuleAddress)
        ? String(object.clpModuleAddress)
        : "",
      height: isSet(object.height) ? Long.fromValue(object.height) : Long.ZERO,
    };
  },

  toJSON(message: PoolRes): unknown {
    const obj: any = {};
    message.pool !== undefined &&
      (obj.pool = message.pool ? Pool.toJSON(message.pool) : undefined);
    message.clpModuleAddress !== undefined &&
      (obj.clpModuleAddress = message.clpModuleAddress);
    message.height !== undefined &&
      (obj.height = (message.height || Long.ZERO).toString());
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<PoolRes>, I>>(object: I): PoolRes {
    const message = createBasePoolRes();
    message.pool =
      object.pool !== undefined && object.pool !== null
        ? Pool.fromPartial(object.pool)
        : undefined;
    message.clpModuleAddress = object.clpModuleAddress ?? "";
    message.height =
      object.height !== undefined && object.height !== null
        ? Long.fromValue(object.height)
        : Long.ZERO;
    return message;
  },
};

function createBasePoolsReq(): PoolsReq {
  return { pagination: undefined };
}

export const PoolsReq = {
  encode(
    message: PoolsReq,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PoolsReq {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePoolsReq();
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

  fromJSON(object: any): PoolsReq {
    return {
      pagination: isSet(object.pagination)
        ? PageRequest.fromJSON(object.pagination)
        : undefined,
    };
  },

  toJSON(message: PoolsReq): unknown {
    const obj: any = {};
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageRequest.toJSON(message.pagination)
        : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<PoolsReq>, I>>(object: I): PoolsReq {
    const message = createBasePoolsReq();
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageRequest.fromPartial(object.pagination)
        : undefined;
    return message;
  },
};

function createBasePoolsRes(): PoolsRes {
  return {
    pools: [],
    clpModuleAddress: "",
    height: Long.ZERO,
    pagination: undefined,
  };
}

export const PoolsRes = {
  encode(
    message: PoolsRes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    for (const v of message.pools) {
      Pool.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.clpModuleAddress !== "") {
      writer.uint32(18).string(message.clpModuleAddress);
    }
    if (!message.height.isZero()) {
      writer.uint32(24).int64(message.height);
    }
    if (message.pagination !== undefined) {
      PageResponse.encode(
        message.pagination,
        writer.uint32(34).fork(),
      ).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PoolsRes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePoolsRes();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.pools.push(Pool.decode(reader, reader.uint32()));
          break;
        case 2:
          message.clpModuleAddress = reader.string();
          break;
        case 3:
          message.height = reader.int64() as Long;
          break;
        case 4:
          message.pagination = PageResponse.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): PoolsRes {
    return {
      pools: Array.isArray(object?.pools)
        ? object.pools.map((e: any) => Pool.fromJSON(e))
        : [],
      clpModuleAddress: isSet(object.clpModuleAddress)
        ? String(object.clpModuleAddress)
        : "",
      height: isSet(object.height) ? Long.fromValue(object.height) : Long.ZERO,
      pagination: isSet(object.pagination)
        ? PageResponse.fromJSON(object.pagination)
        : undefined,
    };
  },

  toJSON(message: PoolsRes): unknown {
    const obj: any = {};
    if (message.pools) {
      obj.pools = message.pools.map((e) => (e ? Pool.toJSON(e) : undefined));
    } else {
      obj.pools = [];
    }
    message.clpModuleAddress !== undefined &&
      (obj.clpModuleAddress = message.clpModuleAddress);
    message.height !== undefined &&
      (obj.height = (message.height || Long.ZERO).toString());
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageResponse.toJSON(message.pagination)
        : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<PoolsRes>, I>>(object: I): PoolsRes {
    const message = createBasePoolsRes();
    message.pools = object.pools?.map((e) => Pool.fromPartial(e)) || [];
    message.clpModuleAddress = object.clpModuleAddress ?? "";
    message.height =
      object.height !== undefined && object.height !== null
        ? Long.fromValue(object.height)
        : Long.ZERO;
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageResponse.fromPartial(object.pagination)
        : undefined;
    return message;
  },
};

function createBaseLiquidityProviderReq(): LiquidityProviderReq {
  return { symbol: "", lpAddress: "" };
}

export const LiquidityProviderReq = {
  encode(
    message: LiquidityProviderReq,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.symbol !== "") {
      writer.uint32(10).string(message.symbol);
    }
    if (message.lpAddress !== "") {
      writer.uint32(18).string(message.lpAddress);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): LiquidityProviderReq {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLiquidityProviderReq();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.symbol = reader.string();
          break;
        case 2:
          message.lpAddress = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): LiquidityProviderReq {
    return {
      symbol: isSet(object.symbol) ? String(object.symbol) : "",
      lpAddress: isSet(object.lpAddress) ? String(object.lpAddress) : "",
    };
  },

  toJSON(message: LiquidityProviderReq): unknown {
    const obj: any = {};
    message.symbol !== undefined && (obj.symbol = message.symbol);
    message.lpAddress !== undefined && (obj.lpAddress = message.lpAddress);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<LiquidityProviderReq>, I>>(
    object: I,
  ): LiquidityProviderReq {
    const message = createBaseLiquidityProviderReq();
    message.symbol = object.symbol ?? "";
    message.lpAddress = object.lpAddress ?? "";
    return message;
  },
};

function createBaseLiquidityProviderRes(): LiquidityProviderRes {
  return {
    liquidityProvider: undefined,
    nativeAssetBalance: "",
    externalAssetBalance: "",
    height: Long.ZERO,
  };
}

export const LiquidityProviderRes = {
  encode(
    message: LiquidityProviderRes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.liquidityProvider !== undefined) {
      LiquidityProvider.encode(
        message.liquidityProvider,
        writer.uint32(10).fork(),
      ).ldelim();
    }
    if (message.nativeAssetBalance !== "") {
      writer.uint32(18).string(message.nativeAssetBalance);
    }
    if (message.externalAssetBalance !== "") {
      writer.uint32(26).string(message.externalAssetBalance);
    }
    if (!message.height.isZero()) {
      writer.uint32(32).int64(message.height);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): LiquidityProviderRes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLiquidityProviderRes();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.liquidityProvider = LiquidityProvider.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 2:
          message.nativeAssetBalance = reader.string();
          break;
        case 3:
          message.externalAssetBalance = reader.string();
          break;
        case 4:
          message.height = reader.int64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): LiquidityProviderRes {
    return {
      liquidityProvider: isSet(object.liquidityProvider)
        ? LiquidityProvider.fromJSON(object.liquidityProvider)
        : undefined,
      nativeAssetBalance: isSet(object.nativeAssetBalance)
        ? String(object.nativeAssetBalance)
        : "",
      externalAssetBalance: isSet(object.externalAssetBalance)
        ? String(object.externalAssetBalance)
        : "",
      height: isSet(object.height) ? Long.fromValue(object.height) : Long.ZERO,
    };
  },

  toJSON(message: LiquidityProviderRes): unknown {
    const obj: any = {};
    message.liquidityProvider !== undefined &&
      (obj.liquidityProvider = message.liquidityProvider
        ? LiquidityProvider.toJSON(message.liquidityProvider)
        : undefined);
    message.nativeAssetBalance !== undefined &&
      (obj.nativeAssetBalance = message.nativeAssetBalance);
    message.externalAssetBalance !== undefined &&
      (obj.externalAssetBalance = message.externalAssetBalance);
    message.height !== undefined &&
      (obj.height = (message.height || Long.ZERO).toString());
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<LiquidityProviderRes>, I>>(
    object: I,
  ): LiquidityProviderRes {
    const message = createBaseLiquidityProviderRes();
    message.liquidityProvider =
      object.liquidityProvider !== undefined &&
      object.liquidityProvider !== null
        ? LiquidityProvider.fromPartial(object.liquidityProvider)
        : undefined;
    message.nativeAssetBalance = object.nativeAssetBalance ?? "";
    message.externalAssetBalance = object.externalAssetBalance ?? "";
    message.height =
      object.height !== undefined && object.height !== null
        ? Long.fromValue(object.height)
        : Long.ZERO;
    return message;
  },
};

function createBaseAssetListReq(): AssetListReq {
  return { lpAddress: "", pagination: undefined };
}

export const AssetListReq = {
  encode(
    message: AssetListReq,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.lpAddress !== "") {
      writer.uint32(10).string(message.lpAddress);
    }
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AssetListReq {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAssetListReq();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.lpAddress = reader.string();
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

  fromJSON(object: any): AssetListReq {
    return {
      lpAddress: isSet(object.lpAddress) ? String(object.lpAddress) : "",
      pagination: isSet(object.pagination)
        ? PageRequest.fromJSON(object.pagination)
        : undefined,
    };
  },

  toJSON(message: AssetListReq): unknown {
    const obj: any = {};
    message.lpAddress !== undefined && (obj.lpAddress = message.lpAddress);
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageRequest.toJSON(message.pagination)
        : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<AssetListReq>, I>>(
    object: I,
  ): AssetListReq {
    const message = createBaseAssetListReq();
    message.lpAddress = object.lpAddress ?? "";
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageRequest.fromPartial(object.pagination)
        : undefined;
    return message;
  },
};

function createBaseAssetListRes(): AssetListRes {
  return { assets: [], height: Long.ZERO, pagination: undefined };
}

export const AssetListRes = {
  encode(
    message: AssetListRes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    for (const v of message.assets) {
      Asset.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (!message.height.isZero()) {
      writer.uint32(16).int64(message.height);
    }
    if (message.pagination !== undefined) {
      PageResponse.encode(
        message.pagination,
        writer.uint32(26).fork(),
      ).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AssetListRes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAssetListRes();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.assets.push(Asset.decode(reader, reader.uint32()));
          break;
        case 2:
          message.height = reader.int64() as Long;
          break;
        case 3:
          message.pagination = PageResponse.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): AssetListRes {
    return {
      assets: Array.isArray(object?.assets)
        ? object.assets.map((e: any) => Asset.fromJSON(e))
        : [],
      height: isSet(object.height) ? Long.fromValue(object.height) : Long.ZERO,
      pagination: isSet(object.pagination)
        ? PageResponse.fromJSON(object.pagination)
        : undefined,
    };
  },

  toJSON(message: AssetListRes): unknown {
    const obj: any = {};
    if (message.assets) {
      obj.assets = message.assets.map((e) => (e ? Asset.toJSON(e) : undefined));
    } else {
      obj.assets = [];
    }
    message.height !== undefined &&
      (obj.height = (message.height || Long.ZERO).toString());
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageResponse.toJSON(message.pagination)
        : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<AssetListRes>, I>>(
    object: I,
  ): AssetListRes {
    const message = createBaseAssetListRes();
    message.assets = object.assets?.map((e) => Asset.fromPartial(e)) || [];
    message.height =
      object.height !== undefined && object.height !== null
        ? Long.fromValue(object.height)
        : Long.ZERO;
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageResponse.fromPartial(object.pagination)
        : undefined;
    return message;
  },
};

function createBaseLiquidityProviderDataReq(): LiquidityProviderDataReq {
  return { lpAddress: "", pagination: undefined };
}

export const LiquidityProviderDataReq = {
  encode(
    message: LiquidityProviderDataReq,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.lpAddress !== "") {
      writer.uint32(10).string(message.lpAddress);
    }
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): LiquidityProviderDataReq {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLiquidityProviderDataReq();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.lpAddress = reader.string();
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

  fromJSON(object: any): LiquidityProviderDataReq {
    return {
      lpAddress: isSet(object.lpAddress) ? String(object.lpAddress) : "",
      pagination: isSet(object.pagination)
        ? PageRequest.fromJSON(object.pagination)
        : undefined,
    };
  },

  toJSON(message: LiquidityProviderDataReq): unknown {
    const obj: any = {};
    message.lpAddress !== undefined && (obj.lpAddress = message.lpAddress);
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageRequest.toJSON(message.pagination)
        : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<LiquidityProviderDataReq>, I>>(
    object: I,
  ): LiquidityProviderDataReq {
    const message = createBaseLiquidityProviderDataReq();
    message.lpAddress = object.lpAddress ?? "";
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageRequest.fromPartial(object.pagination)
        : undefined;
    return message;
  },
};

function createBaseLiquidityProviderDataRes(): LiquidityProviderDataRes {
  return {
    liquidityProviderData: [],
    height: Long.ZERO,
    pagination: undefined,
  };
}

export const LiquidityProviderDataRes = {
  encode(
    message: LiquidityProviderDataRes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    for (const v of message.liquidityProviderData) {
      LiquidityProviderData.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (!message.height.isZero()) {
      writer.uint32(16).int64(message.height);
    }
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): LiquidityProviderDataRes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLiquidityProviderDataRes();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.liquidityProviderData.push(
            LiquidityProviderData.decode(reader, reader.uint32()),
          );
          break;
        case 2:
          message.height = reader.int64() as Long;
          break;
        case 3:
          message.pagination = PageRequest.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): LiquidityProviderDataRes {
    return {
      liquidityProviderData: Array.isArray(object?.liquidityProviderData)
        ? object.liquidityProviderData.map((e: any) =>
            LiquidityProviderData.fromJSON(e),
          )
        : [],
      height: isSet(object.height) ? Long.fromValue(object.height) : Long.ZERO,
      pagination: isSet(object.pagination)
        ? PageRequest.fromJSON(object.pagination)
        : undefined,
    };
  },

  toJSON(message: LiquidityProviderDataRes): unknown {
    const obj: any = {};
    if (message.liquidityProviderData) {
      obj.liquidityProviderData = message.liquidityProviderData.map((e) =>
        e ? LiquidityProviderData.toJSON(e) : undefined,
      );
    } else {
      obj.liquidityProviderData = [];
    }
    message.height !== undefined &&
      (obj.height = (message.height || Long.ZERO).toString());
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageRequest.toJSON(message.pagination)
        : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<LiquidityProviderDataRes>, I>>(
    object: I,
  ): LiquidityProviderDataRes {
    const message = createBaseLiquidityProviderDataRes();
    message.liquidityProviderData =
      object.liquidityProviderData?.map((e) =>
        LiquidityProviderData.fromPartial(e),
      ) || [];
    message.height =
      object.height !== undefined && object.height !== null
        ? Long.fromValue(object.height)
        : Long.ZERO;
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageRequest.fromPartial(object.pagination)
        : undefined;
    return message;
  },
};

function createBaseLiquidityProviderListReq(): LiquidityProviderListReq {
  return { symbol: "", pagination: undefined };
}

export const LiquidityProviderListReq = {
  encode(
    message: LiquidityProviderListReq,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.symbol !== "") {
      writer.uint32(10).string(message.symbol);
    }
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): LiquidityProviderListReq {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLiquidityProviderListReq();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.symbol = reader.string();
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

  fromJSON(object: any): LiquidityProviderListReq {
    return {
      symbol: isSet(object.symbol) ? String(object.symbol) : "",
      pagination: isSet(object.pagination)
        ? PageRequest.fromJSON(object.pagination)
        : undefined,
    };
  },

  toJSON(message: LiquidityProviderListReq): unknown {
    const obj: any = {};
    message.symbol !== undefined && (obj.symbol = message.symbol);
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageRequest.toJSON(message.pagination)
        : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<LiquidityProviderListReq>, I>>(
    object: I,
  ): LiquidityProviderListReq {
    const message = createBaseLiquidityProviderListReq();
    message.symbol = object.symbol ?? "";
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageRequest.fromPartial(object.pagination)
        : undefined;
    return message;
  },
};

function createBaseLiquidityProviderListRes(): LiquidityProviderListRes {
  return { liquidityProviders: [], height: Long.ZERO, pagination: undefined };
}

export const LiquidityProviderListRes = {
  encode(
    message: LiquidityProviderListRes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    for (const v of message.liquidityProviders) {
      LiquidityProvider.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (!message.height.isZero()) {
      writer.uint32(16).int64(message.height);
    }
    if (message.pagination !== undefined) {
      PageResponse.encode(
        message.pagination,
        writer.uint32(26).fork(),
      ).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): LiquidityProviderListRes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLiquidityProviderListRes();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.liquidityProviders.push(
            LiquidityProvider.decode(reader, reader.uint32()),
          );
          break;
        case 2:
          message.height = reader.int64() as Long;
          break;
        case 3:
          message.pagination = PageResponse.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): LiquidityProviderListRes {
    return {
      liquidityProviders: Array.isArray(object?.liquidityProviders)
        ? object.liquidityProviders.map((e: any) =>
            LiquidityProvider.fromJSON(e),
          )
        : [],
      height: isSet(object.height) ? Long.fromValue(object.height) : Long.ZERO,
      pagination: isSet(object.pagination)
        ? PageResponse.fromJSON(object.pagination)
        : undefined,
    };
  },

  toJSON(message: LiquidityProviderListRes): unknown {
    const obj: any = {};
    if (message.liquidityProviders) {
      obj.liquidityProviders = message.liquidityProviders.map((e) =>
        e ? LiquidityProvider.toJSON(e) : undefined,
      );
    } else {
      obj.liquidityProviders = [];
    }
    message.height !== undefined &&
      (obj.height = (message.height || Long.ZERO).toString());
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageResponse.toJSON(message.pagination)
        : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<LiquidityProviderListRes>, I>>(
    object: I,
  ): LiquidityProviderListRes {
    const message = createBaseLiquidityProviderListRes();
    message.liquidityProviders =
      object.liquidityProviders?.map((e) => LiquidityProvider.fromPartial(e)) ||
      [];
    message.height =
      object.height !== undefined && object.height !== null
        ? Long.fromValue(object.height)
        : Long.ZERO;
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageResponse.fromPartial(object.pagination)
        : undefined;
    return message;
  },
};

function createBaseLiquidityProvidersReq(): LiquidityProvidersReq {
  return { pagination: undefined };
}

export const LiquidityProvidersReq = {
  encode(
    message: LiquidityProvidersReq,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): LiquidityProvidersReq {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLiquidityProvidersReq();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
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

  fromJSON(object: any): LiquidityProvidersReq {
    return {
      pagination: isSet(object.pagination)
        ? PageRequest.fromJSON(object.pagination)
        : undefined,
    };
  },

  toJSON(message: LiquidityProvidersReq): unknown {
    const obj: any = {};
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageRequest.toJSON(message.pagination)
        : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<LiquidityProvidersReq>, I>>(
    object: I,
  ): LiquidityProvidersReq {
    const message = createBaseLiquidityProvidersReq();
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageRequest.fromPartial(object.pagination)
        : undefined;
    return message;
  },
};

function createBaseLiquidityProvidersRes(): LiquidityProvidersRes {
  return { liquidityProviders: [], height: Long.ZERO, pagination: undefined };
}

export const LiquidityProvidersRes = {
  encode(
    message: LiquidityProvidersRes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    for (const v of message.liquidityProviders) {
      LiquidityProvider.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (!message.height.isZero()) {
      writer.uint32(16).int64(message.height);
    }
    if (message.pagination !== undefined) {
      PageResponse.encode(
        message.pagination,
        writer.uint32(26).fork(),
      ).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): LiquidityProvidersRes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLiquidityProvidersRes();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.liquidityProviders.push(
            LiquidityProvider.decode(reader, reader.uint32()),
          );
          break;
        case 2:
          message.height = reader.int64() as Long;
          break;
        case 3:
          message.pagination = PageResponse.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): LiquidityProvidersRes {
    return {
      liquidityProviders: Array.isArray(object?.liquidityProviders)
        ? object.liquidityProviders.map((e: any) =>
            LiquidityProvider.fromJSON(e),
          )
        : [],
      height: isSet(object.height) ? Long.fromValue(object.height) : Long.ZERO,
      pagination: isSet(object.pagination)
        ? PageResponse.fromJSON(object.pagination)
        : undefined,
    };
  },

  toJSON(message: LiquidityProvidersRes): unknown {
    const obj: any = {};
    if (message.liquidityProviders) {
      obj.liquidityProviders = message.liquidityProviders.map((e) =>
        e ? LiquidityProvider.toJSON(e) : undefined,
      );
    } else {
      obj.liquidityProviders = [];
    }
    message.height !== undefined &&
      (obj.height = (message.height || Long.ZERO).toString());
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageResponse.toJSON(message.pagination)
        : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<LiquidityProvidersRes>, I>>(
    object: I,
  ): LiquidityProvidersRes {
    const message = createBaseLiquidityProvidersRes();
    message.liquidityProviders =
      object.liquidityProviders?.map((e) => LiquidityProvider.fromPartial(e)) ||
      [];
    message.height =
      object.height !== undefined && object.height !== null
        ? Long.fromValue(object.height)
        : Long.ZERO;
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageResponse.fromPartial(object.pagination)
        : undefined;
    return message;
  },
};

function createBaseParamsReq(): ParamsReq {
  return {};
}

export const ParamsReq = {
  encode(_: ParamsReq, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ParamsReq {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseParamsReq();
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

  fromJSON(_: any): ParamsReq {
    return {};
  },

  toJSON(_: ParamsReq): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<ParamsReq>, I>>(_: I): ParamsReq {
    const message = createBaseParamsReq();
    return message;
  },
};

function createBaseParamsRes(): ParamsRes {
  return {
    params: undefined,
    symmetryThreshold: "",
    symmetryRatioThreshold: "",
  };
}

export const ParamsRes = {
  encode(
    message: ParamsRes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.params !== undefined) {
      Params.encode(message.params, writer.uint32(10).fork()).ldelim();
    }
    if (message.symmetryThreshold !== "") {
      writer.uint32(18).string(message.symmetryThreshold);
    }
    if (message.symmetryRatioThreshold !== "") {
      writer.uint32(26).string(message.symmetryRatioThreshold);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ParamsRes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseParamsRes();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.params = Params.decode(reader, reader.uint32());
          break;
        case 2:
          message.symmetryThreshold = reader.string();
          break;
        case 3:
          message.symmetryRatioThreshold = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ParamsRes {
    return {
      params: isSet(object.params) ? Params.fromJSON(object.params) : undefined,
      symmetryThreshold: isSet(object.symmetryThreshold)
        ? String(object.symmetryThreshold)
        : "",
      symmetryRatioThreshold: isSet(object.symmetryRatioThreshold)
        ? String(object.symmetryRatioThreshold)
        : "",
    };
  },

  toJSON(message: ParamsRes): unknown {
    const obj: any = {};
    message.params !== undefined &&
      (obj.params = message.params ? Params.toJSON(message.params) : undefined);
    message.symmetryThreshold !== undefined &&
      (obj.symmetryThreshold = message.symmetryThreshold);
    message.symmetryRatioThreshold !== undefined &&
      (obj.symmetryRatioThreshold = message.symmetryRatioThreshold);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<ParamsRes>, I>>(
    object: I,
  ): ParamsRes {
    const message = createBaseParamsRes();
    message.params =
      object.params !== undefined && object.params !== null
        ? Params.fromPartial(object.params)
        : undefined;
    message.symmetryThreshold = object.symmetryThreshold ?? "";
    message.symmetryRatioThreshold = object.symmetryRatioThreshold ?? "";
    return message;
  },
};

function createBaseRewardParamsReq(): RewardParamsReq {
  return {};
}

export const RewardParamsReq = {
  encode(
    _: RewardParamsReq,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RewardParamsReq {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRewardParamsReq();
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

  fromJSON(_: any): RewardParamsReq {
    return {};
  },

  toJSON(_: RewardParamsReq): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<RewardParamsReq>, I>>(
    _: I,
  ): RewardParamsReq {
    const message = createBaseRewardParamsReq();
    return message;
  },
};

function createBaseRewardParamsRes(): RewardParamsRes {
  return { params: undefined };
}

export const RewardParamsRes = {
  encode(
    message: RewardParamsRes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.params !== undefined) {
      RewardParams.encode(message.params, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RewardParamsRes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRewardParamsRes();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.params = RewardParams.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): RewardParamsRes {
    return {
      params: isSet(object.params)
        ? RewardParams.fromJSON(object.params)
        : undefined,
    };
  },

  toJSON(message: RewardParamsRes): unknown {
    const obj: any = {};
    message.params !== undefined &&
      (obj.params = message.params
        ? RewardParams.toJSON(message.params)
        : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<RewardParamsRes>, I>>(
    object: I,
  ): RewardParamsRes {
    const message = createBaseRewardParamsRes();
    message.params =
      object.params !== undefined && object.params !== null
        ? RewardParams.fromPartial(object.params)
        : undefined;
    return message;
  },
};

function createBasePmtpParamsReq(): PmtpParamsReq {
  return {};
}

export const PmtpParamsReq = {
  encode(
    _: PmtpParamsReq,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PmtpParamsReq {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePmtpParamsReq();
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

  fromJSON(_: any): PmtpParamsReq {
    return {};
  },

  toJSON(_: PmtpParamsReq): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<PmtpParamsReq>, I>>(
    _: I,
  ): PmtpParamsReq {
    const message = createBasePmtpParamsReq();
    return message;
  },
};

function createBasePmtpParamsRes(): PmtpParamsRes {
  return {
    params: undefined,
    pmtpRateParams: undefined,
    pmtpEpoch: undefined,
    height: Long.ZERO,
  };
}

export const PmtpParamsRes = {
  encode(
    message: PmtpParamsRes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.params !== undefined) {
      PmtpParams.encode(message.params, writer.uint32(10).fork()).ldelim();
    }
    if (message.pmtpRateParams !== undefined) {
      PmtpRateParams.encode(
        message.pmtpRateParams,
        writer.uint32(18).fork(),
      ).ldelim();
    }
    if (message.pmtpEpoch !== undefined) {
      PmtpEpoch.encode(message.pmtpEpoch, writer.uint32(26).fork()).ldelim();
    }
    if (!message.height.isZero()) {
      writer.uint32(32).int64(message.height);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PmtpParamsRes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePmtpParamsRes();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.params = PmtpParams.decode(reader, reader.uint32());
          break;
        case 2:
          message.pmtpRateParams = PmtpRateParams.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 3:
          message.pmtpEpoch = PmtpEpoch.decode(reader, reader.uint32());
          break;
        case 4:
          message.height = reader.int64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): PmtpParamsRes {
    return {
      params: isSet(object.params)
        ? PmtpParams.fromJSON(object.params)
        : undefined,
      pmtpRateParams: isSet(object.pmtpRateParams)
        ? PmtpRateParams.fromJSON(object.pmtpRateParams)
        : undefined,
      pmtpEpoch: isSet(object.pmtpEpoch)
        ? PmtpEpoch.fromJSON(object.pmtpEpoch)
        : undefined,
      height: isSet(object.height) ? Long.fromValue(object.height) : Long.ZERO,
    };
  },

  toJSON(message: PmtpParamsRes): unknown {
    const obj: any = {};
    message.params !== undefined &&
      (obj.params = message.params
        ? PmtpParams.toJSON(message.params)
        : undefined);
    message.pmtpRateParams !== undefined &&
      (obj.pmtpRateParams = message.pmtpRateParams
        ? PmtpRateParams.toJSON(message.pmtpRateParams)
        : undefined);
    message.pmtpEpoch !== undefined &&
      (obj.pmtpEpoch = message.pmtpEpoch
        ? PmtpEpoch.toJSON(message.pmtpEpoch)
        : undefined);
    message.height !== undefined &&
      (obj.height = (message.height || Long.ZERO).toString());
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<PmtpParamsRes>, I>>(
    object: I,
  ): PmtpParamsRes {
    const message = createBasePmtpParamsRes();
    message.params =
      object.params !== undefined && object.params !== null
        ? PmtpParams.fromPartial(object.params)
        : undefined;
    message.pmtpRateParams =
      object.pmtpRateParams !== undefined && object.pmtpRateParams !== null
        ? PmtpRateParams.fromPartial(object.pmtpRateParams)
        : undefined;
    message.pmtpEpoch =
      object.pmtpEpoch !== undefined && object.pmtpEpoch !== null
        ? PmtpEpoch.fromPartial(object.pmtpEpoch)
        : undefined;
    message.height =
      object.height !== undefined && object.height !== null
        ? Long.fromValue(object.height)
        : Long.ZERO;
    return message;
  },
};

function createBaseLiquidityProtectionParamsReq(): LiquidityProtectionParamsReq {
  return {};
}

export const LiquidityProtectionParamsReq = {
  encode(
    _: LiquidityProtectionParamsReq,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): LiquidityProtectionParamsReq {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLiquidityProtectionParamsReq();
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

  fromJSON(_: any): LiquidityProtectionParamsReq {
    return {};
  },

  toJSON(_: LiquidityProtectionParamsReq): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<LiquidityProtectionParamsReq>, I>>(
    _: I,
  ): LiquidityProtectionParamsReq {
    const message = createBaseLiquidityProtectionParamsReq();
    return message;
  },
};

function createBaseLiquidityProtectionParamsRes(): LiquidityProtectionParamsRes {
  return { params: undefined, rateParams: undefined, height: Long.ZERO };
}

export const LiquidityProtectionParamsRes = {
  encode(
    message: LiquidityProtectionParamsRes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.params !== undefined) {
      LiquidityProtectionParams.encode(
        message.params,
        writer.uint32(10).fork(),
      ).ldelim();
    }
    if (message.rateParams !== undefined) {
      LiquidityProtectionRateParams.encode(
        message.rateParams,
        writer.uint32(18).fork(),
      ).ldelim();
    }
    if (!message.height.isZero()) {
      writer.uint32(24).int64(message.height);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): LiquidityProtectionParamsRes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLiquidityProtectionParamsRes();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.params = LiquidityProtectionParams.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 2:
          message.rateParams = LiquidityProtectionRateParams.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 3:
          message.height = reader.int64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): LiquidityProtectionParamsRes {
    return {
      params: isSet(object.params)
        ? LiquidityProtectionParams.fromJSON(object.params)
        : undefined,
      rateParams: isSet(object.rateParams)
        ? LiquidityProtectionRateParams.fromJSON(object.rateParams)
        : undefined,
      height: isSet(object.height) ? Long.fromValue(object.height) : Long.ZERO,
    };
  },

  toJSON(message: LiquidityProtectionParamsRes): unknown {
    const obj: any = {};
    message.params !== undefined &&
      (obj.params = message.params
        ? LiquidityProtectionParams.toJSON(message.params)
        : undefined);
    message.rateParams !== undefined &&
      (obj.rateParams = message.rateParams
        ? LiquidityProtectionRateParams.toJSON(message.rateParams)
        : undefined);
    message.height !== undefined &&
      (obj.height = (message.height || Long.ZERO).toString());
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<LiquidityProtectionParamsRes>, I>>(
    object: I,
  ): LiquidityProtectionParamsRes {
    const message = createBaseLiquidityProtectionParamsRes();
    message.params =
      object.params !== undefined && object.params !== null
        ? LiquidityProtectionParams.fromPartial(object.params)
        : undefined;
    message.rateParams =
      object.rateParams !== undefined && object.rateParams !== null
        ? LiquidityProtectionRateParams.fromPartial(object.rateParams)
        : undefined;
    message.height =
      object.height !== undefined && object.height !== null
        ? Long.fromValue(object.height)
        : Long.ZERO;
    return message;
  },
};

function createBaseProviderDistributionParamsReq(): ProviderDistributionParamsReq {
  return {};
}

export const ProviderDistributionParamsReq = {
  encode(
    _: ProviderDistributionParamsReq,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): ProviderDistributionParamsReq {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProviderDistributionParamsReq();
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

  fromJSON(_: any): ProviderDistributionParamsReq {
    return {};
  },

  toJSON(_: ProviderDistributionParamsReq): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<ProviderDistributionParamsReq>, I>>(
    _: I,
  ): ProviderDistributionParamsReq {
    const message = createBaseProviderDistributionParamsReq();
    return message;
  },
};

function createBaseProviderDistributionParamsRes(): ProviderDistributionParamsRes {
  return { params: undefined };
}

export const ProviderDistributionParamsRes = {
  encode(
    message: ProviderDistributionParamsRes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.params !== undefined) {
      ProviderDistributionParams.encode(
        message.params,
        writer.uint32(10).fork(),
      ).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): ProviderDistributionParamsRes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProviderDistributionParamsRes();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.params = ProviderDistributionParams.decode(
            reader,
            reader.uint32(),
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ProviderDistributionParamsRes {
    return {
      params: isSet(object.params)
        ? ProviderDistributionParams.fromJSON(object.params)
        : undefined,
    };
  },

  toJSON(message: ProviderDistributionParamsRes): unknown {
    const obj: any = {};
    message.params !== undefined &&
      (obj.params = message.params
        ? ProviderDistributionParams.toJSON(message.params)
        : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<ProviderDistributionParamsRes>, I>>(
    object: I,
  ): ProviderDistributionParamsRes {
    const message = createBaseProviderDistributionParamsRes();
    message.params =
      object.params !== undefined && object.params !== null
        ? ProviderDistributionParams.fromPartial(object.params)
        : undefined;
    return message;
  },
};

function createBaseSwapFeeParamsReq(): SwapFeeParamsReq {
  return {};
}

export const SwapFeeParamsReq = {
  encode(
    _: SwapFeeParamsReq,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SwapFeeParamsReq {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSwapFeeParamsReq();
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

  fromJSON(_: any): SwapFeeParamsReq {
    return {};
  },

  toJSON(_: SwapFeeParamsReq): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<SwapFeeParamsReq>, I>>(
    _: I,
  ): SwapFeeParamsReq {
    const message = createBaseSwapFeeParamsReq();
    return message;
  },
};

function createBaseSwapFeeParamsRes(): SwapFeeParamsRes {
  return { defaultSwapFeeRate: "", tokenParams: [] };
}

export const SwapFeeParamsRes = {
  encode(
    message: SwapFeeParamsRes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.defaultSwapFeeRate !== "") {
      writer.uint32(10).string(message.defaultSwapFeeRate);
    }
    for (const v of message.tokenParams) {
      SwapFeeTokenParams.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SwapFeeParamsRes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSwapFeeParamsRes();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.defaultSwapFeeRate = reader.string();
          break;
        case 2:
          message.tokenParams.push(
            SwapFeeTokenParams.decode(reader, reader.uint32()),
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): SwapFeeParamsRes {
    return {
      defaultSwapFeeRate: isSet(object.defaultSwapFeeRate)
        ? String(object.defaultSwapFeeRate)
        : "",
      tokenParams: Array.isArray(object?.tokenParams)
        ? object.tokenParams.map((e: any) => SwapFeeTokenParams.fromJSON(e))
        : [],
    };
  },

  toJSON(message: SwapFeeParamsRes): unknown {
    const obj: any = {};
    message.defaultSwapFeeRate !== undefined &&
      (obj.defaultSwapFeeRate = message.defaultSwapFeeRate);
    if (message.tokenParams) {
      obj.tokenParams = message.tokenParams.map((e) =>
        e ? SwapFeeTokenParams.toJSON(e) : undefined,
      );
    } else {
      obj.tokenParams = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<SwapFeeParamsRes>, I>>(
    object: I,
  ): SwapFeeParamsRes {
    const message = createBaseSwapFeeParamsRes();
    message.defaultSwapFeeRate = object.defaultSwapFeeRate ?? "";
    message.tokenParams =
      object.tokenParams?.map((e) => SwapFeeTokenParams.fromPartial(e)) || [];
    return message;
  },
};

function createBasePoolShareEstimateReq(): PoolShareEstimateReq {
  return {
    externalAsset: undefined,
    nativeAssetAmount: "",
    externalAssetAmount: "",
  };
}

export const PoolShareEstimateReq = {
  encode(
    message: PoolShareEstimateReq,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.externalAsset !== undefined) {
      Asset.encode(message.externalAsset, writer.uint32(10).fork()).ldelim();
    }
    if (message.nativeAssetAmount !== "") {
      writer.uint32(18).string(message.nativeAssetAmount);
    }
    if (message.externalAssetAmount !== "") {
      writer.uint32(26).string(message.externalAssetAmount);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): PoolShareEstimateReq {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePoolShareEstimateReq();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.externalAsset = Asset.decode(reader, reader.uint32());
          break;
        case 2:
          message.nativeAssetAmount = reader.string();
          break;
        case 3:
          message.externalAssetAmount = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): PoolShareEstimateReq {
    return {
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

  toJSON(message: PoolShareEstimateReq): unknown {
    const obj: any = {};
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

  fromPartial<I extends Exact<DeepPartial<PoolShareEstimateReq>, I>>(
    object: I,
  ): PoolShareEstimateReq {
    const message = createBasePoolShareEstimateReq();
    message.externalAsset =
      object.externalAsset !== undefined && object.externalAsset !== null
        ? Asset.fromPartial(object.externalAsset)
        : undefined;
    message.nativeAssetAmount = object.nativeAssetAmount ?? "";
    message.externalAssetAmount = object.externalAssetAmount ?? "";
    return message;
  },
};

function createBasePoolShareEstimateRes(): PoolShareEstimateRes {
  return {
    percentage: "",
    nativeAssetAmount: "",
    externalAssetAmount: "",
    swapInfo: undefined,
  };
}

export const PoolShareEstimateRes = {
  encode(
    message: PoolShareEstimateRes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.percentage !== "") {
      writer.uint32(10).string(message.percentage);
    }
    if (message.nativeAssetAmount !== "") {
      writer.uint32(18).string(message.nativeAssetAmount);
    }
    if (message.externalAssetAmount !== "") {
      writer.uint32(26).string(message.externalAssetAmount);
    }
    if (message.swapInfo !== undefined) {
      SwapInfo.encode(message.swapInfo, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): PoolShareEstimateRes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePoolShareEstimateRes();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.percentage = reader.string();
          break;
        case 2:
          message.nativeAssetAmount = reader.string();
          break;
        case 3:
          message.externalAssetAmount = reader.string();
          break;
        case 4:
          message.swapInfo = SwapInfo.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): PoolShareEstimateRes {
    return {
      percentage: isSet(object.percentage) ? String(object.percentage) : "",
      nativeAssetAmount: isSet(object.nativeAssetAmount)
        ? String(object.nativeAssetAmount)
        : "",
      externalAssetAmount: isSet(object.externalAssetAmount)
        ? String(object.externalAssetAmount)
        : "",
      swapInfo: isSet(object.swapInfo)
        ? SwapInfo.fromJSON(object.swapInfo)
        : undefined,
    };
  },

  toJSON(message: PoolShareEstimateRes): unknown {
    const obj: any = {};
    message.percentage !== undefined && (obj.percentage = message.percentage);
    message.nativeAssetAmount !== undefined &&
      (obj.nativeAssetAmount = message.nativeAssetAmount);
    message.externalAssetAmount !== undefined &&
      (obj.externalAssetAmount = message.externalAssetAmount);
    message.swapInfo !== undefined &&
      (obj.swapInfo = message.swapInfo
        ? SwapInfo.toJSON(message.swapInfo)
        : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<PoolShareEstimateRes>, I>>(
    object: I,
  ): PoolShareEstimateRes {
    const message = createBasePoolShareEstimateRes();
    message.percentage = object.percentage ?? "";
    message.nativeAssetAmount = object.nativeAssetAmount ?? "";
    message.externalAssetAmount = object.externalAssetAmount ?? "";
    message.swapInfo =
      object.swapInfo !== undefined && object.swapInfo !== null
        ? SwapInfo.fromPartial(object.swapInfo)
        : undefined;
    return message;
  },
};

function createBaseSwapInfo(): SwapInfo {
  return { status: 0, fee: "", feeRate: "", amount: "", result: "" };
}

export const SwapInfo = {
  encode(
    message: SwapInfo,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.status !== 0) {
      writer.uint32(8).int32(message.status);
    }
    if (message.fee !== "") {
      writer.uint32(18).string(message.fee);
    }
    if (message.feeRate !== "") {
      writer.uint32(26).string(message.feeRate);
    }
    if (message.amount !== "") {
      writer.uint32(34).string(message.amount);
    }
    if (message.result !== "") {
      writer.uint32(42).string(message.result);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SwapInfo {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSwapInfo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.status = reader.int32() as any;
          break;
        case 2:
          message.fee = reader.string();
          break;
        case 3:
          message.feeRate = reader.string();
          break;
        case 4:
          message.amount = reader.string();
          break;
        case 5:
          message.result = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): SwapInfo {
    return {
      status: isSet(object.status) ? swapStatusFromJSON(object.status) : 0,
      fee: isSet(object.fee) ? String(object.fee) : "",
      feeRate: isSet(object.feeRate) ? String(object.feeRate) : "",
      amount: isSet(object.amount) ? String(object.amount) : "",
      result: isSet(object.result) ? String(object.result) : "",
    };
  },

  toJSON(message: SwapInfo): unknown {
    const obj: any = {};
    message.status !== undefined &&
      (obj.status = swapStatusToJSON(message.status));
    message.fee !== undefined && (obj.fee = message.fee);
    message.feeRate !== undefined && (obj.feeRate = message.feeRate);
    message.amount !== undefined && (obj.amount = message.amount);
    message.result !== undefined && (obj.result = message.result);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<SwapInfo>, I>>(object: I): SwapInfo {
    const message = createBaseSwapInfo();
    message.status = object.status ?? 0;
    message.fee = object.fee ?? "";
    message.feeRate = object.feeRate ?? "";
    message.amount = object.amount ?? "";
    message.result = object.result ?? "";
    return message;
  },
};

export interface Query {
  GetPool(request: PoolReq): Promise<PoolRes>;
  GetPools(request: PoolsReq): Promise<PoolsRes>;
  GetLiquidityProvider(
    request: LiquidityProviderReq,
  ): Promise<LiquidityProviderRes>;
  GetLiquidityProviderData(
    request: LiquidityProviderDataReq,
  ): Promise<LiquidityProviderDataRes>;
  GetAssetList(request: AssetListReq): Promise<AssetListRes>;
  GetLiquidityProviders(
    request: LiquidityProvidersReq,
  ): Promise<LiquidityProvidersRes>;
  GetLiquidityProviderList(
    request: LiquidityProviderListReq,
  ): Promise<LiquidityProviderListRes>;
  GetParams(request: ParamsReq): Promise<ParamsRes>;
  GetRewardParams(request: RewardParamsReq): Promise<RewardParamsRes>;
  GetPmtpParams(request: PmtpParamsReq): Promise<PmtpParamsRes>;
  GetLiquidityProtectionParams(
    request: LiquidityProtectionParamsReq,
  ): Promise<LiquidityProtectionParamsRes>;
  GetProviderDistributionParams(
    request: ProviderDistributionParamsReq,
  ): Promise<ProviderDistributionParamsRes>;
  GetSwapFeeParams(request: SwapFeeParamsReq): Promise<SwapFeeParamsRes>;
  GetPoolShareEstimate(
    request: PoolShareEstimateReq,
  ): Promise<PoolShareEstimateRes>;
}

export class QueryClientImpl implements Query {
  private readonly rpc: Rpc;
  constructor(rpc: Rpc) {
    this.rpc = rpc;
    this.GetPool = this.GetPool.bind(this);
    this.GetPools = this.GetPools.bind(this);
    this.GetLiquidityProvider = this.GetLiquidityProvider.bind(this);
    this.GetLiquidityProviderData = this.GetLiquidityProviderData.bind(this);
    this.GetAssetList = this.GetAssetList.bind(this);
    this.GetLiquidityProviders = this.GetLiquidityProviders.bind(this);
    this.GetLiquidityProviderList = this.GetLiquidityProviderList.bind(this);
    this.GetParams = this.GetParams.bind(this);
    this.GetRewardParams = this.GetRewardParams.bind(this);
    this.GetPmtpParams = this.GetPmtpParams.bind(this);
    this.GetLiquidityProtectionParams =
      this.GetLiquidityProtectionParams.bind(this);
    this.GetProviderDistributionParams =
      this.GetProviderDistributionParams.bind(this);
    this.GetSwapFeeParams = this.GetSwapFeeParams.bind(this);
    this.GetPoolShareEstimate = this.GetPoolShareEstimate.bind(this);
  }
  GetPool(request: PoolReq): Promise<PoolRes> {
    const data = PoolReq.encode(request).finish();
    const promise = this.rpc.request("sifnode.clp.v1.Query", "GetPool", data);
    return promise.then((data) => PoolRes.decode(new _m0.Reader(data)));
  }

  GetPools(request: PoolsReq): Promise<PoolsRes> {
    const data = PoolsReq.encode(request).finish();
    const promise = this.rpc.request("sifnode.clp.v1.Query", "GetPools", data);
    return promise.then((data) => PoolsRes.decode(new _m0.Reader(data)));
  }

  GetLiquidityProvider(
    request: LiquidityProviderReq,
  ): Promise<LiquidityProviderRes> {
    const data = LiquidityProviderReq.encode(request).finish();
    const promise = this.rpc.request(
      "sifnode.clp.v1.Query",
      "GetLiquidityProvider",
      data,
    );
    return promise.then((data) =>
      LiquidityProviderRes.decode(new _m0.Reader(data)),
    );
  }

  GetLiquidityProviderData(
    request: LiquidityProviderDataReq,
  ): Promise<LiquidityProviderDataRes> {
    const data = LiquidityProviderDataReq.encode(request).finish();
    const promise = this.rpc.request(
      "sifnode.clp.v1.Query",
      "GetLiquidityProviderData",
      data,
    );
    return promise.then((data) =>
      LiquidityProviderDataRes.decode(new _m0.Reader(data)),
    );
  }

  GetAssetList(request: AssetListReq): Promise<AssetListRes> {
    const data = AssetListReq.encode(request).finish();
    const promise = this.rpc.request(
      "sifnode.clp.v1.Query",
      "GetAssetList",
      data,
    );
    return promise.then((data) => AssetListRes.decode(new _m0.Reader(data)));
  }

  GetLiquidityProviders(
    request: LiquidityProvidersReq,
  ): Promise<LiquidityProvidersRes> {
    const data = LiquidityProvidersReq.encode(request).finish();
    const promise = this.rpc.request(
      "sifnode.clp.v1.Query",
      "GetLiquidityProviders",
      data,
    );
    return promise.then((data) =>
      LiquidityProvidersRes.decode(new _m0.Reader(data)),
    );
  }

  GetLiquidityProviderList(
    request: LiquidityProviderListReq,
  ): Promise<LiquidityProviderListRes> {
    const data = LiquidityProviderListReq.encode(request).finish();
    const promise = this.rpc.request(
      "sifnode.clp.v1.Query",
      "GetLiquidityProviderList",
      data,
    );
    return promise.then((data) =>
      LiquidityProviderListRes.decode(new _m0.Reader(data)),
    );
  }

  GetParams(request: ParamsReq): Promise<ParamsRes> {
    const data = ParamsReq.encode(request).finish();
    const promise = this.rpc.request("sifnode.clp.v1.Query", "GetParams", data);
    return promise.then((data) => ParamsRes.decode(new _m0.Reader(data)));
  }

  GetRewardParams(request: RewardParamsReq): Promise<RewardParamsRes> {
    const data = RewardParamsReq.encode(request).finish();
    const promise = this.rpc.request(
      "sifnode.clp.v1.Query",
      "GetRewardParams",
      data,
    );
    return promise.then((data) => RewardParamsRes.decode(new _m0.Reader(data)));
  }

  GetPmtpParams(request: PmtpParamsReq): Promise<PmtpParamsRes> {
    const data = PmtpParamsReq.encode(request).finish();
    const promise = this.rpc.request(
      "sifnode.clp.v1.Query",
      "GetPmtpParams",
      data,
    );
    return promise.then((data) => PmtpParamsRes.decode(new _m0.Reader(data)));
  }

  GetLiquidityProtectionParams(
    request: LiquidityProtectionParamsReq,
  ): Promise<LiquidityProtectionParamsRes> {
    const data = LiquidityProtectionParamsReq.encode(request).finish();
    const promise = this.rpc.request(
      "sifnode.clp.v1.Query",
      "GetLiquidityProtectionParams",
      data,
    );
    return promise.then((data) =>
      LiquidityProtectionParamsRes.decode(new _m0.Reader(data)),
    );
  }

  GetProviderDistributionParams(
    request: ProviderDistributionParamsReq,
  ): Promise<ProviderDistributionParamsRes> {
    const data = ProviderDistributionParamsReq.encode(request).finish();
    const promise = this.rpc.request(
      "sifnode.clp.v1.Query",
      "GetProviderDistributionParams",
      data,
    );
    return promise.then((data) =>
      ProviderDistributionParamsRes.decode(new _m0.Reader(data)),
    );
  }

  GetSwapFeeParams(request: SwapFeeParamsReq): Promise<SwapFeeParamsRes> {
    const data = SwapFeeParamsReq.encode(request).finish();
    const promise = this.rpc.request(
      "sifnode.clp.v1.Query",
      "GetSwapFeeParams",
      data,
    );
    return promise.then((data) =>
      SwapFeeParamsRes.decode(new _m0.Reader(data)),
    );
  }

  GetPoolShareEstimate(
    request: PoolShareEstimateReq,
  ): Promise<PoolShareEstimateRes> {
    const data = PoolShareEstimateReq.encode(request).finish();
    const promise = this.rpc.request(
      "sifnode.clp.v1.Query",
      "GetPoolShareEstimate",
      data,
    );
    return promise.then((data) =>
      PoolShareEstimateRes.decode(new _m0.Reader(data)),
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
