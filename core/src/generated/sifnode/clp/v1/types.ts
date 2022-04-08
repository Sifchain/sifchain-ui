/* eslint-disable */
import Long from "long";
import * as _m0 from "protobufjs/minimal";

export const protobufPackage = "sifnode.clp.v1";

export interface Asset {
  symbol: string;
}

export interface Pool {
  externalAsset?: Asset;
  nativeAssetBalance: string;
  externalAssetBalance: string;
  poolUnits: string;
}

export interface LiquidityProvider {
  asset?: Asset;
  liquidityProviderUnits: string;
  liquidityProviderAddress: string;
  unlocks: LiquidityUnlock[];
}

export interface LiquidityUnlock {
  requestHeight: number;
  units: string;
}

export interface WhiteList {
  validatorList: string[];
}

export interface LiquidityProviderData {
  liquidityProvider?: LiquidityProvider;
  nativeAssetBalance: string;
  externalAssetBalance: string;
}

function createBaseAsset(): Asset {
  return { symbol: "" };
}

export const Asset = {
  encode(message: Asset, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.symbol !== "") {
      writer.uint32(10).string(message.symbol);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Asset {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAsset();
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

  fromJSON(object: any): Asset {
    return {
      symbol: isSet(object.symbol) ? String(object.symbol) : "",
    };
  },

  toJSON(message: Asset): unknown {
    const obj: any = {};
    message.symbol !== undefined && (obj.symbol = message.symbol);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<Asset>, I>>(object: I): Asset {
    const message = createBaseAsset();
    message.symbol = object.symbol ?? "";
    return message;
  },
};

function createBasePool(): Pool {
  return {
    externalAsset: undefined,
    nativeAssetBalance: "",
    externalAssetBalance: "",
    poolUnits: "",
  };
}

export const Pool = {
  encode(message: Pool, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.externalAsset !== undefined) {
      Asset.encode(message.externalAsset, writer.uint32(10).fork()).ldelim();
    }
    if (message.nativeAssetBalance !== "") {
      writer.uint32(18).string(message.nativeAssetBalance);
    }
    if (message.externalAssetBalance !== "") {
      writer.uint32(26).string(message.externalAssetBalance);
    }
    if (message.poolUnits !== "") {
      writer.uint32(34).string(message.poolUnits);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Pool {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePool();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.externalAsset = Asset.decode(reader, reader.uint32());
          break;
        case 2:
          message.nativeAssetBalance = reader.string();
          break;
        case 3:
          message.externalAssetBalance = reader.string();
          break;
        case 4:
          message.poolUnits = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Pool {
    return {
      externalAsset: isSet(object.externalAsset)
        ? Asset.fromJSON(object.externalAsset)
        : undefined,
      nativeAssetBalance: isSet(object.nativeAssetBalance)
        ? String(object.nativeAssetBalance)
        : "",
      externalAssetBalance: isSet(object.externalAssetBalance)
        ? String(object.externalAssetBalance)
        : "",
      poolUnits: isSet(object.poolUnits) ? String(object.poolUnits) : "",
    };
  },

  toJSON(message: Pool): unknown {
    const obj: any = {};
    message.externalAsset !== undefined &&
      (obj.externalAsset = message.externalAsset
        ? Asset.toJSON(message.externalAsset)
        : undefined);
    message.nativeAssetBalance !== undefined &&
      (obj.nativeAssetBalance = message.nativeAssetBalance);
    message.externalAssetBalance !== undefined &&
      (obj.externalAssetBalance = message.externalAssetBalance);
    message.poolUnits !== undefined && (obj.poolUnits = message.poolUnits);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<Pool>, I>>(object: I): Pool {
    const message = createBasePool();
    message.externalAsset =
      object.externalAsset !== undefined && object.externalAsset !== null
        ? Asset.fromPartial(object.externalAsset)
        : undefined;
    message.nativeAssetBalance = object.nativeAssetBalance ?? "";
    message.externalAssetBalance = object.externalAssetBalance ?? "";
    message.poolUnits = object.poolUnits ?? "";
    return message;
  },
};

function createBaseLiquidityProvider(): LiquidityProvider {
  return {
    asset: undefined,
    liquidityProviderUnits: "",
    liquidityProviderAddress: "",
    unlocks: [],
  };
}

export const LiquidityProvider = {
  encode(
    message: LiquidityProvider,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.asset !== undefined) {
      Asset.encode(message.asset, writer.uint32(10).fork()).ldelim();
    }
    if (message.liquidityProviderUnits !== "") {
      writer.uint32(18).string(message.liquidityProviderUnits);
    }
    if (message.liquidityProviderAddress !== "") {
      writer.uint32(26).string(message.liquidityProviderAddress);
    }
    for (const v of message.unlocks) {
      LiquidityUnlock.encode(v!, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): LiquidityProvider {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLiquidityProvider();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.asset = Asset.decode(reader, reader.uint32());
          break;
        case 2:
          message.liquidityProviderUnits = reader.string();
          break;
        case 3:
          message.liquidityProviderAddress = reader.string();
          break;
        case 4:
          message.unlocks.push(LiquidityUnlock.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): LiquidityProvider {
    return {
      asset: isSet(object.asset) ? Asset.fromJSON(object.asset) : undefined,
      liquidityProviderUnits: isSet(object.liquidityProviderUnits)
        ? String(object.liquidityProviderUnits)
        : "",
      liquidityProviderAddress: isSet(object.liquidityProviderAddress)
        ? String(object.liquidityProviderAddress)
        : "",
      unlocks: Array.isArray(object?.unlocks)
        ? object.unlocks.map((e: any) => LiquidityUnlock.fromJSON(e))
        : [],
    };
  },

  toJSON(message: LiquidityProvider): unknown {
    const obj: any = {};
    message.asset !== undefined &&
      (obj.asset = message.asset ? Asset.toJSON(message.asset) : undefined);
    message.liquidityProviderUnits !== undefined &&
      (obj.liquidityProviderUnits = message.liquidityProviderUnits);
    message.liquidityProviderAddress !== undefined &&
      (obj.liquidityProviderAddress = message.liquidityProviderAddress);
    if (message.unlocks) {
      obj.unlocks = message.unlocks.map((e) =>
        e ? LiquidityUnlock.toJSON(e) : undefined,
      );
    } else {
      obj.unlocks = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<LiquidityProvider>, I>>(
    object: I,
  ): LiquidityProvider {
    const message = createBaseLiquidityProvider();
    message.asset =
      object.asset !== undefined && object.asset !== null
        ? Asset.fromPartial(object.asset)
        : undefined;
    message.liquidityProviderUnits = object.liquidityProviderUnits ?? "";
    message.liquidityProviderAddress = object.liquidityProviderAddress ?? "";
    message.unlocks =
      object.unlocks?.map((e) => LiquidityUnlock.fromPartial(e)) || [];
    return message;
  },
};

function createBaseLiquidityUnlock(): LiquidityUnlock {
  return { requestHeight: 0, units: "" };
}

export const LiquidityUnlock = {
  encode(
    message: LiquidityUnlock,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.requestHeight !== 0) {
      writer.uint32(8).int64(message.requestHeight);
    }
    if (message.units !== "") {
      writer.uint32(18).string(message.units);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): LiquidityUnlock {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLiquidityUnlock();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.requestHeight = longToNumber(reader.int64() as Long);
          break;
        case 2:
          message.units = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): LiquidityUnlock {
    return {
      requestHeight: isSet(object.requestHeight)
        ? Number(object.requestHeight)
        : 0,
      units: isSet(object.units) ? String(object.units) : "",
    };
  },

  toJSON(message: LiquidityUnlock): unknown {
    const obj: any = {};
    message.requestHeight !== undefined &&
      (obj.requestHeight = Math.round(message.requestHeight));
    message.units !== undefined && (obj.units = message.units);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<LiquidityUnlock>, I>>(
    object: I,
  ): LiquidityUnlock {
    const message = createBaseLiquidityUnlock();
    message.requestHeight = object.requestHeight ?? 0;
    message.units = object.units ?? "";
    return message;
  },
};

function createBaseWhiteList(): WhiteList {
  return { validatorList: [] };
}

export const WhiteList = {
  encode(
    message: WhiteList,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    for (const v of message.validatorList) {
      writer.uint32(10).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): WhiteList {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseWhiteList();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.validatorList.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): WhiteList {
    return {
      validatorList: Array.isArray(object?.validatorList)
        ? object.validatorList.map((e: any) => String(e))
        : [],
    };
  },

  toJSON(message: WhiteList): unknown {
    const obj: any = {};
    if (message.validatorList) {
      obj.validatorList = message.validatorList.map((e) => e);
    } else {
      obj.validatorList = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<WhiteList>, I>>(
    object: I,
  ): WhiteList {
    const message = createBaseWhiteList();
    message.validatorList = object.validatorList?.map((e) => e) || [];
    return message;
  },
};

function createBaseLiquidityProviderData(): LiquidityProviderData {
  return {
    liquidityProvider: undefined,
    nativeAssetBalance: "",
    externalAssetBalance: "",
  };
}

export const LiquidityProviderData = {
  encode(
    message: LiquidityProviderData,
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
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): LiquidityProviderData {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLiquidityProviderData();
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
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): LiquidityProviderData {
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
    };
  },

  toJSON(message: LiquidityProviderData): unknown {
    const obj: any = {};
    message.liquidityProvider !== undefined &&
      (obj.liquidityProvider = message.liquidityProvider
        ? LiquidityProvider.toJSON(message.liquidityProvider)
        : undefined);
    message.nativeAssetBalance !== undefined &&
      (obj.nativeAssetBalance = message.nativeAssetBalance);
    message.externalAssetBalance !== undefined &&
      (obj.externalAssetBalance = message.externalAssetBalance);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<LiquidityProviderData>, I>>(
    object: I,
  ): LiquidityProviderData {
    const message = createBaseLiquidityProviderData();
    message.liquidityProvider =
      object.liquidityProvider !== undefined &&
      object.liquidityProvider !== null
        ? LiquidityProvider.fromPartial(object.liquidityProvider)
        : undefined;
    message.nativeAssetBalance = object.nativeAssetBalance ?? "";
    message.externalAssetBalance = object.externalAssetBalance ?? "";
    return message;
  },
};

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
