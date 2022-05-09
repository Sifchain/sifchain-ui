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
  swapPriceNative: string;
  swapPriceExternal: string;
  rewardPeriodNativeDistributed: string;
}

export interface LiquidityProvider {
  asset?: Asset;
  liquidityProviderUnits: string;
  liquidityProviderAddress: string;
  unlocks: LiquidityUnlock[];
}

export interface LiquidityUnlock {
  requestHeight: Long;
  units: string;
}

export interface PmtpEpoch {
  epochCounter: Long;
  blockCounter: Long;
}

export interface WhiteList {
  validatorList: string[];
}

export interface LiquidityProviderData {
  liquidityProvider?: LiquidityProvider;
  nativeAssetBalance: string;
  externalAssetBalance: string;
}

export interface EventPolicy {
  eventType: string;
  pmtpPeriodStartBlock: string;
  pmtpPeriodEndBlock: string;
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
    swapPriceNative: "",
    swapPriceExternal: "",
    rewardPeriodNativeDistributed: "",
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
    if (message.swapPriceNative !== "") {
      writer.uint32(42).string(message.swapPriceNative);
    }
    if (message.swapPriceExternal !== "") {
      writer.uint32(50).string(message.swapPriceExternal);
    }
    if (message.rewardPeriodNativeDistributed !== "") {
      writer.uint32(58).string(message.rewardPeriodNativeDistributed);
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
        case 5:
          message.swapPriceNative = reader.string();
          break;
        case 6:
          message.swapPriceExternal = reader.string();
          break;
        case 7:
          message.rewardPeriodNativeDistributed = reader.string();
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
      swapPriceNative: isSet(object.swapPriceNative)
        ? String(object.swapPriceNative)
        : "",
      swapPriceExternal: isSet(object.swapPriceExternal)
        ? String(object.swapPriceExternal)
        : "",
      rewardPeriodNativeDistributed: isSet(object.rewardPeriodNativeDistributed)
        ? String(object.rewardPeriodNativeDistributed)
        : "",
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
    message.swapPriceNative !== undefined &&
      (obj.swapPriceNative = message.swapPriceNative);
    message.swapPriceExternal !== undefined &&
      (obj.swapPriceExternal = message.swapPriceExternal);
    message.rewardPeriodNativeDistributed !== undefined &&
      (obj.rewardPeriodNativeDistributed =
        message.rewardPeriodNativeDistributed);
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
    message.swapPriceNative = object.swapPriceNative ?? "";
    message.swapPriceExternal = object.swapPriceExternal ?? "";
    message.rewardPeriodNativeDistributed =
      object.rewardPeriodNativeDistributed ?? "";
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
  return { requestHeight: Long.ZERO, units: "" };
}

export const LiquidityUnlock = {
  encode(
    message: LiquidityUnlock,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (!message.requestHeight.isZero()) {
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
          message.requestHeight = reader.int64() as Long;
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
        ? Long.fromString(object.requestHeight)
        : Long.ZERO,
      units: isSet(object.units) ? String(object.units) : "",
    };
  },

  toJSON(message: LiquidityUnlock): unknown {
    const obj: any = {};
    message.requestHeight !== undefined &&
      (obj.requestHeight = (message.requestHeight || Long.ZERO).toString());
    message.units !== undefined && (obj.units = message.units);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<LiquidityUnlock>, I>>(
    object: I,
  ): LiquidityUnlock {
    const message = createBaseLiquidityUnlock();
    message.requestHeight =
      object.requestHeight !== undefined && object.requestHeight !== null
        ? Long.fromValue(object.requestHeight)
        : Long.ZERO;
    message.units = object.units ?? "";
    return message;
  },
};

function createBasePmtpEpoch(): PmtpEpoch {
  return { epochCounter: Long.ZERO, blockCounter: Long.ZERO };
}

export const PmtpEpoch = {
  encode(
    message: PmtpEpoch,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (!message.epochCounter.isZero()) {
      writer.uint32(8).int64(message.epochCounter);
    }
    if (!message.blockCounter.isZero()) {
      writer.uint32(16).int64(message.blockCounter);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PmtpEpoch {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePmtpEpoch();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.epochCounter = reader.int64() as Long;
          break;
        case 2:
          message.blockCounter = reader.int64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): PmtpEpoch {
    return {
      epochCounter: isSet(object.epochCounter)
        ? Long.fromString(object.epochCounter)
        : Long.ZERO,
      blockCounter: isSet(object.blockCounter)
        ? Long.fromString(object.blockCounter)
        : Long.ZERO,
    };
  },

  toJSON(message: PmtpEpoch): unknown {
    const obj: any = {};
    message.epochCounter !== undefined &&
      (obj.epochCounter = (message.epochCounter || Long.ZERO).toString());
    message.blockCounter !== undefined &&
      (obj.blockCounter = (message.blockCounter || Long.ZERO).toString());
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<PmtpEpoch>, I>>(
    object: I,
  ): PmtpEpoch {
    const message = createBasePmtpEpoch();
    message.epochCounter =
      object.epochCounter !== undefined && object.epochCounter !== null
        ? Long.fromValue(object.epochCounter)
        : Long.ZERO;
    message.blockCounter =
      object.blockCounter !== undefined && object.blockCounter !== null
        ? Long.fromValue(object.blockCounter)
        : Long.ZERO;
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

function createBaseEventPolicy(): EventPolicy {
  return { eventType: "", pmtpPeriodStartBlock: "", pmtpPeriodEndBlock: "" };
}

export const EventPolicy = {
  encode(
    message: EventPolicy,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.eventType !== "") {
      writer.uint32(10).string(message.eventType);
    }
    if (message.pmtpPeriodStartBlock !== "") {
      writer.uint32(18).string(message.pmtpPeriodStartBlock);
    }
    if (message.pmtpPeriodEndBlock !== "") {
      writer.uint32(26).string(message.pmtpPeriodEndBlock);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EventPolicy {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventPolicy();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.eventType = reader.string();
          break;
        case 2:
          message.pmtpPeriodStartBlock = reader.string();
          break;
        case 3:
          message.pmtpPeriodEndBlock = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): EventPolicy {
    return {
      eventType: isSet(object.eventType) ? String(object.eventType) : "",
      pmtpPeriodStartBlock: isSet(object.pmtpPeriodStartBlock)
        ? String(object.pmtpPeriodStartBlock)
        : "",
      pmtpPeriodEndBlock: isSet(object.pmtpPeriodEndBlock)
        ? String(object.pmtpPeriodEndBlock)
        : "",
    };
  },

  toJSON(message: EventPolicy): unknown {
    const obj: any = {};
    message.eventType !== undefined && (obj.eventType = message.eventType);
    message.pmtpPeriodStartBlock !== undefined &&
      (obj.pmtpPeriodStartBlock = message.pmtpPeriodStartBlock);
    message.pmtpPeriodEndBlock !== undefined &&
      (obj.pmtpPeriodEndBlock = message.pmtpPeriodEndBlock);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<EventPolicy>, I>>(
    object: I,
  ): EventPolicy {
    const message = createBaseEventPolicy();
    message.eventType = object.eventType ?? "";
    message.pmtpPeriodStartBlock = object.pmtpPeriodStartBlock ?? "";
    message.pmtpPeriodEndBlock = object.pmtpPeriodEndBlock ?? "";
    return message;
  },
};

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
