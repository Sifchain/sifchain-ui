/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";

export const protobufPackage = "sifnode.tokenregistry.v1";

export enum Permission {
  UNSPECIFIED = 0,
  CLP = 1,
  IBCEXPORT = 2,
  IBCIMPORT = 3,
  DISABLE_BUY = 4,
  DISABLE_SELL = 5,
  UNRECOGNIZED = -1,
}

export function permissionFromJSON(object: any): Permission {
  switch (object) {
    case 0:
    case "UNSPECIFIED":
      return Permission.UNSPECIFIED;
    case 1:
    case "CLP":
      return Permission.CLP;
    case 2:
    case "IBCEXPORT":
      return Permission.IBCEXPORT;
    case 3:
    case "IBCIMPORT":
      return Permission.IBCIMPORT;
    case 4:
    case "DISABLE_BUY":
      return Permission.DISABLE_BUY;
    case 5:
    case "DISABLE_SELL":
      return Permission.DISABLE_SELL;
    case -1:
    case "UNRECOGNIZED":
    default:
      return Permission.UNRECOGNIZED;
  }
}

export function permissionToJSON(object: Permission): string {
  switch (object) {
    case Permission.UNSPECIFIED:
      return "UNSPECIFIED";
    case Permission.CLP:
      return "CLP";
    case Permission.IBCEXPORT:
      return "IBCEXPORT";
    case Permission.IBCIMPORT:
      return "IBCIMPORT";
    case Permission.DISABLE_BUY:
      return "DISABLE_BUY";
    case Permission.DISABLE_SELL:
      return "DISABLE_SELL";
    case Permission.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface GenesisState {
  registry?: Registry;
}

export interface Registry {
  entries: RegistryEntry[];
}

export interface RegistryEntry {
  decimals: Long;
  denom: string;
  baseDenom: string;
  path: string;
  ibcChannelId: string;
  ibcCounterpartyChannelId: string;
  displayName: string;
  displaySymbol: string;
  network: string;
  address: string;
  externalSymbol: string;
  transferLimit: string;
  permissions: Permission[];
  /**
   * The name of denomination unit of this token that is the smallest unit
   * stored. IBC imports of this RegistryEntry convert and store funds as
   * unit_denom. Several different denom units of a token may be imported into
   * this same unit denom, they should all be stored under the same unit_denom
   * if they are the same token. When exporting a RegistryEntry where unit_denom
   * != denom, then unit_denom can, in future, be used to indicate the source of
   * funds for a denom unit that does not actually exist on chain, enabling
   * other chains to overcome the uint64 limit on the packet level and import
   * large amounts of high precision tokens easily. ie. microrowan -> rowan i.e
   * rowan -> rowan
   */
  unitDenom: string;
  /**
   * The name of denomination unit of this token that should appear on
   * counterparty chain when this unit is exported. If empty, the denom is
   * exported as is. Generally this will only be used to map a high precision
   * (unit_denom) to a lower precision, to overcome the current uint64 limit on
   * the packet level. i.e rowan -> microrowan i.e microrowan -> microrowan
   */
  ibcCounterpartyDenom: string;
  ibcCounterpartyChainId: string;
}

function createBaseGenesisState(): GenesisState {
  return { registry: undefined };
}

export const GenesisState = {
  encode(
    message: GenesisState,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.registry !== undefined) {
      Registry.encode(message.registry, writer.uint32(18).fork()).ldelim();
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
    return {
      registry: isSet(object.registry)
        ? Registry.fromJSON(object.registry)
        : undefined,
    };
  },

  toJSON(message: GenesisState): unknown {
    const obj: any = {};
    message.registry !== undefined &&
      (obj.registry = message.registry
        ? Registry.toJSON(message.registry)
        : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<GenesisState>, I>>(
    object: I,
  ): GenesisState {
    const message = createBaseGenesisState();
    message.registry =
      object.registry !== undefined && object.registry !== null
        ? Registry.fromPartial(object.registry)
        : undefined;
    return message;
  },
};

function createBaseRegistry(): Registry {
  return { entries: [] };
}

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
    const message = createBaseRegistry();
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
    return {
      entries: Array.isArray(object?.entries)
        ? object.entries.map((e: any) => RegistryEntry.fromJSON(e))
        : [],
    };
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

  fromPartial<I extends Exact<DeepPartial<Registry>, I>>(object: I): Registry {
    const message = createBaseRegistry();
    message.entries =
      object.entries?.map((e) => RegistryEntry.fromPartial(e)) || [];
    return message;
  },
};

function createBaseRegistryEntry(): RegistryEntry {
  return {
    decimals: Long.ZERO,
    denom: "",
    baseDenom: "",
    path: "",
    ibcChannelId: "",
    ibcCounterpartyChannelId: "",
    displayName: "",
    displaySymbol: "",
    network: "",
    address: "",
    externalSymbol: "",
    transferLimit: "",
    permissions: [],
    unitDenom: "",
    ibcCounterpartyDenom: "",
    ibcCounterpartyChainId: "",
  };
}

export const RegistryEntry = {
  encode(
    message: RegistryEntry,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
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
    if (message.ibcChannelId !== "") {
      writer.uint32(50).string(message.ibcChannelId);
    }
    if (message.ibcCounterpartyChannelId !== "") {
      writer.uint32(58).string(message.ibcCounterpartyChannelId);
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
    writer.uint32(122).fork();
    for (const v of message.permissions) {
      writer.int32(v);
    }
    writer.ldelim();
    if (message.unitDenom !== "") {
      writer.uint32(130).string(message.unitDenom);
    }
    if (message.ibcCounterpartyDenom !== "") {
      writer.uint32(138).string(message.ibcCounterpartyDenom);
    }
    if (message.ibcCounterpartyChainId !== "") {
      writer.uint32(146).string(message.ibcCounterpartyChainId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RegistryEntry {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRegistryEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
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
          message.ibcChannelId = reader.string();
          break;
        case 7:
          message.ibcCounterpartyChannelId = reader.string();
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
        case 15:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.permissions.push(reader.int32() as any);
            }
          } else {
            message.permissions.push(reader.int32() as any);
          }
          break;
        case 16:
          message.unitDenom = reader.string();
          break;
        case 17:
          message.ibcCounterpartyDenom = reader.string();
          break;
        case 18:
          message.ibcCounterpartyChainId = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): RegistryEntry {
    return {
      decimals: isSet(object.decimals)
        ? Long.fromValue(object.decimals)
        : Long.ZERO,
      denom: isSet(object.denom) ? String(object.denom) : "",
      baseDenom: isSet(object.baseDenom) ? String(object.baseDenom) : "",
      path: isSet(object.path) ? String(object.path) : "",
      ibcChannelId: isSet(object.ibcChannelId)
        ? String(object.ibcChannelId)
        : "",
      ibcCounterpartyChannelId: isSet(object.ibcCounterpartyChannelId)
        ? String(object.ibcCounterpartyChannelId)
        : "",
      displayName: isSet(object.displayName) ? String(object.displayName) : "",
      displaySymbol: isSet(object.displaySymbol)
        ? String(object.displaySymbol)
        : "",
      network: isSet(object.network) ? String(object.network) : "",
      address: isSet(object.address) ? String(object.address) : "",
      externalSymbol: isSet(object.externalSymbol)
        ? String(object.externalSymbol)
        : "",
      transferLimit: isSet(object.transferLimit)
        ? String(object.transferLimit)
        : "",
      permissions: Array.isArray(object?.permissions)
        ? object.permissions.map((e: any) => permissionFromJSON(e))
        : [],
      unitDenom: isSet(object.unitDenom) ? String(object.unitDenom) : "",
      ibcCounterpartyDenom: isSet(object.ibcCounterpartyDenom)
        ? String(object.ibcCounterpartyDenom)
        : "",
      ibcCounterpartyChainId: isSet(object.ibcCounterpartyChainId)
        ? String(object.ibcCounterpartyChainId)
        : "",
    };
  },

  toJSON(message: RegistryEntry): unknown {
    const obj: any = {};
    message.decimals !== undefined &&
      (obj.decimals = (message.decimals || Long.ZERO).toString());
    message.denom !== undefined && (obj.denom = message.denom);
    message.baseDenom !== undefined && (obj.baseDenom = message.baseDenom);
    message.path !== undefined && (obj.path = message.path);
    message.ibcChannelId !== undefined &&
      (obj.ibcChannelId = message.ibcChannelId);
    message.ibcCounterpartyChannelId !== undefined &&
      (obj.ibcCounterpartyChannelId = message.ibcCounterpartyChannelId);
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
    if (message.permissions) {
      obj.permissions = message.permissions.map((e) => permissionToJSON(e));
    } else {
      obj.permissions = [];
    }
    message.unitDenom !== undefined && (obj.unitDenom = message.unitDenom);
    message.ibcCounterpartyDenom !== undefined &&
      (obj.ibcCounterpartyDenom = message.ibcCounterpartyDenom);
    message.ibcCounterpartyChainId !== undefined &&
      (obj.ibcCounterpartyChainId = message.ibcCounterpartyChainId);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<RegistryEntry>, I>>(
    object: I,
  ): RegistryEntry {
    const message = createBaseRegistryEntry();
    message.decimals =
      object.decimals !== undefined && object.decimals !== null
        ? Long.fromValue(object.decimals)
        : Long.ZERO;
    message.denom = object.denom ?? "";
    message.baseDenom = object.baseDenom ?? "";
    message.path = object.path ?? "";
    message.ibcChannelId = object.ibcChannelId ?? "";
    message.ibcCounterpartyChannelId = object.ibcCounterpartyChannelId ?? "";
    message.displayName = object.displayName ?? "";
    message.displaySymbol = object.displaySymbol ?? "";
    message.network = object.network ?? "";
    message.address = object.address ?? "";
    message.externalSymbol = object.externalSymbol ?? "";
    message.transferLimit = object.transferLimit ?? "";
    message.permissions = object.permissions?.map((e) => e) || [];
    message.unitDenom = object.unitDenom ?? "";
    message.ibcCounterpartyDenom = object.ibcCounterpartyDenom ?? "";
    message.ibcCounterpartyChainId = object.ibcCounterpartyChainId ?? "";
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
