/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";

export const protobufPackage = "sifnode.tokenregistry.v1";

export interface GenesisState {
  adminAccount: string;
  registry?: Registry;
}

export interface Registry {
  entries: RegistryEntry[];
}

export interface RegistryEntry {
  isWhitelisted: boolean;
  decimals: Long;
  denom: string;
  baseDenom: string;
  path: string;
  srcChannel: string;
  destChannel: string;
  displayName: string;
  displaySymbol: string;
  network: string;
  address: string;
  externalSymbol: string;
  transferLimit: string;
  /**
   * TODO: Remove before merging to develop
   *
   * @deprecated
   */
  ibcDenom: string;
  /**
   * TODO: Remove before merging to develop
   *
   * @deprecated
   */
  ibcDecimals: Long;
  /**
   * The name of denomination unit of this token that is the smallest unit stored.
   * IBC imports of this RegistryEntry convert and store funds as unit_denom.
   * Several different denom units of a token may be imported into this same unit denom,
   * they should all be stored under the same unit_denom if they are the same token.
   * When exporting a RegistryEntry where unit_denom != denom,
   * then unit_denom can, in future, be used to indicate the source of funds for a denom unit that does not actually
   * exist on chain, enabling other chains to overcome the uint64 limit on the packet level and import large amounts
   * of high precision tokens easily.
   * ie. microrowan -> rowan
   * i.e rowan -> rowan
   */
  unitDenom: string;
  /**
   * The name of denomination unit of this token that should appear on counterparty chain when this unit is exported.
   * If empty, the denom is exported as is.
   * Generally this will only be used to map a high precision (unit_denom) to a lower precision,
   * to overcome the current uint64 limit on the packet level.
   * i.e rowan -> microrowan
   * i.e microrowan -> microrowan
   */
  ibcCounterPartyDenom: string;
}

const baseGenesisState: object = { adminAccount: "" };

