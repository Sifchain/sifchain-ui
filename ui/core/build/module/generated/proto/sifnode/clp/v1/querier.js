/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";
import { Pool, LiquidityProvider, Asset, LiquidityProviderData, } from "../../../sifnode/clp/v1/types";
import { PageRequest, PageResponse, } from "../../../cosmos/base/query/v1beta1/pagination";
export const protobufPackage = "sifnode.clp.v1";
const basePoolReq = { symbol: "" };
export const PoolReq = {
    encode(message, writer = _m0.Writer.create()) {
        if (message.symbol !== "") {
            writer.uint32(10).string(message.symbol);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = Object.assign({}, basePoolReq);
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
    fromJSON(object) {
        const message = Object.assign({}, basePoolReq);
        if (object.symbol !== undefined && object.symbol !== null) {
            message.symbol = String(object.symbol);
        }
        else {
            message.symbol = "";
        }
        return message;
    },
    toJSON(message) {
        const obj = {};
        message.symbol !== undefined && (obj.symbol = message.symbol);
        return obj;
    },
    fromPartial(object) {
        const message = Object.assign({}, basePoolReq);
        if (object.symbol !== undefined && object.symbol !== null) {
            message.symbol = object.symbol;
        }
        else {
            message.symbol = "";
        }
        return message;
    },
};
const basePoolRes = { clpModuleAddress: "", height: Long.ZERO };
export const PoolRes = {
    encode(message, writer = _m0.Writer.create()) {
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
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = Object.assign({}, basePoolRes);
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
                    message.height = reader.int64();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        const message = Object.assign({}, basePoolRes);
        if (object.pool !== undefined && object.pool !== null) {
            message.pool = Pool.fromJSON(object.pool);
        }
        else {
            message.pool = undefined;
        }
        if (object.clpModuleAddress !== undefined &&
            object.clpModuleAddress !== null) {
            message.clpModuleAddress = String(object.clpModuleAddress);
        }
        else {
            message.clpModuleAddress = "";
        }
        if (object.height !== undefined && object.height !== null) {
            message.height = Long.fromString(object.height);
        }
        else {
            message.height = Long.ZERO;
        }
        return message;
    },
    toJSON(message) {
        const obj = {};
        message.pool !== undefined &&
            (obj.pool = message.pool ? Pool.toJSON(message.pool) : undefined);
        message.clpModuleAddress !== undefined &&
            (obj.clpModuleAddress = message.clpModuleAddress);
        message.height !== undefined &&
            (obj.height = (message.height || Long.ZERO).toString());
        return obj;
    },
    fromPartial(object) {
        const message = Object.assign({}, basePoolRes);
        if (object.pool !== undefined && object.pool !== null) {
            message.pool = Pool.fromPartial(object.pool);
        }
        else {
            message.pool = undefined;
        }
        if (object.clpModuleAddress !== undefined &&
            object.clpModuleAddress !== null) {
            message.clpModuleAddress = object.clpModuleAddress;
        }
        else {
            message.clpModuleAddress = "";
        }
        if (object.height !== undefined && object.height !== null) {
            message.height = object.height;
        }
        else {
            message.height = Long.ZERO;
        }
        return message;
    },
};
const basePoolsReq = {};
export const PoolsReq = {
    encode(message, writer = _m0.Writer.create()) {
        if (message.pagination !== undefined) {
            PageRequest.encode(message.pagination, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = Object.assign({}, basePoolsReq);
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
    fromJSON(object) {
        const message = Object.assign({}, basePoolsReq);
        if (object.pagination !== undefined && object.pagination !== null) {
            message.pagination = PageRequest.fromJSON(object.pagination);
        }
        else {
            message.pagination = undefined;
        }
        return message;
    },
    toJSON(message) {
        const obj = {};
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageRequest.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = Object.assign({}, basePoolsReq);
        if (object.pagination !== undefined && object.pagination !== null) {
            message.pagination = PageRequest.fromPartial(object.pagination);
        }
        else {
            message.pagination = undefined;
        }
        return message;
    },
};
const basePoolsRes = { clpModuleAddress: "", height: Long.ZERO };
export const PoolsRes = {
    encode(message, writer = _m0.Writer.create()) {
        for (const v of message.pools) {
            Pool.encode(v, writer.uint32(10).fork()).ldelim();
        }
        if (message.clpModuleAddress !== "") {
            writer.uint32(18).string(message.clpModuleAddress);
        }
        if (!message.height.isZero()) {
            writer.uint32(24).int64(message.height);
        }
        if (message.pagination !== undefined) {
            PageResponse.encode(message.pagination, writer.uint32(34).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = Object.assign({}, basePoolsRes);
        message.pools = [];
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
                    message.height = reader.int64();
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
    fromJSON(object) {
        const message = Object.assign({}, basePoolsRes);
        message.pools = [];
        if (object.pools !== undefined && object.pools !== null) {
            for (const e of object.pools) {
                message.pools.push(Pool.fromJSON(e));
            }
        }
        if (object.clpModuleAddress !== undefined &&
            object.clpModuleAddress !== null) {
            message.clpModuleAddress = String(object.clpModuleAddress);
        }
        else {
            message.clpModuleAddress = "";
        }
        if (object.height !== undefined && object.height !== null) {
            message.height = Long.fromString(object.height);
        }
        else {
            message.height = Long.ZERO;
        }
        if (object.pagination !== undefined && object.pagination !== null) {
            message.pagination = PageResponse.fromJSON(object.pagination);
        }
        else {
            message.pagination = undefined;
        }
        return message;
    },
    toJSON(message) {
        const obj = {};
        if (message.pools) {
            obj.pools = message.pools.map((e) => (e ? Pool.toJSON(e) : undefined));
        }
        else {
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
    fromPartial(object) {
        const message = Object.assign({}, basePoolsRes);
        message.pools = [];
        if (object.pools !== undefined && object.pools !== null) {
            for (const e of object.pools) {
                message.pools.push(Pool.fromPartial(e));
            }
        }
        if (object.clpModuleAddress !== undefined &&
            object.clpModuleAddress !== null) {
            message.clpModuleAddress = object.clpModuleAddress;
        }
        else {
            message.clpModuleAddress = "";
        }
        if (object.height !== undefined && object.height !== null) {
            message.height = object.height;
        }
        else {
            message.height = Long.ZERO;
        }
        if (object.pagination !== undefined && object.pagination !== null) {
            message.pagination = PageResponse.fromPartial(object.pagination);
        }
        else {
            message.pagination = undefined;
        }
        return message;
    },
};
const baseLiquidityProviderReq = { symbol: "", lpAddress: "" };
export const LiquidityProviderReq = {
    encode(message, writer = _m0.Writer.create()) {
        if (message.symbol !== "") {
            writer.uint32(10).string(message.symbol);
        }
        if (message.lpAddress !== "") {
            writer.uint32(18).string(message.lpAddress);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = Object.assign({}, baseLiquidityProviderReq);
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
    fromJSON(object) {
        const message = Object.assign({}, baseLiquidityProviderReq);
        if (object.symbol !== undefined && object.symbol !== null) {
            message.symbol = String(object.symbol);
        }
        else {
            message.symbol = "";
        }
        if (object.lpAddress !== undefined && object.lpAddress !== null) {
            message.lpAddress = String(object.lpAddress);
        }
        else {
            message.lpAddress = "";
        }
        return message;
    },
    toJSON(message) {
        const obj = {};
        message.symbol !== undefined && (obj.symbol = message.symbol);
        message.lpAddress !== undefined && (obj.lpAddress = message.lpAddress);
        return obj;
    },
    fromPartial(object) {
        const message = Object.assign({}, baseLiquidityProviderReq);
        if (object.symbol !== undefined && object.symbol !== null) {
            message.symbol = object.symbol;
        }
        else {
            message.symbol = "";
        }
        if (object.lpAddress !== undefined && object.lpAddress !== null) {
            message.lpAddress = object.lpAddress;
        }
        else {
            message.lpAddress = "";
        }
        return message;
    },
};
const baseLiquidityProviderRes = {
    nativeAssetBalance: "",
    externalAssetBalance: "",
    height: Long.ZERO,
};
export const LiquidityProviderRes = {
    encode(message, writer = _m0.Writer.create()) {
        if (message.liquidityProvider !== undefined) {
            LiquidityProvider.encode(message.liquidityProvider, writer.uint32(10).fork()).ldelim();
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
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = Object.assign({}, baseLiquidityProviderRes);
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.liquidityProvider = LiquidityProvider.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.nativeAssetBalance = reader.string();
                    break;
                case 3:
                    message.externalAssetBalance = reader.string();
                    break;
                case 4:
                    message.height = reader.int64();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        const message = Object.assign({}, baseLiquidityProviderRes);
        if (object.liquidityProvider !== undefined &&
            object.liquidityProvider !== null) {
            message.liquidityProvider = LiquidityProvider.fromJSON(object.liquidityProvider);
        }
        else {
            message.liquidityProvider = undefined;
        }
        if (object.nativeAssetBalance !== undefined &&
            object.nativeAssetBalance !== null) {
            message.nativeAssetBalance = String(object.nativeAssetBalance);
        }
        else {
            message.nativeAssetBalance = "";
        }
        if (object.externalAssetBalance !== undefined &&
            object.externalAssetBalance !== null) {
            message.externalAssetBalance = String(object.externalAssetBalance);
        }
        else {
            message.externalAssetBalance = "";
        }
        if (object.height !== undefined && object.height !== null) {
            message.height = Long.fromString(object.height);
        }
        else {
            message.height = Long.ZERO;
        }
        return message;
    },
    toJSON(message) {
        const obj = {};
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
    fromPartial(object) {
        const message = Object.assign({}, baseLiquidityProviderRes);
        if (object.liquidityProvider !== undefined &&
            object.liquidityProvider !== null) {
            message.liquidityProvider = LiquidityProvider.fromPartial(object.liquidityProvider);
        }
        else {
            message.liquidityProvider = undefined;
        }
        if (object.nativeAssetBalance !== undefined &&
            object.nativeAssetBalance !== null) {
            message.nativeAssetBalance = object.nativeAssetBalance;
        }
        else {
            message.nativeAssetBalance = "";
        }
        if (object.externalAssetBalance !== undefined &&
            object.externalAssetBalance !== null) {
            message.externalAssetBalance = object.externalAssetBalance;
        }
        else {
            message.externalAssetBalance = "";
        }
        if (object.height !== undefined && object.height !== null) {
            message.height = object.height;
        }
        else {
            message.height = Long.ZERO;
        }
        return message;
    },
};
const baseAssetListReq = { lpAddress: "" };
export const AssetListReq = {
    encode(message, writer = _m0.Writer.create()) {
        if (message.lpAddress !== "") {
            writer.uint32(10).string(message.lpAddress);
        }
        if (message.pagination !== undefined) {
            PageRequest.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = Object.assign({}, baseAssetListReq);
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
    fromJSON(object) {
        const message = Object.assign({}, baseAssetListReq);
        if (object.lpAddress !== undefined && object.lpAddress !== null) {
            message.lpAddress = String(object.lpAddress);
        }
        else {
            message.lpAddress = "";
        }
        if (object.pagination !== undefined && object.pagination !== null) {
            message.pagination = PageRequest.fromJSON(object.pagination);
        }
        else {
            message.pagination = undefined;
        }
        return message;
    },
    toJSON(message) {
        const obj = {};
        message.lpAddress !== undefined && (obj.lpAddress = message.lpAddress);
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageRequest.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = Object.assign({}, baseAssetListReq);
        if (object.lpAddress !== undefined && object.lpAddress !== null) {
            message.lpAddress = object.lpAddress;
        }
        else {
            message.lpAddress = "";
        }
        if (object.pagination !== undefined && object.pagination !== null) {
            message.pagination = PageRequest.fromPartial(object.pagination);
        }
        else {
            message.pagination = undefined;
        }
        return message;
    },
};
const baseAssetListRes = { height: Long.ZERO };
export const AssetListRes = {
    encode(message, writer = _m0.Writer.create()) {
        for (const v of message.assets) {
            Asset.encode(v, writer.uint32(10).fork()).ldelim();
        }
        if (!message.height.isZero()) {
            writer.uint32(16).int64(message.height);
        }
        if (message.pagination !== undefined) {
            PageResponse.encode(message.pagination, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = Object.assign({}, baseAssetListRes);
        message.assets = [];
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.assets.push(Asset.decode(reader, reader.uint32()));
                    break;
                case 2:
                    message.height = reader.int64();
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
    fromJSON(object) {
        const message = Object.assign({}, baseAssetListRes);
        message.assets = [];
        if (object.assets !== undefined && object.assets !== null) {
            for (const e of object.assets) {
                message.assets.push(Asset.fromJSON(e));
            }
        }
        if (object.height !== undefined && object.height !== null) {
            message.height = Long.fromString(object.height);
        }
        else {
            message.height = Long.ZERO;
        }
        if (object.pagination !== undefined && object.pagination !== null) {
            message.pagination = PageResponse.fromJSON(object.pagination);
        }
        else {
            message.pagination = undefined;
        }
        return message;
    },
    toJSON(message) {
        const obj = {};
        if (message.assets) {
            obj.assets = message.assets.map((e) => (e ? Asset.toJSON(e) : undefined));
        }
        else {
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
    fromPartial(object) {
        const message = Object.assign({}, baseAssetListRes);
        message.assets = [];
        if (object.assets !== undefined && object.assets !== null) {
            for (const e of object.assets) {
                message.assets.push(Asset.fromPartial(e));
            }
        }
        if (object.height !== undefined && object.height !== null) {
            message.height = object.height;
        }
        else {
            message.height = Long.ZERO;
        }
        if (object.pagination !== undefined && object.pagination !== null) {
            message.pagination = PageResponse.fromPartial(object.pagination);
        }
        else {
            message.pagination = undefined;
        }
        return message;
    },
};
const baseLiquidityProviderDataReq = { lpAddress: "" };
export const LiquidityProviderDataReq = {
    encode(message, writer = _m0.Writer.create()) {
        if (message.lpAddress !== "") {
            writer.uint32(10).string(message.lpAddress);
        }
        if (message.pagination !== undefined) {
            PageRequest.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = Object.assign({}, baseLiquidityProviderDataReq);
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
    fromJSON(object) {
        const message = Object.assign({}, baseLiquidityProviderDataReq);
        if (object.lpAddress !== undefined && object.lpAddress !== null) {
            message.lpAddress = String(object.lpAddress);
        }
        else {
            message.lpAddress = "";
        }
        if (object.pagination !== undefined && object.pagination !== null) {
            message.pagination = PageRequest.fromJSON(object.pagination);
        }
        else {
            message.pagination = undefined;
        }
        return message;
    },
    toJSON(message) {
        const obj = {};
        message.lpAddress !== undefined && (obj.lpAddress = message.lpAddress);
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageRequest.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = Object.assign({}, baseLiquidityProviderDataReq);
        if (object.lpAddress !== undefined && object.lpAddress !== null) {
            message.lpAddress = object.lpAddress;
        }
        else {
            message.lpAddress = "";
        }
        if (object.pagination !== undefined && object.pagination !== null) {
            message.pagination = PageRequest.fromPartial(object.pagination);
        }
        else {
            message.pagination = undefined;
        }
        return message;
    },
};
const baseLiquidityProviderDataRes = { height: Long.ZERO };
export const LiquidityProviderDataRes = {
    encode(message, writer = _m0.Writer.create()) {
        for (const v of message.liquidityProviderData) {
            LiquidityProviderData.encode(v, writer.uint32(10).fork()).ldelim();
        }
        if (!message.height.isZero()) {
            writer.uint32(16).int64(message.height);
        }
        if (message.pagination !== undefined) {
            PageRequest.encode(message.pagination, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = Object.assign({}, baseLiquidityProviderDataRes);
        message.liquidityProviderData = [];
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.liquidityProviderData.push(LiquidityProviderData.decode(reader, reader.uint32()));
                    break;
                case 2:
                    message.height = reader.int64();
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
    fromJSON(object) {
        const message = Object.assign({}, baseLiquidityProviderDataRes);
        message.liquidityProviderData = [];
        if (object.liquidityProviderData !== undefined &&
            object.liquidityProviderData !== null) {
            for (const e of object.liquidityProviderData) {
                message.liquidityProviderData.push(LiquidityProviderData.fromJSON(e));
            }
        }
        if (object.height !== undefined && object.height !== null) {
            message.height = Long.fromString(object.height);
        }
        else {
            message.height = Long.ZERO;
        }
        if (object.pagination !== undefined && object.pagination !== null) {
            message.pagination = PageRequest.fromJSON(object.pagination);
        }
        else {
            message.pagination = undefined;
        }
        return message;
    },
    toJSON(message) {
        const obj = {};
        if (message.liquidityProviderData) {
            obj.liquidityProviderData = message.liquidityProviderData.map((e) => e ? LiquidityProviderData.toJSON(e) : undefined);
        }
        else {
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
    fromPartial(object) {
        const message = Object.assign({}, baseLiquidityProviderDataRes);
        message.liquidityProviderData = [];
        if (object.liquidityProviderData !== undefined &&
            object.liquidityProviderData !== null) {
            for (const e of object.liquidityProviderData) {
                message.liquidityProviderData.push(LiquidityProviderData.fromPartial(e));
            }
        }
        if (object.height !== undefined && object.height !== null) {
            message.height = object.height;
        }
        else {
            message.height = Long.ZERO;
        }
        if (object.pagination !== undefined && object.pagination !== null) {
            message.pagination = PageRequest.fromPartial(object.pagination);
        }
        else {
            message.pagination = undefined;
        }
        return message;
    },
};
const baseLiquidityProviderListReq = { symbol: "" };
export const LiquidityProviderListReq = {
    encode(message, writer = _m0.Writer.create()) {
        if (message.symbol !== "") {
            writer.uint32(10).string(message.symbol);
        }
        if (message.pagination !== undefined) {
            PageRequest.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = Object.assign({}, baseLiquidityProviderListReq);
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
    fromJSON(object) {
        const message = Object.assign({}, baseLiquidityProviderListReq);
        if (object.symbol !== undefined && object.symbol !== null) {
            message.symbol = String(object.symbol);
        }
        else {
            message.symbol = "";
        }
        if (object.pagination !== undefined && object.pagination !== null) {
            message.pagination = PageRequest.fromJSON(object.pagination);
        }
        else {
            message.pagination = undefined;
        }
        return message;
    },
    toJSON(message) {
        const obj = {};
        message.symbol !== undefined && (obj.symbol = message.symbol);
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageRequest.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = Object.assign({}, baseLiquidityProviderListReq);
        if (object.symbol !== undefined && object.symbol !== null) {
            message.symbol = object.symbol;
        }
        else {
            message.symbol = "";
        }
        if (object.pagination !== undefined && object.pagination !== null) {
            message.pagination = PageRequest.fromPartial(object.pagination);
        }
        else {
            message.pagination = undefined;
        }
        return message;
    },
};
const baseLiquidityProviderListRes = { height: Long.ZERO };
export const LiquidityProviderListRes = {
    encode(message, writer = _m0.Writer.create()) {
        for (const v of message.liquidityProviders) {
            LiquidityProvider.encode(v, writer.uint32(10).fork()).ldelim();
        }
        if (!message.height.isZero()) {
            writer.uint32(16).int64(message.height);
        }
        if (message.pagination !== undefined) {
            PageResponse.encode(message.pagination, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = Object.assign({}, baseLiquidityProviderListRes);
        message.liquidityProviders = [];
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.liquidityProviders.push(LiquidityProvider.decode(reader, reader.uint32()));
                    break;
                case 2:
                    message.height = reader.int64();
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
    fromJSON(object) {
        const message = Object.assign({}, baseLiquidityProviderListRes);
        message.liquidityProviders = [];
        if (object.liquidityProviders !== undefined &&
            object.liquidityProviders !== null) {
            for (const e of object.liquidityProviders) {
                message.liquidityProviders.push(LiquidityProvider.fromJSON(e));
            }
        }
        if (object.height !== undefined && object.height !== null) {
            message.height = Long.fromString(object.height);
        }
        else {
            message.height = Long.ZERO;
        }
        if (object.pagination !== undefined && object.pagination !== null) {
            message.pagination = PageResponse.fromJSON(object.pagination);
        }
        else {
            message.pagination = undefined;
        }
        return message;
    },
    toJSON(message) {
        const obj = {};
        if (message.liquidityProviders) {
            obj.liquidityProviders = message.liquidityProviders.map((e) => e ? LiquidityProvider.toJSON(e) : undefined);
        }
        else {
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
    fromPartial(object) {
        const message = Object.assign({}, baseLiquidityProviderListRes);
        message.liquidityProviders = [];
        if (object.liquidityProviders !== undefined &&
            object.liquidityProviders !== null) {
            for (const e of object.liquidityProviders) {
                message.liquidityProviders.push(LiquidityProvider.fromPartial(e));
            }
        }
        if (object.height !== undefined && object.height !== null) {
            message.height = object.height;
        }
        else {
            message.height = Long.ZERO;
        }
        if (object.pagination !== undefined && object.pagination !== null) {
            message.pagination = PageResponse.fromPartial(object.pagination);
        }
        else {
            message.pagination = undefined;
        }
        return message;
    },
};
const baseLiquidityProvidersReq = {};
export const LiquidityProvidersReq = {
    encode(message, writer = _m0.Writer.create()) {
        if (message.pagination !== undefined) {
            PageRequest.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = Object.assign({}, baseLiquidityProvidersReq);
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
    fromJSON(object) {
        const message = Object.assign({}, baseLiquidityProvidersReq);
        if (object.pagination !== undefined && object.pagination !== null) {
            message.pagination = PageRequest.fromJSON(object.pagination);
        }
        else {
            message.pagination = undefined;
        }
        return message;
    },
    toJSON(message) {
        const obj = {};
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageRequest.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = Object.assign({}, baseLiquidityProvidersReq);
        if (object.pagination !== undefined && object.pagination !== null) {
            message.pagination = PageRequest.fromPartial(object.pagination);
        }
        else {
            message.pagination = undefined;
        }
        return message;
    },
};
const baseLiquidityProvidersRes = { height: Long.ZERO };
export const LiquidityProvidersRes = {
    encode(message, writer = _m0.Writer.create()) {
        for (const v of message.liquidityProviders) {
            LiquidityProvider.encode(v, writer.uint32(10).fork()).ldelim();
        }
        if (!message.height.isZero()) {
            writer.uint32(16).int64(message.height);
        }
        if (message.pagination !== undefined) {
            PageResponse.encode(message.pagination, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = Object.assign({}, baseLiquidityProvidersRes);
        message.liquidityProviders = [];
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.liquidityProviders.push(LiquidityProvider.decode(reader, reader.uint32()));
                    break;
                case 2:
                    message.height = reader.int64();
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
    fromJSON(object) {
        const message = Object.assign({}, baseLiquidityProvidersRes);
        message.liquidityProviders = [];
        if (object.liquidityProviders !== undefined &&
            object.liquidityProviders !== null) {
            for (const e of object.liquidityProviders) {
                message.liquidityProviders.push(LiquidityProvider.fromJSON(e));
            }
        }
        if (object.height !== undefined && object.height !== null) {
            message.height = Long.fromString(object.height);
        }
        else {
            message.height = Long.ZERO;
        }
        if (object.pagination !== undefined && object.pagination !== null) {
            message.pagination = PageResponse.fromJSON(object.pagination);
        }
        else {
            message.pagination = undefined;
        }
        return message;
    },
    toJSON(message) {
        const obj = {};
        if (message.liquidityProviders) {
            obj.liquidityProviders = message.liquidityProviders.map((e) => e ? LiquidityProvider.toJSON(e) : undefined);
        }
        else {
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
    fromPartial(object) {
        const message = Object.assign({}, baseLiquidityProvidersRes);
        message.liquidityProviders = [];
        if (object.liquidityProviders !== undefined &&
            object.liquidityProviders !== null) {
            for (const e of object.liquidityProviders) {
                message.liquidityProviders.push(LiquidityProvider.fromPartial(e));
            }
        }
        if (object.height !== undefined && object.height !== null) {
            message.height = object.height;
        }
        else {
            message.height = Long.ZERO;
        }
        if (object.pagination !== undefined && object.pagination !== null) {
            message.pagination = PageResponse.fromPartial(object.pagination);
        }
        else {
            message.pagination = undefined;
        }
        return message;
    },
};
export class QueryClientImpl {
    constructor(rpc) {
        this.rpc = rpc;
        this.GetPool = this.GetPool.bind(this);
        this.GetPools = this.GetPools.bind(this);
        this.GetLiquidityProvider = this.GetLiquidityProvider.bind(this);
        this.GetLiquidityProviderData = this.GetLiquidityProviderData.bind(this);
        this.GetAssetList = this.GetAssetList.bind(this);
        this.GetLiquidityProviders = this.GetLiquidityProviders.bind(this);
        this.GetLiquidityProviderList = this.GetLiquidityProviderList.bind(this);
    }
    GetPool(request) {
        const data = PoolReq.encode(request).finish();
        const promise = this.rpc.request("sifnode.clp.v1.Query", "GetPool", data);
        return promise.then((data) => PoolRes.decode(new _m0.Reader(data)));
    }
    GetPools(request) {
        const data = PoolsReq.encode(request).finish();
        const promise = this.rpc.request("sifnode.clp.v1.Query", "GetPools", data);
        return promise.then((data) => PoolsRes.decode(new _m0.Reader(data)));
    }
    GetLiquidityProvider(request) {
        const data = LiquidityProviderReq.encode(request).finish();
        const promise = this.rpc.request("sifnode.clp.v1.Query", "GetLiquidityProvider", data);
        return promise.then((data) => LiquidityProviderRes.decode(new _m0.Reader(data)));
    }
    GetLiquidityProviderData(request) {
        const data = LiquidityProviderDataReq.encode(request).finish();
        const promise = this.rpc.request("sifnode.clp.v1.Query", "GetLiquidityProviderData", data);
        return promise.then((data) => LiquidityProviderDataRes.decode(new _m0.Reader(data)));
    }
    GetAssetList(request) {
        const data = AssetListReq.encode(request).finish();
        const promise = this.rpc.request("sifnode.clp.v1.Query", "GetAssetList", data);
        return promise.then((data) => AssetListRes.decode(new _m0.Reader(data)));
    }
    GetLiquidityProviders(request) {
        const data = LiquidityProvidersReq.encode(request).finish();
        const promise = this.rpc.request("sifnode.clp.v1.Query", "GetLiquidityProviders", data);
        return promise.then((data) => LiquidityProvidersRes.decode(new _m0.Reader(data)));
    }
    GetLiquidityProviderList(request) {
        const data = LiquidityProviderListReq.encode(request).finish();
        const promise = this.rpc.request("sifnode.clp.v1.Query", "GetLiquidityProviderList", data);
        return promise.then((data) => LiquidityProviderListRes.decode(new _m0.Reader(data)));
    }
}
if (_m0.util.Long !== Long) {
    _m0.util.Long = Long;
    _m0.configure();
}
//# sourceMappingURL=querier.js.map