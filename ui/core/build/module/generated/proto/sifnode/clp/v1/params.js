/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";
export const protobufPackage = "sifnode.clp.v1";
const baseParams = { minCreatePoolThreshold: Long.UZERO };
export const Params = {
    encode(message, writer = _m0.Writer.create()) {
        if (!message.minCreatePoolThreshold.isZero()) {
            writer.uint32(8).uint64(message.minCreatePoolThreshold);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = Object.assign({}, baseParams);
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.minCreatePoolThreshold = reader.uint64();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        const message = Object.assign({}, baseParams);
        if (object.minCreatePoolThreshold !== undefined &&
            object.minCreatePoolThreshold !== null) {
            message.minCreatePoolThreshold = Long.fromString(object.minCreatePoolThreshold);
        }
        else {
            message.minCreatePoolThreshold = Long.UZERO;
        }
        return message;
    },
    toJSON(message) {
        const obj = {};
        message.minCreatePoolThreshold !== undefined &&
            (obj.minCreatePoolThreshold = (message.minCreatePoolThreshold || Long.UZERO).toString());
        return obj;
    },
    fromPartial(object) {
        const message = Object.assign({}, baseParams);
        if (object.minCreatePoolThreshold !== undefined &&
            object.minCreatePoolThreshold !== null) {
            message.minCreatePoolThreshold = object.minCreatePoolThreshold;
        }
        else {
            message.minCreatePoolThreshold = Long.UZERO;
        }
        return message;
    },
};
if (_m0.util.Long !== Long) {
    _m0.util.Long = Long;
    _m0.configure();
}
//# sourceMappingURL=params.js.map