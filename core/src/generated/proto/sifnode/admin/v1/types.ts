/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";

export const protobufPackage = "sifnode.admin.v1";

export enum AdminType {
  CLPDEX = 0,
  PMTPREWARDS = 1,
  TOKENREGISTRY = 2,
  ETHBRIDGE = 3,
  ADMIN = 4,
  MARGIN = 5,
  UNRECOGNIZED = -1,
}

export function adminTypeFromJSON(object: any): AdminType {
  switch (object) {
    case 0:
    case "CLPDEX":
      return AdminType.CLPDEX;
    case 1:
    case "PMTPREWARDS":
      return AdminType.PMTPREWARDS;
    case 2:
    case "TOKENREGISTRY":
      return AdminType.TOKENREGISTRY;
    case 3:
    case "ETHBRIDGE":
      return AdminType.ETHBRIDGE;
    case 4:
    case "ADMIN":
      return AdminType.ADMIN;
    case 5:
    case "MARGIN":
      return AdminType.MARGIN;
    case -1:
    case "UNRECOGNIZED":
    default:
      return AdminType.UNRECOGNIZED;
  }
}

export function adminTypeToJSON(object: AdminType): string {
  switch (object) {
    case AdminType.CLPDEX:
      return "CLPDEX";
    case AdminType.PMTPREWARDS:
      return "PMTPREWARDS";
    case AdminType.TOKENREGISTRY:
      return "TOKENREGISTRY";
    case AdminType.ETHBRIDGE:
      return "ETHBRIDGE";
    case AdminType.ADMIN:
      return "ADMIN";
    case AdminType.MARGIN:
      return "MARGIN";
    case AdminType.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface GenesisState {
  adminAccounts: AdminAccount[];
}

export interface AdminAccount {
  adminType: AdminType;
  adminAddress: string;
}

function createBaseGenesisState(): GenesisState {
  return { adminAccounts: [] };
}

export const GenesisState = {
  encode(
    message: GenesisState,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    for (const v of message.adminAccounts) {
      AdminAccount.encode(v!, writer.uint32(10).fork()).ldelim();
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
          message.adminAccounts.push(
            AdminAccount.decode(reader, reader.uint32()),
          );
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
      adminAccounts: Array.isArray(object?.adminAccounts)
        ? object.adminAccounts.map((e: any) => AdminAccount.fromJSON(e))
        : [],
    };
  },

  toJSON(message: GenesisState): unknown {
    const obj: any = {};
    if (message.adminAccounts) {
      obj.adminAccounts = message.adminAccounts.map((e) =>
        e ? AdminAccount.toJSON(e) : undefined,
      );
    } else {
      obj.adminAccounts = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<GenesisState>, I>>(
    object: I,
  ): GenesisState {
    const message = createBaseGenesisState();
    message.adminAccounts =
      object.adminAccounts?.map((e) => AdminAccount.fromPartial(e)) || [];
    return message;
  },
};

function createBaseAdminAccount(): AdminAccount {
  return { adminType: 0, adminAddress: "" };
}

export const AdminAccount = {
  encode(
    message: AdminAccount,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.adminType !== 0) {
      writer.uint32(8).int32(message.adminType);
    }
    if (message.adminAddress !== "") {
      writer.uint32(18).string(message.adminAddress);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AdminAccount {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAdminAccount();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.adminType = reader.int32() as any;
          break;
        case 2:
          message.adminAddress = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): AdminAccount {
    return {
      adminType: isSet(object.adminType)
        ? adminTypeFromJSON(object.adminType)
        : 0,
      adminAddress: isSet(object.adminAddress)
        ? String(object.adminAddress)
        : "",
    };
  },

  toJSON(message: AdminAccount): unknown {
    const obj: any = {};
    message.adminType !== undefined &&
      (obj.adminType = adminTypeToJSON(message.adminType));
    message.adminAddress !== undefined &&
      (obj.adminAddress = message.adminAddress);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<AdminAccount>, I>>(
    object: I,
  ): AdminAccount {
    const message = createBaseAdminAccount();
    message.adminType = object.adminType ?? 0;
    message.adminAddress = object.adminAddress ?? "";
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