export const GenesisState = {
  encode(
    message: GenesisState,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.adminAccount !== "") {
      writer.uint32(10).string(message.adminAccount);
    }
    if (message.registry !== undefined) {
      Registry.encode(message.registry, writer.uint32(18).fork()).ldelim();
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
          message.adminAccount = reader.string();
          break;
        case 2:
          message.registry = Registry.decode(reader, reader.uint32());
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
    if (object.adminAccount !== undefined && object.adminAccount !== null) {
      message.adminAccount = String(object.adminAccount);
    } else {
      message.adminAccount = "";
    }
    if (object.registry !== undefined && object.registry !== null) {
      message.registry = Registry.fromJSON(object.registry);
    } else {
      message.registry = undefined;
    }
    return message;
  },

  toJSON(message: GenesisState): unknown {
    const obj: any = {};
    message.adminAccount !== undefined &&
      (obj.adminAccount = message.adminAccount);
    message.registry !== undefined &&
      (obj.registry = message.registry
        ? Registry.toJSON(message.registry)
        : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<GenesisState>): GenesisState {
    const message = { ...baseGenesisState } as GenesisState;
    if (object.adminAccount !== undefined && object.adminAccount !== null) {
      message.adminAccount = object.adminAccount;
    } else {
      message.adminAccount = "";
    }
    if (object.registry !== undefined && object.registry !== null) {
      message.registry = Registry.fromPartial(object.registry);
    } else {
      message.registry = undefined;
    }
    return message;
  },
};

const baseRegistry: object = {};

export const Registry = {
  encode(
    message: Registry,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    for (const v of message.entries) {
      RegistryEntry.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Registry {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseRegistry } as Registry;
    message.entries = [];
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.entries.push(RegistryEntry.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Registry {
    const message = { ...baseRegistry } as Registry;
    message.entries = [];
    if (object.entries !== undefined && object.entries !== null) {
      for (const e of object.entries) {
        message.entries.push(RegistryEntry.fromJSON(e));
      }
    }
    return message;
  },

  toJSON(message: Registry): unknown {
    const obj: any = {};
    if (message.entries) {
      obj.entries = message.entries.map((e) =>
        e ? RegistryEntry.toJSON(e) : undefined,
      );
    } else {
      obj.entries = [];
    }
    return obj;
  },

  fromPartial(object: DeepPartial<Registry>): Registry {
    const message = { ...baseRegistry } as Registry;
    message.entries = [];
    if (object.entries !== undefined && object.entries !== null) {
      for (const e of object.entries) {
        message.entries.push(RegistryEntry.fromPartial(e));
      }
    }
    return message;
  },
};

const baseRegistryEntry: object = {
  isWhitelisted: false,
  decimals: Long.ZERO,
  denom: "",
  baseDenom: "",
  path: "",
  srcChannel: "",
  destChannel: "",
  displayName: "",
  displaySymbol: "",
  network: "",
  address: "",
  externalSymbol: "",
  transferLimit: "",
  ibcDenom: "",
  ibcDecimals: Long.ZERO,
  unitDenom: "",
  ibcCounterPartyDenom: "",
};

export const RegistryEntry = {
  encode(
    message: RegistryEntry,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.isWhitelisted === true) {
      writer.uint32(8).bool(message.isWhitelisted);
    }
    if (!message.decimals.isZero()) {
      writer.uint32(16).int64(message.decimals);
    }
    if (message.denom !== "") {
      writer.uint32(26).string(message.denom);
    }
    if (message.baseDenom !== "") {
      writer.uint32(34).string(message.baseDenom);
    }
    if (message.path !== "") {
      writer.uint32(42).string(message.path);
    }
    if (message.srcChannel !== "") {
      writer.uint32(50).string(message.srcChannel);
    }
    if (message.destChannel !== "") {
      writer.uint32(58).string(message.destChannel);
    }
    if (message.displayName !== "") {
      writer.uint32(66).string(message.displayName);
    }
    if (message.displaySymbol !== "") {
      writer.uint32(74).string(message.displaySymbol);
    }
    if (message.network !== "") {
      writer.uint32(82).string(message.network);
    }
    if (message.address !== "") {
      writer.uint32(90).string(message.address);
    }
    if (message.externalSymbol !== "") {
      writer.uint32(98).string(message.externalSymbol);
    }
    if (message.transferLimit !== "") {
      writer.uint32(106).string(message.transferLimit);
    }
    if (message.ibcDenom !== "") {
      writer.uint32(114).string(message.ibcDenom);
    }
    if (!message.ibcDecimals.isZero()) {
      writer.uint32(120).int64(message.ibcDecimals);
    }
    if (message.unitDenom !== "") {
      writer.uint32(130).string(message.unitDenom);
    }
    if (message.ibcCounterPartyDenom !== "") {
      writer.uint32(138).string(message.ibcCounterPartyDenom);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RegistryEntry {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseRegistryEntry } as RegistryEntry;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.isWhitelisted = reader.bool();
          break;
        case 2:
          message.decimals = reader.int64() as Long;
          break;
        case 3:
          message.denom = reader.string();
          break;
        case 4:
          message.baseDenom = reader.string();
          break;
        case 5:
          message.path = reader.string();
          break;
        case 6:
          message.srcChannel = reader.string();
          break;
        case 7:
          message.destChannel = reader.string();
          break;
        case 8:
          message.displayName = reader.string();
          break;
        case 9:
          message.displaySymbol = reader.string();
          break;
        case 10:
          message.network = reader.string();
          break;
        case 11:
          message.address = reader.string();
          break;
        case 12:
          message.externalSymbol = reader.string();
          break;
        case 13:
          message.transferLimit = reader.string();
          break;
        case 14:
          message.ibcDenom = reader.string();
          break;
        case 15:
          message.ibcDecimals = reader.int64() as Long;
          break;
        case 16:
          message.unitDenom = reader.string();
          break;
        case 17:
          message.ibcCounterPartyDenom = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): RegistryEntry {
    const message = { ...baseRegistryEntry } as RegistryEntry;
    if (object.isWhitelisted !== undefined && object.isWhitelisted !== null) {
      message.isWhitelisted = Boolean(object.isWhitelisted);
    } else {
      message.isWhitelisted = false;
    }
    if (object.decimals !== undefined && object.decimals !== null) {
      message.decimals = Long.fromString(object.decimals);
    } else {
      message.decimals = Long.ZERO;
    }
    if (object.denom !== undefined && object.denom !== null) {
      message.denom = String(object.denom);
    } else {
      message.denom = "";
    }
    if (object.baseDenom !== undefined && object.baseDenom !== null) {
      message.baseDenom = String(object.baseDenom);
    } else {
      message.baseDenom = "";
    }
    if (object.path !== undefined && object.path !== null) {
      message.path = String(object.path);
    } else {
      message.path = "";
    }
    if (object.srcChannel !== undefined && object.srcChannel !== null) {
      message.srcChannel = String(object.srcChannel);
    } else {
      message.srcChannel = "";
    }
    if (object.destChannel !== undefined && object.destChannel !== null) {
      message.destChannel = String(object.destChannel);
    } else {
      message.destChannel = "";
    }
    if (object.displayName !== undefined && object.displayName !== null) {
      message.displayName = String(object.displayName);
    } else {
      message.displayName = "";
    }
    if (object.displaySymbol !== undefined && object.displaySymbol !== null) {
      message.displaySymbol = String(object.displaySymbol);
    } else {
      message.displaySymbol = "";
    }
    if (object.network !== undefined && object.network !== null) {
      message.network = String(object.network);
    } else {
      message.network = "";
    }
    if (object.address !== undefined && object.address !== null) {
      message.address = String(object.address);
    } else {
      message.address = "";
    }
    if (object.externalSymbol !== undefined && object.externalSymbol !== null) {
      message.externalSymbol = String(object.externalSymbol);
    } else {
      message.externalSymbol = "";
    }
    if (object.transferLimit !== undefined && object.transferLimit !== null) {
      message.transferLimit = String(object.transferLimit);
    } else {
      message.transferLimit = "";
    }
    if (object.ibcDenom !== undefined && object.ibcDenom !== null) {
      message.ibcDenom = String(object.ibcDenom);
    } else {
      message.ibcDenom = "";
    }
    if (object.ibcDecimals !== undefined && object.ibcDecimals !== null) {
      message.ibcDecimals = Long.fromString(object.ibcDecimals);
    } else {
      message.ibcDecimals = Long.ZERO;
    }
    if (object.unitDenom !== undefined && object.unitDenom !== null) {
      message.unitDenom = String(object.unitDenom);
    } else {
      message.unitDenom = "";
    }
    if (
      object.ibcCounterPartyDenom !== undefined &&
      object.ibcCounterPartyDenom !== null
    ) {
      message.ibcCounterPartyDenom = String(object.ibcCounterPartyDenom);
    } else {
      message.ibcCounterPartyDenom = "";
    }
    return message;
  },

  toJSON(message: RegistryEntry): unknown {
    const obj: any = {};
    message.isWhitelisted !== undefined &&
      (obj.isWhitelisted = message.isWhitelisted);
    message.decimals !== undefined &&
      (obj.decimals = (message.decimals || Long.ZERO).toString());
    message.denom !== undefined && (obj.denom = message.denom);
    message.baseDenom !== undefined && (obj.baseDenom = message.baseDenom);
    message.path !== undefined && (obj.path = message.path);
    message.srcChannel !== undefined && (obj.srcChannel = message.srcChannel);
    message.destChannel !== undefined &&
      (obj.destChannel = message.destChannel);
    message.displayName !== undefined &&
      (obj.displayName = message.displayName);
    message.displaySymbol !== undefined &&
      (obj.displaySymbol = message.displaySymbol);
    message.network !== undefined && (obj.network = message.network);
    message.address !== undefined && (obj.address = message.address);
    message.externalSymbol !== undefined &&
      (obj.externalSymbol = message.externalSymbol);
    message.transferLimit !== undefined &&
      (obj.transferLimit = message.transferLimit);
    message.ibcDenom !== undefined && (obj.ibcDenom = message.ibcDenom);
    message.ibcDecimals !== undefined &&
      (obj.ibcDecimals = (message.ibcDecimals || Long.ZERO).toString());
    message.unitDenom !== undefined && (obj.unitDenom = message.unitDenom);
    message.ibcCounterPartyDenom !== undefined &&
      (obj.ibcCounterPartyDenom = message.ibcCounterPartyDenom);
    return obj;
  },

  fromPartial(object: DeepPartial<RegistryEntry>): RegistryEntry {
    const message = { ...baseRegistryEntry } as RegistryEntry;
    if (object.isWhitelisted !== undefined && object.isWhitelisted !== null) {
      message.isWhitelisted = object.isWhitelisted;
    } else {
      message.isWhitelisted = false;
    }
    if (object.decimals !== undefined && object.decimals !== null) {
      message.decimals = object.decimals as Long;
    } else {
      message.decimals = Long.ZERO;
    }
    if (object.denom !== undefined && object.denom !== null) {
      message.denom = object.denom;
    } else {
      message.denom = "";
    }
    if (object.baseDenom !== undefined && object.baseDenom !== null) {
      message.baseDenom = object.baseDenom;
    } else {
      message.baseDenom = "";
    }
    if (object.path !== undefined && object.path !== null) {
      message.path = object.path;
    } else {
      message.path = "";
    }
    if (object.srcChannel !== undefined && object.srcChannel !== null) {
      message.srcChannel = object.srcChannel;
    } else {
      message.srcChannel = "";
    }
    if (object.destChannel !== undefined && object.destChannel !== null) {
      message.destChannel = object.destChannel;
    } else {
      message.destChannel = "";
    }
    if (object.displayName !== undefined && object.displayName !== null) {
      message.displayName = object.displayName;
    } else {
      message.displayName = "";
    }
    if (object.displaySymbol !== undefined && object.displaySymbol !== null) {
      message.displaySymbol = object.displaySymbol;
    } else {
      message.displaySymbol = "";
    }
    if (object.network !== undefined && object.network !== null) {
      message.network = object.network;
    } else {
      message.network = "";
    }
    if (object.address !== undefined && object.address !== null) {
      message.address = object.address;
    } else {
      message.address = "";
    }
    if (object.externalSymbol !== undefined && object.externalSymbol !== null) {
      message.externalSymbol = object.externalSymbol;
    } else {
      message.externalSymbol = "";
    }
    if (object.transferLimit !== undefined && object.transferLimit !== null) {
      message.transferLimit = object.transferLimit;
    } else {
      message.transferLimit = "";
    }
    if (object.ibcDenom !== undefined && object.ibcDenom !== null) {
      message.ibcDenom = object.ibcDenom;
    } else {
      message.ibcDenom = "";
    }
    if (object.ibcDecimals !== undefined && object.ibcDecimals !== null) {
      message.ibcDecimals = object.ibcDecimals as Long;
    } else {
      message.ibcDecimals = Long.ZERO;
    }
    if (object.unitDenom !== undefined && object.unitDenom !== null) {
      message.unitDenom = object.unitDenom;
    } else {
      message.unitDenom = "";
    }
    if (
      object.ibcCounterPartyDenom !== undefined &&
      object.ibcCounterPartyDenom !== null
    ) {
      message.ibcCounterPartyDenom = object.ibcCounterPartyDenom;
    } else {
      message.ibcCounterPartyDenom = "";
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
