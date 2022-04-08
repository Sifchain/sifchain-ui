/* eslint-disable */
import Long from "long";
import * as _m0 from "protobufjs/minimal";
import {
  Pool,
  LiquidityProvider,
  Asset,
  LiquidityProviderData,
} from "../../../sifnode/clp/v1/types";
import {
  PageRequest,
  PageResponse,
} from "../../../cosmos/base/query/v1beta1/pagination";
import { Params } from "../../../sifnode/clp/v1/params";

export const protobufPackage = "sifnode.clp.v1";

export interface PoolReq {
  symbol: string;
}

export interface PoolRes {
  pool?: Pool;
  clpModuleAddress: string;
  height: number;
}

export interface PoolsReq {
  pagination?: PageRequest;
}

export interface PoolsRes {
  pools: Pool[];
  clpModuleAddress: string;
  height: number;
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
  height: number;
}

export interface AssetListReq {
  lpAddress: string;
  pagination?: PageRequest;
}

export interface AssetListRes {
  assets: Asset[];
  height: number;
  pagination?: PageResponse;
}

export interface LiquidityProviderDataReq {
  lpAddress: string;
  pagination?: PageRequest;
}

export interface LiquidityProviderDataRes {
  liquidityProviderData: LiquidityProviderData[];
  height: number;
  pagination?: PageRequest;
}

export interface LiquidityProviderListReq {
  symbol: string;
  /** pagination defines an optional pagination for the request. */
  pagination?: PageRequest;
}

export interface LiquidityProviderListRes {
  liquidityProviders: LiquidityProvider[];
  height: number;
  /** pagination defines the pagination in the response. */
  pagination?: PageResponse;
}

export interface LiquidityProvidersReq {
  pagination?: PageRequest;
}

export interface LiquidityProvidersRes {
  liquidityProviders: LiquidityProvider[];
  height: number;
  pagination?: PageResponse;
}

export interface ParamsReq {}

export interface ParamsRes {
  params?: Params;
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
  return { pool: undefined, clpModuleAddress: "", height: 0 };
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
    if (message.height !== 0) {
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
          message.height = longToNumber(reader.int64() as Long);
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
      height: isSet(object.height) ? Number(object.height) : 0,
    };
  },

  toJSON(message: PoolRes): unknown {
    const obj: any = {};
    message.pool !== undefined &&
      (obj.pool = message.pool ? Pool.toJSON(message.pool) : undefined);
    message.clpModuleAddress !== undefined &&
      (obj.clpModuleAddress = message.clpModuleAddress);
    message.height !== undefined && (obj.height = Math.round(message.height));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<PoolRes>, I>>(object: I): PoolRes {
    const message = createBasePoolRes();
    message.pool =
      object.pool !== undefined && object.pool !== null
        ? Pool.fromPartial(object.pool)
        : undefined;
    message.clpModuleAddress = object.clpModuleAddress ?? "";
    message.height = object.height ?? 0;
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
  return { pools: [], clpModuleAddress: "", height: 0, pagination: undefined };
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
    if (message.height !== 0) {
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
          message.height = longToNumber(reader.int64() as Long);
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
      height: isSet(object.height) ? Number(object.height) : 0,
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
    message.height !== undefined && (obj.height = Math.round(message.height));
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
    message.height = object.height ?? 0;
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
    height: 0,
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
    if (message.height !== 0) {
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
          message.height = longToNumber(reader.int64() as Long);
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
      height: isSet(object.height) ? Number(object.height) : 0,
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
    message.height !== undefined && (obj.height = Math.round(message.height));
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
    message.height = object.height ?? 0;
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
  return { assets: [], height: 0, pagination: undefined };
}

export const AssetListRes = {
  encode(
    message: AssetListRes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    for (const v of message.assets) {
      Asset.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.height !== 0) {
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
          message.height = longToNumber(reader.int64() as Long);
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
      height: isSet(object.height) ? Number(object.height) : 0,
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
    message.height !== undefined && (obj.height = Math.round(message.height));
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
    message.height = object.height ?? 0;
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
  return { liquidityProviderData: [], height: 0, pagination: undefined };
}

export const LiquidityProviderDataRes = {
  encode(
    message: LiquidityProviderDataRes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    for (const v of message.liquidityProviderData) {
      LiquidityProviderData.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.height !== 0) {
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
          message.height = longToNumber(reader.int64() as Long);
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
      height: isSet(object.height) ? Number(object.height) : 0,
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
    message.height !== undefined && (obj.height = Math.round(message.height));
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
    message.height = object.height ?? 0;
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
  return { liquidityProviders: [], height: 0, pagination: undefined };
}

export const LiquidityProviderListRes = {
  encode(
    message: LiquidityProviderListRes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    for (const v of message.liquidityProviders) {
      LiquidityProvider.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.height !== 0) {
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
          message.height = longToNumber(reader.int64() as Long);
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
      height: isSet(object.height) ? Number(object.height) : 0,
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
    message.height !== undefined && (obj.height = Math.round(message.height));
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
    message.height = object.height ?? 0;
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
  return { liquidityProviders: [], height: 0, pagination: undefined };
}

export const LiquidityProvidersRes = {
  encode(
    message: LiquidityProvidersRes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    for (const v of message.liquidityProviders) {
      LiquidityProvider.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.height !== 0) {
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
          message.height = longToNumber(reader.int64() as Long);
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
      height: isSet(object.height) ? Number(object.height) : 0,
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
    message.height !== undefined && (obj.height = Math.round(message.height));
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
    message.height = object.height ?? 0;
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
  return { params: undefined };
}

export const ParamsRes = {
  encode(
    message: ParamsRes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.params !== undefined) {
      Params.encode(message.params, writer.uint32(10).fork()).ldelim();
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
    };
  },

  toJSON(message: ParamsRes): unknown {
    const obj: any = {};
    message.params !== undefined &&
      (obj.params = message.params ? Params.toJSON(message.params) : undefined);
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
