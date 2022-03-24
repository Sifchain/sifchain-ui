/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";
import { Status } from "../../../sifnode/oracle/v1/types";
import { EthBridgeClaim } from "../../../sifnode/ethbridge/v1/types";
export const protobufPackage = "sifnode.ethbridge.v1";
const baseQueryEthProphecyRequest = {
    ethereumChainId: Long.ZERO,
    bridgeContractAddress: "",
    nonce: Long.ZERO,
    symbol: "",
    tokenContractAddress: "",
    ethereumSender: "",
};
export const QueryEthProphecyRequest = {
    encode(message, writer = _m0.Writer.create()) {
        if (!message.ethereumChainId.isZero()) {
            writer.uint32(8).int64(message.ethereumChainId);
        }
        if (message.bridgeContractAddress !== "") {
            writer.uint32(18).string(message.bridgeContractAddress);
        }
        if (!message.nonce.isZero()) {
            writer.uint32(24).int64(message.nonce);
        }
        if (message.symbol !== "") {
            writer.uint32(34).string(message.symbol);
        }
        if (message.tokenContractAddress !== "") {
            writer.uint32(42).string(message.tokenContractAddress);
        }
        if (message.ethereumSender !== "") {
            writer.uint32(50).string(message.ethereumSender);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = Object.assign({}, baseQueryEthProphecyRequest);
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.ethereumChainId = reader.int64();
                    break;
                case 2:
                    message.bridgeContractAddress = reader.string();
                    break;
                case 3:
                    message.nonce = reader.int64();
                    break;
                case 4:
                    message.symbol = reader.string();
                    break;
                case 5:
                    message.tokenContractAddress = reader.string();
                    break;
                case 6:
                    message.ethereumSender = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        const message = Object.assign({}, baseQueryEthProphecyRequest);
        if (object.ethereumChainId !== undefined &&
            object.ethereumChainId !== null) {
            message.ethereumChainId = Long.fromString(object.ethereumChainId);
        }
        else {
            message.ethereumChainId = Long.ZERO;
        }
        if (object.bridgeContractAddress !== undefined &&
            object.bridgeContractAddress !== null) {
            message.bridgeContractAddress = String(object.bridgeContractAddress);
        }
        else {
            message.bridgeContractAddress = "";
        }
        if (object.nonce !== undefined && object.nonce !== null) {
            message.nonce = Long.fromString(object.nonce);
        }
        else {
            message.nonce = Long.ZERO;
        }
        if (object.symbol !== undefined && object.symbol !== null) {
            message.symbol = String(object.symbol);
        }
        else {
            message.symbol = "";
        }
        if (object.tokenContractAddress !== undefined &&
            object.tokenContractAddress !== null) {
            message.tokenContractAddress = String(object.tokenContractAddress);
        }
        else {
            message.tokenContractAddress = "";
        }
        if (object.ethereumSender !== undefined && object.ethereumSender !== null) {
            message.ethereumSender = String(object.ethereumSender);
        }
        else {
            message.ethereumSender = "";
        }
        return message;
    },
    toJSON(message) {
        const obj = {};
        message.ethereumChainId !== undefined &&
            (obj.ethereumChainId = (message.ethereumChainId || Long.ZERO).toString());
        message.bridgeContractAddress !== undefined &&
            (obj.bridgeContractAddress = message.bridgeContractAddress);
        message.nonce !== undefined &&
            (obj.nonce = (message.nonce || Long.ZERO).toString());
        message.symbol !== undefined && (obj.symbol = message.symbol);
        message.tokenContractAddress !== undefined &&
            (obj.tokenContractAddress = message.tokenContractAddress);
        message.ethereumSender !== undefined &&
            (obj.ethereumSender = message.ethereumSender);
        return obj;
    },
    fromPartial(object) {
        const message = Object.assign({}, baseQueryEthProphecyRequest);
        if (object.ethereumChainId !== undefined &&
            object.ethereumChainId !== null) {
            message.ethereumChainId = object.ethereumChainId;
        }
        else {
            message.ethereumChainId = Long.ZERO;
        }
        if (object.bridgeContractAddress !== undefined &&
            object.bridgeContractAddress !== null) {
            message.bridgeContractAddress = object.bridgeContractAddress;
        }
        else {
            message.bridgeContractAddress = "";
        }
        if (object.nonce !== undefined && object.nonce !== null) {
            message.nonce = object.nonce;
        }
        else {
            message.nonce = Long.ZERO;
        }
        if (object.symbol !== undefined && object.symbol !== null) {
            message.symbol = object.symbol;
        }
        else {
            message.symbol = "";
        }
        if (object.tokenContractAddress !== undefined &&
            object.tokenContractAddress !== null) {
            message.tokenContractAddress = object.tokenContractAddress;
        }
        else {
            message.tokenContractAddress = "";
        }
        if (object.ethereumSender !== undefined && object.ethereumSender !== null) {
            message.ethereumSender = object.ethereumSender;
        }
        else {
            message.ethereumSender = "";
        }
        return message;
    },
};
const baseQueryEthProphecyResponse = { id: "" };
export const QueryEthProphecyResponse = {
    encode(message, writer = _m0.Writer.create()) {
        if (message.id !== "") {
            writer.uint32(10).string(message.id);
        }
        if (message.status !== undefined) {
            Status.encode(message.status, writer.uint32(18).fork()).ldelim();
        }
        for (const v of message.claims) {
            EthBridgeClaim.encode(v, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = Object.assign({}, baseQueryEthProphecyResponse);
        message.claims = [];
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.id = reader.string();
                    break;
                case 2:
                    message.status = Status.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.claims.push(EthBridgeClaim.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        const message = Object.assign({}, baseQueryEthProphecyResponse);
        message.claims = [];
        if (object.id !== undefined && object.id !== null) {
            message.id = String(object.id);
        }
        else {
            message.id = "";
        }
        if (object.status !== undefined && object.status !== null) {
            message.status = Status.fromJSON(object.status);
        }
        else {
            message.status = undefined;
        }
        if (object.claims !== undefined && object.claims !== null) {
            for (const e of object.claims) {
                message.claims.push(EthBridgeClaim.fromJSON(e));
            }
        }
        return message;
    },
    toJSON(message) {
        const obj = {};
        message.id !== undefined && (obj.id = message.id);
        message.status !== undefined &&
            (obj.status = message.status ? Status.toJSON(message.status) : undefined);
        if (message.claims) {
            obj.claims = message.claims.map((e) => e ? EthBridgeClaim.toJSON(e) : undefined);
        }
        else {
            obj.claims = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = Object.assign({}, baseQueryEthProphecyResponse);
        message.claims = [];
        if (object.id !== undefined && object.id !== null) {
            message.id = object.id;
        }
        else {
            message.id = "";
        }
        if (object.status !== undefined && object.status !== null) {
            message.status = Status.fromPartial(object.status);
        }
        else {
            message.status = undefined;
        }
        if (object.claims !== undefined && object.claims !== null) {
            for (const e of object.claims) {
                message.claims.push(EthBridgeClaim.fromPartial(e));
            }
        }
        return message;
    },
};
export class QueryClientImpl {
    constructor(rpc) {
        this.rpc = rpc;
        this.EthProphecy = this.EthProphecy.bind(this);
    }
    EthProphecy(request) {
        const data = QueryEthProphecyRequest.encode(request).finish();
        const promise = this.rpc.request("sifnode.ethbridge.v1.Query", "EthProphecy", data);
        return promise.then((data) => QueryEthProphecyResponse.decode(new _m0.Reader(data)));
    }
}
if (_m0.util.Long !== Long) {
    _m0.util.Long = Long;
    _m0.configure();
}
//# sourceMappingURL=query.js.map