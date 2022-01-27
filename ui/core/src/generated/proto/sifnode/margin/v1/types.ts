/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";

export const protobufPackage = "sifnode.margin.v1";

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
}

const baseGenesisState: object = {};

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
    const message = { ...baseGenesisState } as GenesisState;
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
    const message = { ...baseGenesisState } as GenesisState;
    if (object.params !== undefined && object.params !== null) {
      message.params = Params.fromJSON(object.params);
    } else {
      message.params = undefined;
    }
    return message;
  },

  toJSON(message: GenesisState): unknown {
    const obj: any = {};
    message.params !== undefined &&
      (obj.params = message.params ? Params.toJSON(message.params) : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<GenesisState>): GenesisState {
    const message = { ...baseGenesisState } as GenesisState;
    if (object.params !== undefined && object.params !== null) {
      message.params = Params.fromPartial(object.params);
    } else {
      message.params = undefined;
    }
    return message;
  },
};

const baseParams: object = {
  leverageMax: "",
  interestRateMax: "",
  interestRateMin: "",
  interestRateIncrease: "",
  interestRateDecrease: "",
  healthGainFactor: "",
  epochLength: Long.ZERO,
  pools: "",
};

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
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Params {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseParams } as Params;
    message.pools = [];
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
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Params {
    const message = { ...baseParams } as Params;
    message.pools = [];
    if (object.leverageMax !== undefined && object.leverageMax !== null) {
      message.leverageMax = String(object.leverageMax);
    } else {
      message.leverageMax = "";
    }
    if (
      object.interestRateMax !== undefined &&
      object.interestRateMax !== null
    ) {
      message.interestRateMax = String(object.interestRateMax);
    } else {
      message.interestRateMax = "";
    }
    if (
      object.interestRateMin !== undefined &&
      object.interestRateMin !== null
    ) {
      message.interestRateMin = String(object.interestRateMin);
    } else {
      message.interestRateMin = "";
    }
    if (
      object.interestRateIncrease !== undefined &&
      object.interestRateIncrease !== null
    ) {
      message.interestRateIncrease = String(object.interestRateIncrease);
    } else {
      message.interestRateIncrease = "";
    }
    if (
      object.interestRateDecrease !== undefined &&
      object.interestRateDecrease !== null
    ) {
      message.interestRateDecrease = String(object.interestRateDecrease);
    } else {
      message.interestRateDecrease = "";
    }
    if (
      object.healthGainFactor !== undefined &&
      object.healthGainFactor !== null
    ) {
      message.healthGainFactor = String(object.healthGainFactor);
    } else {
      message.healthGainFactor = "";
    }
    if (object.epochLength !== undefined && object.epochLength !== null) {
      message.epochLength = Long.fromString(object.epochLength);
    } else {
      message.epochLength = Long.ZERO;
    }
    if (object.pools !== undefined && object.pools !== null) {
      for (const e of object.pools) {
        message.pools.push(String(e));
      }
    }
    return message;
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
    return obj;
  },

  fromPartial(object: DeepPartial<Params>): Params {
    const message = { ...baseParams } as Params;
    message.pools = [];
    if (object.leverageMax !== undefined && object.leverageMax !== null) {
      message.leverageMax = object.leverageMax;
    } else {
      message.leverageMax = "";
    }
    if (
      object.interestRateMax !== undefined &&
      object.interestRateMax !== null
    ) {
      message.interestRateMax = object.interestRateMax;
    } else {
      message.interestRateMax = "";
    }
    if (
      object.interestRateMin !== undefined &&
      object.interestRateMin !== null
    ) {
      message.interestRateMin = object.interestRateMin;
    } else {
      message.interestRateMin = "";
    }
    if (
      object.interestRateIncrease !== undefined &&
      object.interestRateIncrease !== null
    ) {
      message.interestRateIncrease = object.interestRateIncrease;
    } else {
      message.interestRateIncrease = "";
    }
    if (
      object.interestRateDecrease !== undefined &&
      object.interestRateDecrease !== null
    ) {
      message.interestRateDecrease = object.interestRateDecrease;
    } else {
      message.interestRateDecrease = "";
    }
    if (
      object.healthGainFactor !== undefined &&
      object.healthGainFactor !== null
    ) {
      message.healthGainFactor = object.healthGainFactor;
    } else {
      message.healthGainFactor = "";
    }
    if (object.epochLength !== undefined && object.epochLength !== null) {
      message.epochLength = object.epochLength as Long;
    } else {
      message.epochLength = Long.ZERO;
    }
    if (object.pools !== undefined && object.pools !== null) {
      for (const e of object.pools) {
        message.pools.push(e);
      }
    }
    return message;
  },
};

