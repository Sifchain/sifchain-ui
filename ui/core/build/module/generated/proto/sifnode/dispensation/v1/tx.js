/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";
import {
  distributionTypeFromJSON,
  distributionTypeToJSON,
} from "../../../sifnode/dispensation/v1/types";
export const protobufPackage = "sifnode.dispensation.v1";
const baseMsgCreateDistribution = {
  distributor: "",
  authorizedRunner: "",
  distributionType: 0,
  output: "",
};
export const MsgCreateDistribution = {
  encode(message, writer = _m0.Writer.create()) {
    if (message.distributor !== "") {
      writer.uint32(10).string(message.distributor);
    }
    if (message.authorizedRunner !== "") {
      writer.uint32(18).string(message.authorizedRunner);
    }
    if (message.distributionType !== 0) {
      writer.uint32(24).int32(message.distributionType);
    }
    for (const v of message.output) {
      writer.uint32(34).string(v);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = Object.assign({}, baseMsgCreateDistribution);
    message.output = [];
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.distributor = reader.string();
          break;
        case 2:
          message.authorizedRunner = reader.string();
          break;
        case 3:
          message.distributionType = reader.int32();
          break;
        case 4:
          message.output.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object) {
    const message = Object.assign({}, baseMsgCreateDistribution);
    message.output = [];
    if (object.distributor !== undefined && object.distributor !== null) {
      message.distributor = String(object.distributor);
    } else {
      message.distributor = "";
    }
    if (
      object.authorizedRunner !== undefined &&
      object.authorizedRunner !== null
    ) {
      message.authorizedRunner = String(object.authorizedRunner);
    } else {
      message.authorizedRunner = "";
    }
    if (
      object.distributionType !== undefined &&
      object.distributionType !== null
    ) {
      message.distributionType = distributionTypeFromJSON(
        object.distributionType,
      );
    } else {
      message.distributionType = 0;
    }
    if (object.output !== undefined && object.output !== null) {
      for (const e of object.output) {
        message.output.push(String(e));
      }
    }
    return message;
  },
  toJSON(message) {
    const obj = {};
    message.distributor !== undefined &&
      (obj.distributor = message.distributor);
    message.authorizedRunner !== undefined &&
      (obj.authorizedRunner = message.authorizedRunner);
    message.distributionType !== undefined &&
      (obj.distributionType = distributionTypeToJSON(message.distributionType));
    if (message.output) {
      obj.output = message.output.map((e) => e);
    } else {
      obj.output = [];
    }
    return obj;
  },
  fromPartial(object) {
    const message = Object.assign({}, baseMsgCreateDistribution);
    message.output = [];
    if (object.distributor !== undefined && object.distributor !== null) {
      message.distributor = object.distributor;
    } else {
      message.distributor = "";
    }
    if (
      object.authorizedRunner !== undefined &&
      object.authorizedRunner !== null
    ) {
      message.authorizedRunner = object.authorizedRunner;
    } else {
      message.authorizedRunner = "";
    }
    if (
      object.distributionType !== undefined &&
      object.distributionType !== null
    ) {
      message.distributionType = object.distributionType;
    } else {
      message.distributionType = 0;
    }
    if (object.output !== undefined && object.output !== null) {
      for (const e of object.output) {
        message.output.push(e);
      }
    }
    return message;
  },
};
const baseMsgCreateDistributionResponse = {};
export const MsgCreateDistributionResponse = {
  encode(_, writer = _m0.Writer.create()) {
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = Object.assign({}, baseMsgCreateDistributionResponse);
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
    const message = Object.assign({}, baseMsgCreateDistributionResponse);
    return message;
  },
  toJSON(_) {
    const obj = {};
    return obj;
  },
  fromPartial(_) {
    const message = Object.assign({}, baseMsgCreateDistributionResponse);
    return message;
  },
};
const baseMsgCreateClaimResponse = {};
export const MsgCreateClaimResponse = {
  encode(_, writer = _m0.Writer.create()) {
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = Object.assign({}, baseMsgCreateClaimResponse);
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
    const message = Object.assign({}, baseMsgCreateClaimResponse);
    return message;
  },
  toJSON(_) {
    const obj = {};
    return obj;
  },
  fromPartial(_) {
    const message = Object.assign({}, baseMsgCreateClaimResponse);
    return message;
  },
};
const baseMsgRunDistributionResponse = {};
export const MsgRunDistributionResponse = {
  encode(_, writer = _m0.Writer.create()) {
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = Object.assign({}, baseMsgRunDistributionResponse);
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
    const message = Object.assign({}, baseMsgRunDistributionResponse);
    return message;
  },
  toJSON(_) {
    const obj = {};
    return obj;
  },
  fromPartial(_) {
    const message = Object.assign({}, baseMsgRunDistributionResponse);
    return message;
  },
};
const baseMsgCreateUserClaim = {
  userClaimAddress: "",
  userClaimType: 0,
};
export const MsgCreateUserClaim = {
  encode(message, writer = _m0.Writer.create()) {
    if (message.userClaimAddress !== "") {
      writer.uint32(10).string(message.userClaimAddress);
    }
    if (message.userClaimType !== 0) {
      writer.uint32(16).int32(message.userClaimType);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = Object.assign({}, baseMsgCreateUserClaim);
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.userClaimAddress = reader.string();
          break;
        case 2:
          message.userClaimType = reader.int32();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object) {
    const message = Object.assign({}, baseMsgCreateUserClaim);
    if (
      object.userClaimAddress !== undefined &&
      object.userClaimAddress !== null
    ) {
      message.userClaimAddress = String(object.userClaimAddress);
    } else {
      message.userClaimAddress = "";
    }
    if (object.userClaimType !== undefined && object.userClaimType !== null) {
      message.userClaimType = distributionTypeFromJSON(object.userClaimType);
    } else {
      message.userClaimType = 0;
    }
    return message;
  },
  toJSON(message) {
    const obj = {};
    message.userClaimAddress !== undefined &&
      (obj.userClaimAddress = message.userClaimAddress);
    message.userClaimType !== undefined &&
      (obj.userClaimType = distributionTypeToJSON(message.userClaimType));
    return obj;
  },
  fromPartial(object) {
    const message = Object.assign({}, baseMsgCreateUserClaim);
    if (
      object.userClaimAddress !== undefined &&
      object.userClaimAddress !== null
    ) {
      message.userClaimAddress = object.userClaimAddress;
    } else {
      message.userClaimAddress = "";
    }
    if (object.userClaimType !== undefined && object.userClaimType !== null) {
      message.userClaimType = object.userClaimType;
    } else {
      message.userClaimType = 0;
    }
    return message;
  },
};
const baseMsgRunDistribution = {
  authorizedRunner: "",
  distributionName: "",
  distributionType: 0,
};
export const MsgRunDistribution = {
  encode(message, writer = _m0.Writer.create()) {
    if (message.authorizedRunner !== "") {
      writer.uint32(10).string(message.authorizedRunner);
    }
    if (message.distributionName !== "") {
      writer.uint32(18).string(message.distributionName);
    }
    if (message.distributionType !== 0) {
      writer.uint32(24).int32(message.distributionType);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = Object.assign({}, baseMsgRunDistribution);
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.authorizedRunner = reader.string();
          break;
        case 2:
          message.distributionName = reader.string();
          break;
        case 3:
          message.distributionType = reader.int32();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object) {
    const message = Object.assign({}, baseMsgRunDistribution);
    if (
      object.authorizedRunner !== undefined &&
      object.authorizedRunner !== null
    ) {
      message.authorizedRunner = String(object.authorizedRunner);
    } else {
      message.authorizedRunner = "";
    }
    if (
      object.distributionName !== undefined &&
      object.distributionName !== null
    ) {
      message.distributionName = String(object.distributionName);
    } else {
      message.distributionName = "";
    }
    if (
      object.distributionType !== undefined &&
      object.distributionType !== null
    ) {
      message.distributionType = distributionTypeFromJSON(
        object.distributionType,
      );
    } else {
      message.distributionType = 0;
    }
    return message;
  },
  toJSON(message) {
    const obj = {};
    message.authorizedRunner !== undefined &&
      (obj.authorizedRunner = message.authorizedRunner);
    message.distributionName !== undefined &&
      (obj.distributionName = message.distributionName);
    message.distributionType !== undefined &&
      (obj.distributionType = distributionTypeToJSON(message.distributionType));
    return obj;
  },
  fromPartial(object) {
    const message = Object.assign({}, baseMsgRunDistribution);
    if (
      object.authorizedRunner !== undefined &&
      object.authorizedRunner !== null
    ) {
      message.authorizedRunner = object.authorizedRunner;
    } else {
      message.authorizedRunner = "";
    }
    if (
      object.distributionName !== undefined &&
      object.distributionName !== null
    ) {
      message.distributionName = object.distributionName;
    } else {
      message.distributionName = "";
    }
    if (
      object.distributionType !== undefined &&
      object.distributionType !== null
    ) {
      message.distributionType = object.distributionType;
    } else {
      message.distributionType = 0;
    }
    return message;
  },
};
export class MsgClientImpl {
  constructor(rpc) {
    this.rpc = rpc;
    this.CreateDistribution = this.CreateDistribution.bind(this);
    this.CreateUserClaim = this.CreateUserClaim.bind(this);
    this.RunDistribution = this.RunDistribution.bind(this);
  }
  CreateDistribution(request) {
    const data = MsgCreateDistribution.encode(request).finish();
    const promise = this.rpc.request(
      "sifnode.dispensation.v1.Msg",
      "CreateDistribution",
      data,
    );
    return promise.then((data) =>
      MsgCreateDistributionResponse.decode(new _m0.Reader(data)),
    );
  }
  CreateUserClaim(request) {
    const data = MsgCreateUserClaim.encode(request).finish();
    const promise = this.rpc.request(
      "sifnode.dispensation.v1.Msg",
      "CreateUserClaim",
      data,
    );
    return promise.then((data) =>
      MsgCreateClaimResponse.decode(new _m0.Reader(data)),
    );
  }
  RunDistribution(request) {
    const data = MsgRunDistribution.encode(request).finish();
    const promise = this.rpc.request(
      "sifnode.dispensation.v1.Msg",
      "RunDistribution",
      data,
    );
    return promise.then((data) =>
      MsgRunDistributionResponse.decode(new _m0.Reader(data)),
    );
  }
}
if (_m0.util.Long !== Long) {
  _m0.util.Long = Long;
  _m0.configure();
}
//# sourceMappingURL=tx.js.map
