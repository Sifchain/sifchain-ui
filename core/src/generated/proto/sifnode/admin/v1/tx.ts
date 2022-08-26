/* eslint-disable */
import { AdminAccount } from "./types";
import Long from "long";
import _m0 from "protobufjs/minimal";

export const protobufPackage = "sifnode.admin.v1";

export interface MsgAddAccount {
  signer: string;
  account?: AdminAccount;
}

export interface MsgAddAccountResponse {}

export interface MsgRemoveAccount {
  signer: string;
  account?: AdminAccount;
}

export interface MsgRemoveAccountResponse {}

function createBaseMsgAddAccount(): MsgAddAccount {
  return { signer: "", account: undefined };
}

export const MsgAddAccount = {
  encode(
    message: MsgAddAccount,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.signer !== "") {
      writer.uint32(10).string(message.signer);
    }
    if (message.account !== undefined) {
      AdminAccount.encode(message.account, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgAddAccount {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgAddAccount();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.signer = reader.string();
          break;
        case 2:
          message.account = AdminAccount.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgAddAccount {
    return {
      signer: isSet(object.signer) ? String(object.signer) : "",
      account: isSet(object.account)
        ? AdminAccount.fromJSON(object.account)
        : undefined,
    };
  },

  toJSON(message: MsgAddAccount): unknown {
    const obj: any = {};
    message.signer !== undefined && (obj.signer = message.signer);
    message.account !== undefined &&
      (obj.account = message.account
        ? AdminAccount.toJSON(message.account)
        : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgAddAccount>, I>>(
    object: I,
  ): MsgAddAccount {
    const message = createBaseMsgAddAccount();
    message.signer = object.signer ?? "";
    message.account =
      object.account !== undefined && object.account !== null
        ? AdminAccount.fromPartial(object.account)
        : undefined;
    return message;
  },
};

function createBaseMsgAddAccountResponse(): MsgAddAccountResponse {
  return {};
}

export const MsgAddAccountResponse = {
  encode(
    _: MsgAddAccountResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): MsgAddAccountResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgAddAccountResponse();
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

  fromJSON(_: any): MsgAddAccountResponse {
    return {};
  },

  toJSON(_: MsgAddAccountResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgAddAccountResponse>, I>>(
    _: I,
  ): MsgAddAccountResponse {
    const message = createBaseMsgAddAccountResponse();
    return message;
  },
};

function createBaseMsgRemoveAccount(): MsgRemoveAccount {
  return { signer: "", account: undefined };
}

export const MsgRemoveAccount = {
  encode(
    message: MsgRemoveAccount,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.signer !== "") {
      writer.uint32(10).string(message.signer);
    }
    if (message.account !== undefined) {
      AdminAccount.encode(message.account, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgRemoveAccount {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgRemoveAccount();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.signer = reader.string();
          break;
        case 2:
          message.account = AdminAccount.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgRemoveAccount {
    return {
      signer: isSet(object.signer) ? String(object.signer) : "",
      account: isSet(object.account)
        ? AdminAccount.fromJSON(object.account)
        : undefined,
    };
  },

  toJSON(message: MsgRemoveAccount): unknown {
    const obj: any = {};
    message.signer !== undefined && (obj.signer = message.signer);
    message.account !== undefined &&
      (obj.account = message.account
        ? AdminAccount.toJSON(message.account)
        : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgRemoveAccount>, I>>(
    object: I,
  ): MsgRemoveAccount {
    const message = createBaseMsgRemoveAccount();
    message.signer = object.signer ?? "";
    message.account =
      object.account !== undefined && object.account !== null
        ? AdminAccount.fromPartial(object.account)
        : undefined;
    return message;
  },
};

function createBaseMsgRemoveAccountResponse(): MsgRemoveAccountResponse {
  return {};
}

export const MsgRemoveAccountResponse = {
  encode(
    _: MsgRemoveAccountResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): MsgRemoveAccountResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgRemoveAccountResponse();
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

  fromJSON(_: any): MsgRemoveAccountResponse {
    return {};
  },

  toJSON(_: MsgRemoveAccountResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgRemoveAccountResponse>, I>>(
    _: I,
  ): MsgRemoveAccountResponse {
    const message = createBaseMsgRemoveAccountResponse();
    return message;
  },
};

export interface Msg {
  AddAccount(request: MsgAddAccount): Promise<MsgAddAccountResponse>;
  RemoveAccount(request: MsgRemoveAccount): Promise<MsgRemoveAccountResponse>;
}

export class MsgClientImpl implements Msg {
  private readonly rpc: Rpc;
  constructor(rpc: Rpc) {
    this.rpc = rpc;
    this.AddAccount = this.AddAccount.bind(this);
    this.RemoveAccount = this.RemoveAccount.bind(this);
  }
  AddAccount(request: MsgAddAccount): Promise<MsgAddAccountResponse> {
    const data = MsgAddAccount.encode(request).finish();
    const promise = this.rpc.request(
      "sifnode.admin.v1.Msg",
      "AddAccount",
      data,
    );
    return promise.then((data) =>
      MsgAddAccountResponse.decode(new _m0.Reader(data)),
    );
  }

  RemoveAccount(request: MsgRemoveAccount): Promise<MsgRemoveAccountResponse> {
    const data = MsgRemoveAccount.encode(request).finish();
    const promise = this.rpc.request(
      "sifnode.admin.v1.Msg",
      "RemoveAccount",
      data,
    );
    return promise.then((data) =>
      MsgRemoveAccountResponse.decode(new _m0.Reader(data)),
    );
  }
}

interface Rpc {
  request(
    service: string,
    method: string,
    data: Uint8Array,
  ): Promise<Uint8Array>;
}

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
