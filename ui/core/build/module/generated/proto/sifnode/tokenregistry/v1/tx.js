/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";
import { RegistryEntry, Registry, } from "../../../sifnode/tokenregistry/v1/types";
export const protobufPackage = "sifnode.tokenregistry.v1";
const baseMsgRegister = { from: "" };
export const MsgRegister = {
    encode(message, writer = _m0.Writer.create()) {
        if (message.from !== "") {
            writer.uint32(10).string(message.from);
        }
        if (message.entry !== undefined) {
            RegistryEntry.encode(message.entry, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = Object.assign({}, baseMsgRegister);
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
    fromJSON(object) {
        const message = Object.assign({}, baseMsgRegister);
        if (object.from !== undefined && object.from !== null) {
            message.from = String(object.from);
        }
        else {
            message.from = "";
        }
        if (object.entry !== undefined && object.entry !== null) {
            message.entry = RegistryEntry.fromJSON(object.entry);
        }
        else {
            message.entry = undefined;
        }
        return message;
    },
    toJSON(message) {
        const obj = {};
        message.from !== undefined && (obj.from = message.from);
        message.entry !== undefined &&
            (obj.entry = message.entry
                ? RegistryEntry.toJSON(message.entry)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = Object.assign({}, baseMsgRegister);
        if (object.from !== undefined && object.from !== null) {
            message.from = object.from;
        }
        else {
            message.from = "";
        }
        if (object.entry !== undefined && object.entry !== null) {
            message.entry = RegistryEntry.fromPartial(object.entry);
        }
        else {
            message.entry = undefined;
        }
        return message;
    },
};
const baseMsgRegisterResponse = {};
export const MsgRegisterResponse = {
    encode(_, writer = _m0.Writer.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = Object.assign({}, baseMsgRegisterResponse);
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
    fromJSON(_) {
        const message = Object.assign({}, baseMsgRegisterResponse);
        return message;
    },
    toJSON(_) {
        const obj = {};
        return obj;
    },
    fromPartial(_) {
        const message = Object.assign({}, baseMsgRegisterResponse);
        return message;
    },
};
const baseMsgSetRegistry = { from: "" };
export const MsgSetRegistry = {
    encode(message, writer = _m0.Writer.create()) {
        if (message.from !== "") {
            writer.uint32(10).string(message.from);
        }
        if (message.registry !== undefined) {
            Registry.encode(message.registry, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = Object.assign({}, baseMsgSetRegistry);
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
    fromJSON(object) {
        const message = Object.assign({}, baseMsgSetRegistry);
        if (object.from !== undefined && object.from !== null) {
            message.from = String(object.from);
        }
        else {
            message.from = "";
        }
        if (object.registry !== undefined && object.registry !== null) {
            message.registry = Registry.fromJSON(object.registry);
        }
        else {
            message.registry = undefined;
        }
        return message;
    },
    toJSON(message) {
        const obj = {};
        message.from !== undefined && (obj.from = message.from);
        message.registry !== undefined &&
            (obj.registry = message.registry
                ? Registry.toJSON(message.registry)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = Object.assign({}, baseMsgSetRegistry);
        if (object.from !== undefined && object.from !== null) {
            message.from = object.from;
        }
        else {
            message.from = "";
        }
        if (object.registry !== undefined && object.registry !== null) {
            message.registry = Registry.fromPartial(object.registry);
        }
        else {
            message.registry = undefined;
        }
        return message;
    },
};
const baseMsgSetRegistryResponse = {};
export const MsgSetRegistryResponse = {
    encode(_, writer = _m0.Writer.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = Object.assign({}, baseMsgSetRegistryResponse);
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
    fromJSON(_) {
        const message = Object.assign({}, baseMsgSetRegistryResponse);
        return message;
    },
    toJSON(_) {
        const obj = {};
        return obj;
    },
    fromPartial(_) {
        const message = Object.assign({}, baseMsgSetRegistryResponse);
        return message;
    },
};
const baseMsgDeregister = { from: "", denom: "" };
export const MsgDeregister = {
    encode(message, writer = _m0.Writer.create()) {
        if (message.from !== "") {
            writer.uint32(10).string(message.from);
        }
        if (message.denom !== "") {
            writer.uint32(18).string(message.denom);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = Object.assign({}, baseMsgDeregister);
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
    fromJSON(object) {
        const message = Object.assign({}, baseMsgDeregister);
        if (object.from !== undefined && object.from !== null) {
            message.from = String(object.from);
        }
        else {
            message.from = "";
        }
        if (object.denom !== undefined && object.denom !== null) {
            message.denom = String(object.denom);
        }
        else {
            message.denom = "";
        }
        return message;
    },
    toJSON(message) {
        const obj = {};
        message.from !== undefined && (obj.from = message.from);
        message.denom !== undefined && (obj.denom = message.denom);
        return obj;
    },
    fromPartial(object) {
        const message = Object.assign({}, baseMsgDeregister);
        if (object.from !== undefined && object.from !== null) {
            message.from = object.from;
        }
        else {
            message.from = "";
        }
        if (object.denom !== undefined && object.denom !== null) {
            message.denom = object.denom;
        }
        else {
            message.denom = "";
        }
        return message;
    },
};
const baseMsgDeregisterResponse = {};
export const MsgDeregisterResponse = {
    encode(_, writer = _m0.Writer.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = Object.assign({}, baseMsgDeregisterResponse);
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
    fromJSON(_) {
        const message = Object.assign({}, baseMsgDeregisterResponse);
        return message;
    },
    toJSON(_) {
        const obj = {};
        return obj;
    },
    fromPartial(_) {
        const message = Object.assign({}, baseMsgDeregisterResponse);
        return message;
    },
};
export class MsgClientImpl {
    constructor(rpc) {
        this.rpc = rpc;
        this.Register = this.Register.bind(this);
        this.Deregister = this.Deregister.bind(this);
        this.SetRegistry = this.SetRegistry.bind(this);
    }
    Register(request) {
        const data = MsgRegister.encode(request).finish();
        const promise = this.rpc.request("sifnode.tokenregistry.v1.Msg", "Register", data);
        return promise.then((data) => MsgRegisterResponse.decode(new _m0.Reader(data)));
    }
    Deregister(request) {
        const data = MsgDeregister.encode(request).finish();
        const promise = this.rpc.request("sifnode.tokenregistry.v1.Msg", "Deregister", data);
        return promise.then((data) => MsgDeregisterResponse.decode(new _m0.Reader(data)));
    }
    SetRegistry(request) {
        const data = MsgSetRegistry.encode(request).finish();
        const promise = this.rpc.request("sifnode.tokenregistry.v1.Msg", "SetRegistry", data);
        return promise.then((data) => MsgSetRegistryResponse.decode(new _m0.Reader(data)));
    }
}
if (_m0.util.Long !== Long) {
    _m0.util.Long = Long;
    _m0.configure();
}
//# sourceMappingURL=tx.js.map