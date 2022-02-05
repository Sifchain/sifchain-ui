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
    default:
      return "UNKNOWN";
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
  forceCloseThreshold: string;
}

export interface MTP {
  address: string;
  collateralAsset: string;
  collateralAmount: string;
  liabilitiesP: string;
  liabilitiesI: string;
  custodyAsset: string;
  custodyAmount: string;
  leverage: string;
  mtpHealth: string;
  position: Position;
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
    forceCloseThreshold: "",
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
    if (message.forceCloseThreshold !== "") {
      writer.uint32(74).string(message.forceCloseThreshold);
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
        case 9:
          message.forceCloseThreshold = reader.string();
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
        ? Long.fromString(object.epochLength)
        : Long.ZERO,
      pools: Array.isArray(object?.pools)
        ? object.pools.map((e: any) => String(e))
        : [],
      forceCloseThreshold: isSet(object.forceCloseThreshold)
        ? String(object.forceCloseThreshold)
        : "",
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
    message.forceCloseThreshold !== undefined &&
      (obj.forceCloseThreshold = message.forceCloseThreshold);
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
    message.forceCloseThreshold = object.forceCloseThreshold ?? "";
    return message;
  },
};

function createBaseMTP(): MTP {
  return {
    address: "",
    collateralAsset: "",
    collateralAmount: "",
    liabilitiesP: "",
    liabilitiesI: "",
    custodyAsset: "",
    custodyAmount: "",
    leverage: "",
    mtpHealth: "",
    position: 0,
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
    if (message.liabilitiesP !== "") {
      writer.uint32(34).string(message.liabilitiesP);
    }
    if (message.liabilitiesI !== "") {
      writer.uint32(42).string(message.liabilitiesI);
    }
    if (message.custodyAsset !== "") {
      writer.uint32(50).string(message.custodyAsset);
    }
    if (message.custodyAmount !== "") {
      writer.uint32(58).string(message.custodyAmount);
    }
    if (message.leverage !== "") {
      writer.uint32(66).string(message.leverage);
    }
    if (message.mtpHealth !== "") {
      writer.uint32(74).string(message.mtpHealth);
    }
    if (message.position !== 0) {
      writer.uint32(80).int32(message.position);
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
          message.liabilitiesP = reader.string();
          break;
        case 5:
          message.liabilitiesI = reader.string();
          break;
        case 6:
          message.custodyAsset = reader.string();
          break;
        case 7:
          message.custodyAmount = reader.string();
          break;
        case 8:
          message.leverage = reader.string();
          break;
        case 9:
          message.mtpHealth = reader.string();
          break;
        case 10:
          message.position = reader.int32() as any;
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
      liabilitiesP: isSet(object.liabilitiesP)
        ? String(object.liabilitiesP)
        : "",
      liabilitiesI: isSet(object.liabilitiesI)
        ? String(object.liabilitiesI)
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
    };
  },

  toJSON(message: MTP): unknown {
    const obj: any = {};
    message.address !== undefined && (obj.address = message.address);
    message.collateralAsset !== undefined &&
      (obj.collateralAsset = message.collateralAsset);
    message.collateralAmount !== undefined &&
      (obj.collateralAmount = message.collateralAmount);
    message.liabilitiesP !== undefined &&
      (obj.liabilitiesP = message.liabilitiesP);
    message.liabilitiesI !== undefined &&
      (obj.liabilitiesI = message.liabilitiesI);
    message.custodyAsset !== undefined &&
      (obj.custodyAsset = message.custodyAsset);
    message.custodyAmount !== undefined &&
      (obj.custodyAmount = message.custodyAmount);
    message.leverage !== undefined && (obj.leverage = message.leverage);
    message.mtpHealth !== undefined && (obj.mtpHealth = message.mtpHealth);
    message.position !== undefined &&
      (obj.position = positionToJSON(message.position));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MTP>, I>>(object: I): MTP {
    const message = createBaseMTP();
    message.address = object.address ?? "";
    message.collateralAsset = object.collateralAsset ?? "";
    message.collateralAmount = object.collateralAmount ?? "";
    message.liabilitiesP = object.liabilitiesP ?? "";
    message.liabilitiesI = object.liabilitiesI ?? "";
    message.custodyAsset = object.custodyAsset ?? "";
    message.custodyAmount = object.custodyAmount ?? "";
    message.leverage = object.leverage ?? "";
    message.mtpHealth = object.mtpHealth ?? "";
    message.position = object.position ?? 0;
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
