/* eslint-disable */
import { RegistryEntry, Registry } from "./types";
import Long from "long";
import _m0 from "protobufjs/minimal";

export const protobufPackage = "sifnode.tokenregistry.v1";

export interface MsgRegister {
  from: string;
  entry?: RegistryEntry;
}

export interface MsgRegisterResponse {}

export interface MsgSetRegistry {
  from: string;
  registry?: Registry;
}

export interface MsgSetRegistryResponse {}

export interface MsgDeregister {
  from: string;
  denom: string;
}

export interface MsgDeregisterResponse {}

function createBaseMsgRegister(): MsgRegister {
  return { from: "", entry: undefined };
}

export const MsgRegister = {
  encode(
    message: MsgRegister,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.from !== "") {
      writer.uint32(10).string(message.from);
    }
    if (message.entry !== undefined) {
      RegistryEntry.encode(message.entry, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgRegister {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgRegister();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.from = reader.string();
          break;
        case 2:
          message.entry = RegistryEntry.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgRegister {
    return {
      from: isSet(object.from) ? String(object.from) : "",
      entry: isSet(object.entry)
        ? RegistryEntry.fromJSON(object.entry)
        : undefined,
    };
  },

  toJSON(message: MsgRegister): unknown {
    const obj: any = {};
    message.from !== undefined && (obj.from = message.from);
    message.entry !== undefined &&
      (obj.entry = message.entry
        ? RegistryEntry.toJSON(message.entry)
        : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgRegister>, I>>(
    object: I,
  ): MsgRegister {
    const message = createBaseMsgRegister();
    message.from = object.from ?? "";
    message.entry =
      object.entry !== undefined && object.entry !== null
        ? RegistryEntry.fromPartial(object.entry)
        : undefined;
    return message;
  },
};

function createBaseMsgRegisterResponse(): MsgRegisterResponse {
  return {};
}

export const MsgRegisterResponse = {
  encode(
    _: MsgRegisterResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgRegisterResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgRegisterResponse();
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

  fromJSON(_: any): MsgRegisterResponse {
    return {};
  },

  toJSON(_: MsgRegisterResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgRegisterResponse>, I>>(
    _: I,
  ): MsgRegisterResponse {
    const message = createBaseMsgRegisterResponse();
    return message;
  },
};

function createBaseMsgSetRegistry(): MsgSetRegistry {
  return { from: "", registry: undefined };
}

export const MsgSetRegistry = {
  encode(
    message: MsgSetRegistry,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.from !== "") {
      writer.uint32(10).string(message.from);
    }
    if (message.registry !== undefined) {
      Registry.encode(message.registry, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgSetRegistry {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSetRegistry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.from = reader.string();
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

  fromJSON(object: any): MsgSetRegistry {
    return {
      from: isSet(object.from) ? String(object.from) : "",
      registry: isSet(object.registry)
        ? Registry.fromJSON(object.registry)
        : undefined,
    };
  },

  toJSON(message: MsgSetRegistry): unknown {
    const obj: any = {};
    message.from !== undefined && (obj.from = message.from);
    message.registry !== undefined &&
      (obj.registry = message.registry
        ? Registry.toJSON(message.registry)
        : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgSetRegistry>, I>>(
    object: I,
  ): MsgSetRegistry {
    const message = createBaseMsgSetRegistry();
    message.from = object.from ?? "";
    message.registry =
      object.registry !== undefined && object.registry !== null
        ? Registry.fromPartial(object.registry)
        : undefined;
    return message;
  },
};

function createBaseMsgSetRegistryResponse(): MsgSetRegistryResponse {
  return {};
}

export const MsgSetRegistryResponse = {
  encode(
    _: MsgSetRegistryResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): MsgSetRegistryResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSetRegistryResponse();
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

  fromJSON(_: any): MsgSetRegistryResponse {
    return {};
  },

  toJSON(_: MsgSetRegistryResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgSetRegistryResponse>, I>>(
    _: I,
  ): MsgSetRegistryResponse {
    const message = createBaseMsgSetRegistryResponse();
    return message;
  },
};

function createBaseMsgDeregister(): MsgDeregister {
  return { from: "", denom: "" };
}

export const MsgDeregister = {
  encode(
    message: MsgDeregister,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.from !== "") {
      writer.uint32(10).string(message.from);
    }
    if (message.denom !== "") {
      writer.uint32(18).string(message.denom);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgDeregister {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgDeregister();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.from = reader.string();
          break;
        case 2:
          message.denom = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgDeregister {
    return {
      from: isSet(object.from) ? String(object.from) : "",
      denom: isSet(object.denom) ? String(object.denom) : "",
    };
  },

  toJSON(message: MsgDeregister): unknown {
    const obj: any = {};
    message.from !== undefined && (obj.from = message.from);
    message.denom !== undefined && (obj.denom = message.denom);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgDeregister>, I>>(
    object: I,
  ): MsgDeregister {
    const message = createBaseMsgDeregister();
    message.from = object.from ?? "";
    message.denom = object.denom ?? "";
    return message;
  },
};

function createBaseMsgDeregisterResponse(): MsgDeregisterResponse {
  return {};
}

export const MsgDeregisterResponse = {
  encode(
    _: MsgDeregisterResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): MsgDeregisterResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgDeregisterResponse();
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

  fromJSON(_: any): MsgDeregisterResponse {
    return {};
  },

  toJSON(_: MsgDeregisterResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgDeregisterResponse>, I>>(
    _: I,
  ): MsgDeregisterResponse {
    const message = createBaseMsgDeregisterResponse();
    return message;
  },
};

export interface Msg {
  Register(request: MsgRegister): Promise<MsgRegisterResponse>;
  Deregister(request: MsgDeregister): Promise<MsgDeregisterResponse>;
  SetRegistry(request: MsgSetRegistry): Promise<MsgSetRegistryResponse>;
}

export class MsgClientImpl implements Msg {
  private readonly rpc: Rpc;
  constructor(rpc: Rpc) {
    this.rpc = rpc;
    this.Register = this.Register.bind(this);
    this.Deregister = this.Deregister.bind(this);
    this.SetRegistry = this.SetRegistry.bind(this);
  }
  Register(request: MsgRegister): Promise<MsgRegisterResponse> {
    const data = MsgRegister.encode(request).finish();
    const promise = this.rpc.request(
      "sifnode.tokenregistry.v1.Msg",
      "Register",
      data,
    );
    return promise.then((data) =>
      MsgRegisterResponse.decode(new _m0.Reader(data)),
    );
  }

  Deregister(request: MsgDeregister): Promise<MsgDeregisterResponse> {
    const data = MsgDeregister.encode(request).finish();
    const promise = this.rpc.request(
      "sifnode.tokenregistry.v1.Msg",
      "Deregister",
      data,
    );
    return promise.then((data) =>
      MsgDeregisterResponse.decode(new _m0.Reader(data)),
    );
  }

  SetRegistry(request: MsgSetRegistry): Promise<MsgSetRegistryResponse> {
    const data = MsgSetRegistry.encode(request).finish();
    const promise = this.rpc.request(
      "sifnode.tokenregistry.v1.Msg",
      "SetRegistry",
      data,
    );
    return promise.then((data) =>
      MsgSetRegistryResponse.decode(new _m0.Reader(data)),
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
