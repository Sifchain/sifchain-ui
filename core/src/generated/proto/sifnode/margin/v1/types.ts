/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";

export const protobufPackage = "sifnode.margin.v1";

export enum Position {
  UNSPECIFIED = 0,
  LONG = 1,
  SHORT = 2,
  UNRECOGNIZED = -1,
}

export function positionFromJSON(object: any): Position {
  switch (object) {
    case 0:
    case "UNSPECIFIED":
      return Position.UNSPECIFIED;
    case 1:
    case "LONG":
      return Position.LONG;
    case 2:
    case "SHORT":
      return Position.SHORT;
    case -1:
    case "UNRECOGNIZED":
    default:
      return Position.UNRECOGNIZED;
  }
}

export function positionToJSON(object: Position): string {
  switch (object) {
    case Position.UNSPECIFIED:
      return "UNSPECIFIED";
    case Position.LONG:
      return "LONG";
    case Position.SHORT:
      return "SHORT";
    case Position.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface GenesisState {
  params?: Params;
}

export interface Params {
  leverageMax: string;
  interestRateMax: string;
  interestRateMin: string;
  interestRateIncrease: string;
  interestRateDecrease: string;
  healthGainFactor: string;
  epochLength: Long;
  pools: string[];
  removalQueueThreshold: string;
  maxOpenPositions: Long;
  poolOpenThreshold: string;
  forceCloseFundPercentage: string;
  forceCloseFundAddress: string;
  incrementalInterestPaymentFundPercentage: string;
  incrementalInterestPaymentFundAddress: string;
  sqModifier: string;
  safetyFactor: string;
  closedPools: string[];
  incrementalInterestPaymentEnabled: boolean;
  whitelistingEnabled: boolean;
  rowanCollateralEnabled: boolean;
}

export interface MTP {
  address: string;
  collateralAsset: string;
  collateralAmount: string;
  liabilities: string;
  interestPaidCollateral: string;
  interestPaidCustody: string;
  interestUnpaidCollateral: string;
  custodyAsset: string;
  custodyAmount: string;
  leverage: string;
  mtpHealth: string;
  position: Position;
  id: Long;
}

function createBaseGenesisState(): GenesisState {
  return { params: undefined };
}

export const GenesisState = {
  encode(
    message: GenesisState,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.params !== undefined) {
      Params.encode(message.params, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GenesisState {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGenesisState();
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

  fromJSON(object: any): GenesisState {
    return {
      params: isSet(object.params) ? Params.fromJSON(object.params) : undefined,
    };
  },

  toJSON(message: GenesisState): unknown {
    const obj: any = {};
    message.params !== undefined &&
      (obj.params = message.params ? Params.toJSON(message.params) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<GenesisState>, I>>(
    object: I,
  ): GenesisState {
    const message = createBaseGenesisState();
    message.params =
      object.params !== undefined && object.params !== null
        ? Params.fromPartial(object.params)
        : undefined;
    return message;
  },
};

function createBaseParams(): Params {
  return {
    leverageMax: "",
    interestRateMax: "",
    interestRateMin: "",
    interestRateIncrease: "",
    interestRateDecrease: "",
    healthGainFactor: "",
    epochLength: Long.ZERO,
    pools: [],
    removalQueueThreshold: "",
    maxOpenPositions: Long.UZERO,
    poolOpenThreshold: "",
    forceCloseFundPercentage: "",
    forceCloseFundAddress: "",
    incrementalInterestPaymentFundPercentage: "",
    incrementalInterestPaymentFundAddress: "",
    sqModifier: "",
    safetyFactor: "",
    closedPools: [],
    incrementalInterestPaymentEnabled: false,
    whitelistingEnabled: false,
    rowanCollateralEnabled: false,
  };
}

export const Params = {
  encode(
    message: Params,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.leverageMax !== "") {
      writer.uint32(10).string(message.leverageMax);
    }
    if (message.interestRateMax !== "") {
      writer.uint32(18).string(message.interestRateMax);
    }
    if (message.interestRateMin !== "") {
      writer.uint32(26).string(message.interestRateMin);
    }
    if (message.interestRateIncrease !== "") {
      writer.uint32(34).string(message.interestRateIncrease);
    }
    if (message.interestRateDecrease !== "") {
      writer.uint32(42).string(message.interestRateDecrease);
    }
    if (message.healthGainFactor !== "") {
      writer.uint32(50).string(message.healthGainFactor);
    }
    if (!message.epochLength.isZero()) {
      writer.uint32(56).int64(message.epochLength);
    }
    for (const v of message.pools) {
      writer.uint32(66).string(v!);
    }
    if (message.removalQueueThreshold !== "") {
      writer.uint32(82).string(message.removalQueueThreshold);
    }
    if (!message.maxOpenPositions.isZero()) {
      writer.uint32(88).uint64(message.maxOpenPositions);
    }
    if (message.poolOpenThreshold !== "") {
      writer.uint32(98).string(message.poolOpenThreshold);
    }
    if (message.forceCloseFundPercentage !== "") {
      writer.uint32(106).string(message.forceCloseFundPercentage);
    }
    if (message.forceCloseFundAddress !== "") {
      writer.uint32(114).string(message.forceCloseFundAddress);
    }
    if (message.incrementalInterestPaymentFundPercentage !== "") {
      writer
        .uint32(122)
        .string(message.incrementalInterestPaymentFundPercentage);
    }
    if (message.incrementalInterestPaymentFundAddress !== "") {
      writer.uint32(130).string(message.incrementalInterestPaymentFundAddress);
    }
    if (message.sqModifier !== "") {
      writer.uint32(138).string(message.sqModifier);
    }
    if (message.safetyFactor !== "") {
      writer.uint32(146).string(message.safetyFactor);
    }
    for (const v of message.closedPools) {
      writer.uint32(154).string(v!);
    }
    if (message.incrementalInterestPaymentEnabled === true) {
      writer.uint32(160).bool(message.incrementalInterestPaymentEnabled);
    }
    if (message.whitelistingEnabled === true) {
      writer.uint32(168).bool(message.whitelistingEnabled);
    }
    if (message.rowanCollateralEnabled === true) {
      writer.uint32(176).bool(message.rowanCollateralEnabled);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Params {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseParams();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.leverageMax = reader.string();
          break;
        case 2:
          message.interestRateMax = reader.string();
          break;
        case 3:
          message.interestRateMin = reader.string();
          break;
        case 4:
          message.interestRateIncrease = reader.string();
          break;
        case 5:
          message.interestRateDecrease = reader.string();
          break;
        case 6:
          message.healthGainFactor = reader.string();
          break;
        case 7:
          message.epochLength = reader.int64() as Long;
          break;
        case 8:
          message.pools.push(reader.string());
          break;
        case 10:
          message.removalQueueThreshold = reader.string();
          break;
        case 11:
          message.maxOpenPositions = reader.uint64() as Long;
          break;
        case 12:
          message.poolOpenThreshold = reader.string();
          break;
        case 13:
          message.forceCloseFundPercentage = reader.string();
          break;
        case 14:
          message.forceCloseFundAddress = reader.string();
          break;
        case 15:
          message.incrementalInterestPaymentFundPercentage = reader.string();
          break;
        case 16:
          message.incrementalInterestPaymentFundAddress = reader.string();
          break;
        case 17:
          message.sqModifier = reader.string();
          break;
        case 18:
          message.safetyFactor = reader.string();
          break;
        case 19:
          message.closedPools.push(reader.string());
          break;
        case 20:
          message.incrementalInterestPaymentEnabled = reader.bool();
          break;
        case 21:
          message.whitelistingEnabled = reader.bool();
          break;
        case 22:
          message.rowanCollateralEnabled = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Params {
    return {
      leverageMax: isSet(object.leverageMax) ? String(object.leverageMax) : "",
      interestRateMax: isSet(object.interestRateMax)
        ? String(object.interestRateMax)
        : "",
      interestRateMin: isSet(object.interestRateMin)
        ? String(object.interestRateMin)
        : "",
      interestRateIncrease: isSet(object.interestRateIncrease)
        ? String(object.interestRateIncrease)
        : "",
      interestRateDecrease: isSet(object.interestRateDecrease)
        ? String(object.interestRateDecrease)
        : "",
      healthGainFactor: isSet(object.healthGainFactor)
        ? String(object.healthGainFactor)
        : "",
      epochLength: isSet(object.epochLength)
        ? Long.fromValue(object.epochLength)
        : Long.ZERO,
      pools: Array.isArray(object?.pools)
        ? object.pools.map((e: any) => String(e))
        : [],
      removalQueueThreshold: isSet(object.removalQueueThreshold)
        ? String(object.removalQueueThreshold)
        : "",
      maxOpenPositions: isSet(object.maxOpenPositions)
        ? Long.fromValue(object.maxOpenPositions)
        : Long.UZERO,
      poolOpenThreshold: isSet(object.poolOpenThreshold)
        ? String(object.poolOpenThreshold)
        : "",
      forceCloseFundPercentage: isSet(object.forceCloseFundPercentage)
        ? String(object.forceCloseFundPercentage)
        : "",
      forceCloseFundAddress: isSet(object.forceCloseFundAddress)
        ? String(object.forceCloseFundAddress)
        : "",
      incrementalInterestPaymentFundPercentage: isSet(
        object.incrementalInterestPaymentFundPercentage,
      )
        ? String(object.incrementalInterestPaymentFundPercentage)
        : "",
      incrementalInterestPaymentFundAddress: isSet(
        object.incrementalInterestPaymentFundAddress,
      )
        ? String(object.incrementalInterestPaymentFundAddress)
        : "",
      sqModifier: isSet(object.sqModifier) ? String(object.sqModifier) : "",
      safetyFactor: isSet(object.safetyFactor)
        ? String(object.safetyFactor)
        : "",
      closedPools: Array.isArray(object?.closedPools)
        ? object.closedPools.map((e: any) => String(e))
        : [],
      incrementalInterestPaymentEnabled: isSet(
        object.incrementalInterestPaymentEnabled,
      )
        ? Boolean(object.incrementalInterestPaymentEnabled)
        : false,
      whitelistingEnabled: isSet(object.whitelistingEnabled)
        ? Boolean(object.whitelistingEnabled)
        : false,
      rowanCollateralEnabled: isSet(object.rowanCollateralEnabled)
        ? Boolean(object.rowanCollateralEnabled)
        : false,
    };
  },

  toJSON(message: Params): unknown {
    const obj: any = {};
    message.leverageMax !== undefined &&
      (obj.leverageMax = message.leverageMax);
    message.interestRateMax !== undefined &&
      (obj.interestRateMax = message.interestRateMax);
    message.interestRateMin !== undefined &&
      (obj.interestRateMin = message.interestRateMin);
    message.interestRateIncrease !== undefined &&
      (obj.interestRateIncrease = message.interestRateIncrease);
    message.interestRateDecrease !== undefined &&
      (obj.interestRateDecrease = message.interestRateDecrease);
    message.healthGainFactor !== undefined &&
      (obj.healthGainFactor = message.healthGainFactor);
    message.epochLength !== undefined &&
      (obj.epochLength = (message.epochLength || Long.ZERO).toString());
    if (message.pools) {
      obj.pools = message.pools.map((e) => e);
    } else {
      obj.pools = [];
    }
    message.removalQueueThreshold !== undefined &&
      (obj.removalQueueThreshold = message.removalQueueThreshold);
    message.maxOpenPositions !== undefined &&
      (obj.maxOpenPositions = (
        message.maxOpenPositions || Long.UZERO
      ).toString());
    message.poolOpenThreshold !== undefined &&
      (obj.poolOpenThreshold = message.poolOpenThreshold);
    message.forceCloseFundPercentage !== undefined &&
      (obj.forceCloseFundPercentage = message.forceCloseFundPercentage);
    message.forceCloseFundAddress !== undefined &&
      (obj.forceCloseFundAddress = message.forceCloseFundAddress);
    message.incrementalInterestPaymentFundPercentage !== undefined &&
      (obj.incrementalInterestPaymentFundPercentage =
        message.incrementalInterestPaymentFundPercentage);
    message.incrementalInterestPaymentFundAddress !== undefined &&
      (obj.incrementalInterestPaymentFundAddress =
        message.incrementalInterestPaymentFundAddress);
    message.sqModifier !== undefined && (obj.sqModifier = message.sqModifier);
    message.safetyFactor !== undefined &&
      (obj.safetyFactor = message.safetyFactor);
    if (message.closedPools) {
      obj.closedPools = message.closedPools.map((e) => e);
    } else {
      obj.closedPools = [];
    }
    message.incrementalInterestPaymentEnabled !== undefined &&
      (obj.incrementalInterestPaymentEnabled =
        message.incrementalInterestPaymentEnabled);
    message.whitelistingEnabled !== undefined &&
      (obj.whitelistingEnabled = message.whitelistingEnabled);
    message.rowanCollateralEnabled !== undefined &&
      (obj.rowanCollateralEnabled = message.rowanCollateralEnabled);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<Params>, I>>(object: I): Params {
    const message = createBaseParams();
    message.leverageMax = object.leverageMax ?? "";
    message.interestRateMax = object.interestRateMax ?? "";
    message.interestRateMin = object.interestRateMin ?? "";
    message.interestRateIncrease = object.interestRateIncrease ?? "";
    message.interestRateDecrease = object.interestRateDecrease ?? "";
    message.healthGainFactor = object.healthGainFactor ?? "";
    message.epochLength =
      object.epochLength !== undefined && object.epochLength !== null
        ? Long.fromValue(object.epochLength)
        : Long.ZERO;
    message.pools = object.pools?.map((e) => e) || [];
    message.removalQueueThreshold = object.removalQueueThreshold ?? "";
    message.maxOpenPositions =
      object.maxOpenPositions !== undefined && object.maxOpenPositions !== null
        ? Long.fromValue(object.maxOpenPositions)
        : Long.UZERO;
    message.poolOpenThreshold = object.poolOpenThreshold ?? "";
    message.forceCloseFundPercentage = object.forceCloseFundPercentage ?? "";
    message.forceCloseFundAddress = object.forceCloseFundAddress ?? "";
    message.incrementalInterestPaymentFundPercentage =
      object.incrementalInterestPaymentFundPercentage ?? "";
    message.incrementalInterestPaymentFundAddress =
      object.incrementalInterestPaymentFundAddress ?? "";
    message.sqModifier = object.sqModifier ?? "";
    message.safetyFactor = object.safetyFactor ?? "";
    message.closedPools = object.closedPools?.map((e) => e) || [];
    message.incrementalInterestPaymentEnabled =
      object.incrementalInterestPaymentEnabled ?? false;
    message.whitelistingEnabled = object.whitelistingEnabled ?? false;
    message.rowanCollateralEnabled = object.rowanCollateralEnabled ?? false;
    return message;
  },
};

function createBaseMTP(): MTP {
  return {
    address: "",
    collateralAsset: "",
    collateralAmount: "",
    liabilities: "",
    interestPaidCollateral: "",
    interestPaidCustody: "",
    interestUnpaidCollateral: "",
    custodyAsset: "",
    custodyAmount: "",
    leverage: "",
    mtpHealth: "",
    position: 0,
    id: Long.UZERO,
  };
}

export const MTP = {
  encode(message: MTP, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.address !== "") {
      writer.uint32(10).string(message.address);
    }
    if (message.collateralAsset !== "") {
      writer.uint32(18).string(message.collateralAsset);
    }
    if (message.collateralAmount !== "") {
      writer.uint32(26).string(message.collateralAmount);
    }
    if (message.liabilities !== "") {
      writer.uint32(34).string(message.liabilities);
    }
    if (message.interestPaidCollateral !== "") {
      writer.uint32(42).string(message.interestPaidCollateral);
    }
    if (message.interestPaidCustody !== "") {
      writer.uint32(50).string(message.interestPaidCustody);
    }
    if (message.interestUnpaidCollateral !== "") {
      writer.uint32(58).string(message.interestUnpaidCollateral);
    }
    if (message.custodyAsset !== "") {
      writer.uint32(66).string(message.custodyAsset);
    }
    if (message.custodyAmount !== "") {
      writer.uint32(74).string(message.custodyAmount);
    }
    if (message.leverage !== "") {
      writer.uint32(82).string(message.leverage);
    }
    if (message.mtpHealth !== "") {
      writer.uint32(90).string(message.mtpHealth);
    }
    if (message.position !== 0) {
      writer.uint32(96).int32(message.position);
    }
    if (!message.id.isZero()) {
      writer.uint32(104).uint64(message.id);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MTP {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMTP();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.address = reader.string();
          break;
        case 2:
          message.collateralAsset = reader.string();
          break;
        case 3:
          message.collateralAmount = reader.string();
          break;
        case 4:
          message.liabilities = reader.string();
          break;
        case 5:
          message.interestPaidCollateral = reader.string();
          break;
        case 6:
          message.interestPaidCustody = reader.string();
          break;
        case 7:
          message.interestUnpaidCollateral = reader.string();
          break;
        case 8:
          message.custodyAsset = reader.string();
          break;
        case 9:
          message.custodyAmount = reader.string();
          break;
        case 10:
          message.leverage = reader.string();
          break;
        case 11:
          message.mtpHealth = reader.string();
          break;
        case 12:
          message.position = reader.int32() as any;
          break;
        case 13:
          message.id = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MTP {
    return {
      address: isSet(object.address) ? String(object.address) : "",
      collateralAsset: isSet(object.collateralAsset)
        ? String(object.collateralAsset)
        : "",
      collateralAmount: isSet(object.collateralAmount)
        ? String(object.collateralAmount)
        : "",
      liabilities: isSet(object.liabilities) ? String(object.liabilities) : "",
      interestPaidCollateral: isSet(object.interestPaidCollateral)
        ? String(object.interestPaidCollateral)
        : "",
      interestPaidCustody: isSet(object.interestPaidCustody)
        ? String(object.interestPaidCustody)
        : "",
      interestUnpaidCollateral: isSet(object.interestUnpaidCollateral)
        ? String(object.interestUnpaidCollateral)
        : "",
      custodyAsset: isSet(object.custodyAsset)
        ? String(object.custodyAsset)
        : "",
      custodyAmount: isSet(object.custodyAmount)
        ? String(object.custodyAmount)
        : "",
      leverage: isSet(object.leverage) ? String(object.leverage) : "",
      mtpHealth: isSet(object.mtpHealth) ? String(object.mtpHealth) : "",
      position: isSet(object.position) ? positionFromJSON(object.position) : 0,
      id: isSet(object.id) ? Long.fromValue(object.id) : Long.UZERO,
    };
  },

  toJSON(message: MTP): unknown {
    const obj: any = {};
    message.address !== undefined && (obj.address = message.address);
    message.collateralAsset !== undefined &&
      (obj.collateralAsset = message.collateralAsset);
    message.collateralAmount !== undefined &&
      (obj.collateralAmount = message.collateralAmount);
    message.liabilities !== undefined &&
      (obj.liabilities = message.liabilities);
    message.interestPaidCollateral !== undefined &&
      (obj.interestPaidCollateral = message.interestPaidCollateral);
    message.interestPaidCustody !== undefined &&
      (obj.interestPaidCustody = message.interestPaidCustody);
    message.interestUnpaidCollateral !== undefined &&
      (obj.interestUnpaidCollateral = message.interestUnpaidCollateral);
    message.custodyAsset !== undefined &&
      (obj.custodyAsset = message.custodyAsset);
    message.custodyAmount !== undefined &&
      (obj.custodyAmount = message.custodyAmount);
    message.leverage !== undefined && (obj.leverage = message.leverage);
    message.mtpHealth !== undefined && (obj.mtpHealth = message.mtpHealth);
    message.position !== undefined &&
      (obj.position = positionToJSON(message.position));
    message.id !== undefined &&
      (obj.id = (message.id || Long.UZERO).toString());
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MTP>, I>>(object: I): MTP {
    const message = createBaseMTP();
    message.address = object.address ?? "";
    message.collateralAsset = object.collateralAsset ?? "";
    message.collateralAmount = object.collateralAmount ?? "";
    message.liabilities = object.liabilities ?? "";
    message.interestPaidCollateral = object.interestPaidCollateral ?? "";
    message.interestPaidCustody = object.interestPaidCustody ?? "";
    message.interestUnpaidCollateral = object.interestUnpaidCollateral ?? "";
    message.custodyAsset = object.custodyAsset ?? "";
    message.custodyAmount = object.custodyAmount ?? "";
    message.leverage = object.leverage ?? "";
    message.mtpHealth = object.mtpHealth ?? "";
    message.position = object.position ?? 0;
    message.id =
      object.id !== undefined && object.id !== null
        ? Long.fromValue(object.id)
        : Long.UZERO;
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
