/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";
import { Registry } from "../../../sifnode/tokenregistry/v1/types";
export const protobufPackage = "sifnode.tokenregistry.v1";
const baseQueryEntriesResponse = {};
export const QueryEntriesResponse = {
    encode(message, writer = _m0.Writer.create()) {
        if (message.registry !== undefined) {
            Registry.encode(message.registry, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = Object.assign({}, baseQueryEntriesResponse);
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
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
        const message = Object.assign({}, baseQueryEntriesResponse);
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
        message.registry !== undefined &&
            (obj.registry = message.registry
                ? Registry.toJSON(message.registry)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = Object.assign({}, baseQueryEntriesResponse);
        if (object.registry !== undefined && object.registry !== null) {
            message.registry = Registry.fromPartial(object.registry);
        }
        else {
            message.registry = undefined;
        }
        return message;
    },
};
const baseQueryEntriesRequest = {};
export const QueryEntriesRequest = {
    encode(_, writer = _m0.Writer.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = Object.assign({}, baseQueryEntriesRequest);
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
        const message = Object.assign({}, baseQueryEntriesRequest);
        return message;
    },
    toJSON(_) {
        const obj = {};
        return obj;
    },
    fromPartial(_) {
        const message = Object.assign({}, baseQueryEntriesRequest);
        return message;
    },
};
export class QueryClientImpl {
    constructor(rpc) {
        this.rpc = rpc;
        this.Entries = this.Entries.bind(this);
    }
    Entries(request) {
        const data = QueryEntriesRequest.encode(request).finish();
        const promise = this.rpc.request("sifnode.tokenregistry.v1.Query", "Entries", data);
        return promise.then((data) => QueryEntriesResponse.decode(new _m0.Reader(data)));
    }
}
if (_m0.util.Long !== Long) {
    _m0.util.Long = Long;
    _m0.configure();
}
//# sourceMappingURL=query.js.map