const baseMTP: object = {
  address: "",
  collateralAsset: "",
  collateralAmount: "",
  liabilitiesP: "",
  liabilitiesI: "",
  custodyAsset: "",
  custodyAmount: "",
  leverage: "",
  mtpHealth: "",
};

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
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MTP {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseMTP } as MTP;
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
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MTP {
    const message = { ...baseMTP } as MTP;
    if (object.address !== undefined && object.address !== null) {
      message.address = String(object.address);
    } else {
      message.address = "";
    }
    if (
      object.collateralAsset !== undefined &&
      object.collateralAsset !== null
    ) {
      message.collateralAsset = String(object.collateralAsset);
    } else {
      message.collateralAsset = "";
    }
    if (
      object.collateralAmount !== undefined &&
      object.collateralAmount !== null
    ) {
      message.collateralAmount = String(object.collateralAmount);
    } else {
      message.collateralAmount = "";
    }
    if (object.liabilitiesP !== undefined && object.liabilitiesP !== null) {
      message.liabilitiesP = String(object.liabilitiesP);
    } else {
      message.liabilitiesP = "";
    }
    if (object.liabilitiesI !== undefined && object.liabilitiesI !== null) {
      message.liabilitiesI = String(object.liabilitiesI);
    } else {
      message.liabilitiesI = "";
    }
    if (object.custodyAsset !== undefined && object.custodyAsset !== null) {
      message.custodyAsset = String(object.custodyAsset);
    } else {
      message.custodyAsset = "";
    }
    if (object.custodyAmount !== undefined && object.custodyAmount !== null) {
      message.custodyAmount = String(object.custodyAmount);
    } else {
      message.custodyAmount = "";
    }
    if (object.leverage !== undefined && object.leverage !== null) {
      message.leverage = String(object.leverage);
    } else {
      message.leverage = "";
    }
    if (object.mtpHealth !== undefined && object.mtpHealth !== null) {
      message.mtpHealth = String(object.mtpHealth);
    } else {
      message.mtpHealth = "";
    }
    return message;
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
    return obj;
  },

  fromPartial(object: DeepPartial<MTP>): MTP {
    const message = { ...baseMTP } as MTP;
    if (object.address !== undefined && object.address !== null) {
      message.address = object.address;
    } else {
      message.address = "";
    }
    if (
      object.collateralAsset !== undefined &&
      object.collateralAsset !== null
    ) {
      message.collateralAsset = object.collateralAsset;
    } else {
      message.collateralAsset = "";
    }
    if (
      object.collateralAmount !== undefined &&
      object.collateralAmount !== null
    ) {
      message.collateralAmount = object.collateralAmount;
    } else {
      message.collateralAmount = "";
    }
    if (object.liabilitiesP !== undefined && object.liabilitiesP !== null) {
      message.liabilitiesP = object.liabilitiesP;
    } else {
      message.liabilitiesP = "";
    }
    if (object.liabilitiesI !== undefined && object.liabilitiesI !== null) {
      message.liabilitiesI = object.liabilitiesI;
    } else {
      message.liabilitiesI = "";
    }
    if (object.custodyAsset !== undefined && object.custodyAsset !== null) {
      message.custodyAsset = object.custodyAsset;
    } else {
      message.custodyAsset = "";
    }
    if (object.custodyAmount !== undefined && object.custodyAmount !== null) {
      message.custodyAmount = object.custodyAmount;
    } else {
      message.custodyAmount = "";
    }
    if (object.leverage !== undefined && object.leverage !== null) {
      message.leverage = object.leverage;
    } else {
      message.leverage = "";
    }
    if (object.mtpHealth !== undefined && object.mtpHealth !== null) {
      message.mtpHealth = object.mtpHealth;
    } else {
      message.mtpHealth = "";
    }
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
  | undefined
  | Long;
export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends {}
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}
