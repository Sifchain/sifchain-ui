/* eslint-disable */
import Long from "long";
import * as _m0 from "protobufjs/minimal";
import { EthBridgeClaim } from "../../../sifnode/ethbridge/v1/types";

export const protobufPackage = "sifnode.ethbridge.v1";

/** MsgLock defines a message for locking coins and triggering a related event */
export interface MsgLock {
  cosmosSender: string;
  amount: string;
  symbol: string;
  ethereumChainId: Long;
  ethereumReceiver: string;
  cethAmount: string;
}

export interface MsgLockResponse {}

/** MsgBurn defines a message for burning coins and triggering a related event */
export interface MsgBurn {
  cosmosSender: string;
  amount: string;
  symbol: string;
  ethereumChainId: Long;
  ethereumReceiver: string;
  cethAmount: string;
}

export interface MsgBurnResponse {}

export interface MsgCreateEthBridgeClaim {
  ethBridgeClaim?: EthBridgeClaim;
}

export interface MsgCreateEthBridgeClaimResponse {}

/** MsgUpdateWhiteListValidator add or remove validator from whitelist */
export interface MsgUpdateWhiteListValidator {
  cosmosSender: string;
  validator: string;
  operationType: string;
}

export interface MsgUpdateWhiteListValidatorResponse {}

export interface MsgUpdateCethReceiverAccount {
  cosmosSender: string;
  cethReceiverAccount: string;
}

export interface MsgUpdateCethReceiverAccountResponse {}

export interface MsgRescueCeth {
  cosmosSender: string;
  cosmosReceiver: string;
  cethAmount: string;
}

export interface MsgRescueCethResponse {}

export interface MsgSetBlacklist {
  from: string;
  addresses: string[];
}

export interface MsgSetBlacklistResponse {}

function createBaseMsgLock(): MsgLock {
  return {
    cosmosSender: "",
    amount: "",
    symbol: "",
    ethereumChainId: Long.ZERO,
    ethereumReceiver: "",
    cethAmount: "",
  };
}

export const MsgLock = {
  encode(
    message: MsgLock,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.cosmosSender !== "") {
      writer.uint32(10).string(message.cosmosSender);
    }
    if (message.amount !== "") {
      writer.uint32(18).string(message.amount);
    }
    if (message.symbol !== "") {
      writer.uint32(26).string(message.symbol);
    }
    if (!message.ethereumChainId.isZero()) {
      writer.uint32(32).int64(message.ethereumChainId);
    }
    if (message.ethereumReceiver !== "") {
      writer.uint32(42).string(message.ethereumReceiver);
    }
    if (message.cethAmount !== "") {
      writer.uint32(50).string(message.cethAmount);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgLock {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgLock();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.cosmosSender = reader.string();
          break;
        case 2:
          message.amount = reader.string();
          break;
        case 3:
          message.symbol = reader.string();
          break;
        case 4:
          message.ethereumChainId = reader.int64() as Long;
          break;
        case 5:
          message.ethereumReceiver = reader.string();
          break;
        case 6:
          message.cethAmount = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgLock {
    return {
      cosmosSender: isSet(object.cosmosSender)
        ? String(object.cosmosSender)
        : "",
      amount: isSet(object.amount) ? String(object.amount) : "",
      symbol: isSet(object.symbol) ? String(object.symbol) : "",
      ethereumChainId: isSet(object.ethereumChainId)
        ? Long.fromString(object.ethereumChainId)
        : Long.ZERO,
      ethereumReceiver: isSet(object.ethereumReceiver)
        ? String(object.ethereumReceiver)
        : "",
      cethAmount: isSet(object.cethAmount) ? String(object.cethAmount) : "",
    };
  },

  toJSON(message: MsgLock): unknown {
    const obj: any = {};
    message.cosmosSender !== undefined &&
      (obj.cosmosSender = message.cosmosSender);
    message.amount !== undefined && (obj.amount = message.amount);
    message.symbol !== undefined && (obj.symbol = message.symbol);
    message.ethereumChainId !== undefined &&
      (obj.ethereumChainId = (message.ethereumChainId || Long.ZERO).toString());
    message.ethereumReceiver !== undefined &&
      (obj.ethereumReceiver = message.ethereumReceiver);
    message.cethAmount !== undefined && (obj.cethAmount = message.cethAmount);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgLock>, I>>(object: I): MsgLock {
    const message = createBaseMsgLock();
    message.cosmosSender = object.cosmosSender ?? "";
    message.amount = object.amount ?? "";
    message.symbol = object.symbol ?? "";
    message.ethereumChainId =
      object.ethereumChainId !== undefined && object.ethereumChainId !== null
        ? Long.fromValue(object.ethereumChainId)
        : Long.ZERO;
    message.ethereumReceiver = object.ethereumReceiver ?? "";
    message.cethAmount = object.cethAmount ?? "";
    return message;
  },
};

function createBaseMsgLockResponse(): MsgLockResponse {
  return {};
}

export const MsgLockResponse = {
  encode(
    _: MsgLockResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgLockResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgLockResponse();
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

  fromJSON(_: any): MsgLockResponse {
    return {};
  },

  toJSON(_: MsgLockResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgLockResponse>, I>>(
    _: I,
  ): MsgLockResponse {
    const message = createBaseMsgLockResponse();
    return message;
  },
};

function createBaseMsgBurn(): MsgBurn {
  return {
    cosmosSender: "",
    amount: "",
    symbol: "",
    ethereumChainId: Long.ZERO,
    ethereumReceiver: "",
    cethAmount: "",
  };
}

export const MsgBurn = {
  encode(
    message: MsgBurn,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.cosmosSender !== "") {
      writer.uint32(10).string(message.cosmosSender);
    }
    if (message.amount !== "") {
      writer.uint32(18).string(message.amount);
    }
    if (message.symbol !== "") {
      writer.uint32(26).string(message.symbol);
    }
    if (!message.ethereumChainId.isZero()) {
      writer.uint32(32).int64(message.ethereumChainId);
    }
    if (message.ethereumReceiver !== "") {
      writer.uint32(42).string(message.ethereumReceiver);
    }
    if (message.cethAmount !== "") {
      writer.uint32(50).string(message.cethAmount);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgBurn {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgBurn();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.cosmosSender = reader.string();
          break;
        case 2:
          message.amount = reader.string();
          break;
        case 3:
          message.symbol = reader.string();
          break;
        case 4:
          message.ethereumChainId = reader.int64() as Long;
          break;
        case 5:
          message.ethereumReceiver = reader.string();
          break;
        case 6:
          message.cethAmount = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgBurn {
    return {
      cosmosSender: isSet(object.cosmosSender)
        ? String(object.cosmosSender)
        : "",
      amount: isSet(object.amount) ? String(object.amount) : "",
      symbol: isSet(object.symbol) ? String(object.symbol) : "",
      ethereumChainId: isSet(object.ethereumChainId)
        ? Long.fromString(object.ethereumChainId)
        : Long.ZERO,
      ethereumReceiver: isSet(object.ethereumReceiver)
        ? String(object.ethereumReceiver)
        : "",
      cethAmount: isSet(object.cethAmount) ? String(object.cethAmount) : "",
    };
  },

  toJSON(message: MsgBurn): unknown {
    const obj: any = {};
    message.cosmosSender !== undefined &&
      (obj.cosmosSender = message.cosmosSender);
    message.amount !== undefined && (obj.amount = message.amount);
    message.symbol !== undefined && (obj.symbol = message.symbol);
    message.ethereumChainId !== undefined &&
      (obj.ethereumChainId = (message.ethereumChainId || Long.ZERO).toString());
    message.ethereumReceiver !== undefined &&
      (obj.ethereumReceiver = message.ethereumReceiver);
    message.cethAmount !== undefined && (obj.cethAmount = message.cethAmount);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgBurn>, I>>(object: I): MsgBurn {
    const message = createBaseMsgBurn();
    message.cosmosSender = object.cosmosSender ?? "";
    message.amount = object.amount ?? "";
    message.symbol = object.symbol ?? "";
    message.ethereumChainId =
      object.ethereumChainId !== undefined && object.ethereumChainId !== null
        ? Long.fromValue(object.ethereumChainId)
        : Long.ZERO;
    message.ethereumReceiver = object.ethereumReceiver ?? "";
    message.cethAmount = object.cethAmount ?? "";
    return message;
  },
};

function createBaseMsgBurnResponse(): MsgBurnResponse {
  return {};
}

export const MsgBurnResponse = {
  encode(
    _: MsgBurnResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgBurnResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgBurnResponse();
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

  fromJSON(_: any): MsgBurnResponse {
    return {};
  },

  toJSON(_: MsgBurnResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgBurnResponse>, I>>(
    _: I,
  ): MsgBurnResponse {
    const message = createBaseMsgBurnResponse();
    return message;
  },
};

function createBaseMsgCreateEthBridgeClaim(): MsgCreateEthBridgeClaim {
  return { ethBridgeClaim: undefined };
}

export const MsgCreateEthBridgeClaim = {
  encode(
    message: MsgCreateEthBridgeClaim,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.ethBridgeClaim !== undefined) {
      EthBridgeClaim.encode(
        message.ethBridgeClaim,
        writer.uint32(10).fork(),
      ).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): MsgCreateEthBridgeClaim {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateEthBridgeClaim();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.ethBridgeClaim = EthBridgeClaim.decode(
            reader,
            reader.uint32(),
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgCreateEthBridgeClaim {
    return {
      ethBridgeClaim: isSet(object.ethBridgeClaim)
        ? EthBridgeClaim.fromJSON(object.ethBridgeClaim)
        : undefined,
    };
  },

  toJSON(message: MsgCreateEthBridgeClaim): unknown {
    const obj: any = {};
    message.ethBridgeClaim !== undefined &&
      (obj.ethBridgeClaim = message.ethBridgeClaim
        ? EthBridgeClaim.toJSON(message.ethBridgeClaim)
        : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgCreateEthBridgeClaim>, I>>(
    object: I,
  ): MsgCreateEthBridgeClaim {
    const message = createBaseMsgCreateEthBridgeClaim();
    message.ethBridgeClaim =
      object.ethBridgeClaim !== undefined && object.ethBridgeClaim !== null
        ? EthBridgeClaim.fromPartial(object.ethBridgeClaim)
        : undefined;
    return message;
  },
};

function createBaseMsgCreateEthBridgeClaimResponse(): MsgCreateEthBridgeClaimResponse {
  return {};
}

export const MsgCreateEthBridgeClaimResponse = {
  encode(
    _: MsgCreateEthBridgeClaimResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): MsgCreateEthBridgeClaimResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateEthBridgeClaimResponse();
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

  fromJSON(_: any): MsgCreateEthBridgeClaimResponse {
    return {};
  },

  toJSON(_: MsgCreateEthBridgeClaimResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgCreateEthBridgeClaimResponse>, I>>(
    _: I,
  ): MsgCreateEthBridgeClaimResponse {
    const message = createBaseMsgCreateEthBridgeClaimResponse();
    return message;
  },
};

function createBaseMsgUpdateWhiteListValidator(): MsgUpdateWhiteListValidator {
  return { cosmosSender: "", validator: "", operationType: "" };
}

export const MsgUpdateWhiteListValidator = {
  encode(
    message: MsgUpdateWhiteListValidator,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.cosmosSender !== "") {
      writer.uint32(10).string(message.cosmosSender);
    }
    if (message.validator !== "") {
      writer.uint32(18).string(message.validator);
    }
    if (message.operationType !== "") {
      writer.uint32(26).string(message.operationType);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): MsgUpdateWhiteListValidator {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdateWhiteListValidator();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.cosmosSender = reader.string();
          break;
        case 2:
          message.validator = reader.string();
          break;
        case 3:
          message.operationType = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgUpdateWhiteListValidator {
    return {
      cosmosSender: isSet(object.cosmosSender)
        ? String(object.cosmosSender)
        : "",
      validator: isSet(object.validator) ? String(object.validator) : "",
      operationType: isSet(object.operationType)
        ? String(object.operationType)
        : "",
    };
  },

  toJSON(message: MsgUpdateWhiteListValidator): unknown {
    const obj: any = {};
    message.cosmosSender !== undefined &&
      (obj.cosmosSender = message.cosmosSender);
    message.validator !== undefined && (obj.validator = message.validator);
    message.operationType !== undefined &&
      (obj.operationType = message.operationType);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgUpdateWhiteListValidator>, I>>(
    object: I,
  ): MsgUpdateWhiteListValidator {
    const message = createBaseMsgUpdateWhiteListValidator();
    message.cosmosSender = object.cosmosSender ?? "";
    message.validator = object.validator ?? "";
    message.operationType = object.operationType ?? "";
    return message;
  },
};

function createBaseMsgUpdateWhiteListValidatorResponse(): MsgUpdateWhiteListValidatorResponse {
  return {};
}

export const MsgUpdateWhiteListValidatorResponse = {
  encode(
    _: MsgUpdateWhiteListValidatorResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): MsgUpdateWhiteListValidatorResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdateWhiteListValidatorResponse();
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

  fromJSON(_: any): MsgUpdateWhiteListValidatorResponse {
    return {};
  },

  toJSON(_: MsgUpdateWhiteListValidatorResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<
    I extends Exact<DeepPartial<MsgUpdateWhiteListValidatorResponse>, I>,
  >(_: I): MsgUpdateWhiteListValidatorResponse {
    const message = createBaseMsgUpdateWhiteListValidatorResponse();
    return message;
  },
};

function createBaseMsgUpdateCethReceiverAccount(): MsgUpdateCethReceiverAccount {
  return { cosmosSender: "", cethReceiverAccount: "" };
}

export const MsgUpdateCethReceiverAccount = {
  encode(
    message: MsgUpdateCethReceiverAccount,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.cosmosSender !== "") {
      writer.uint32(10).string(message.cosmosSender);
    }
    if (message.cethReceiverAccount !== "") {
      writer.uint32(18).string(message.cethReceiverAccount);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): MsgUpdateCethReceiverAccount {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdateCethReceiverAccount();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.cosmosSender = reader.string();
          break;
        case 2:
          message.cethReceiverAccount = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgUpdateCethReceiverAccount {
    return {
      cosmosSender: isSet(object.cosmosSender)
        ? String(object.cosmosSender)
        : "",
      cethReceiverAccount: isSet(object.cethReceiverAccount)
        ? String(object.cethReceiverAccount)
        : "",
    };
  },

  toJSON(message: MsgUpdateCethReceiverAccount): unknown {
    const obj: any = {};
    message.cosmosSender !== undefined &&
      (obj.cosmosSender = message.cosmosSender);
    message.cethReceiverAccount !== undefined &&
      (obj.cethReceiverAccount = message.cethReceiverAccount);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgUpdateCethReceiverAccount>, I>>(
    object: I,
  ): MsgUpdateCethReceiverAccount {
    const message = createBaseMsgUpdateCethReceiverAccount();
    message.cosmosSender = object.cosmosSender ?? "";
    message.cethReceiverAccount = object.cethReceiverAccount ?? "";
    return message;
  },
};

function createBaseMsgUpdateCethReceiverAccountResponse(): MsgUpdateCethReceiverAccountResponse {
  return {};
}

export const MsgUpdateCethReceiverAccountResponse = {
  encode(
    _: MsgUpdateCethReceiverAccountResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): MsgUpdateCethReceiverAccountResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdateCethReceiverAccountResponse();
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

  fromJSON(_: any): MsgUpdateCethReceiverAccountResponse {
    return {};
  },

  toJSON(_: MsgUpdateCethReceiverAccountResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<
    I extends Exact<DeepPartial<MsgUpdateCethReceiverAccountResponse>, I>,
  >(_: I): MsgUpdateCethReceiverAccountResponse {
    const message = createBaseMsgUpdateCethReceiverAccountResponse();
    return message;
  },
};

function createBaseMsgRescueCeth(): MsgRescueCeth {
  return { cosmosSender: "", cosmosReceiver: "", cethAmount: "" };
}

export const MsgRescueCeth = {
  encode(
    message: MsgRescueCeth,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.cosmosSender !== "") {
      writer.uint32(10).string(message.cosmosSender);
    }
    if (message.cosmosReceiver !== "") {
      writer.uint32(18).string(message.cosmosReceiver);
    }
    if (message.cethAmount !== "") {
      writer.uint32(26).string(message.cethAmount);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgRescueCeth {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgRescueCeth();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.cosmosSender = reader.string();
          break;
        case 2:
          message.cosmosReceiver = reader.string();
          break;
        case 3:
          message.cethAmount = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgRescueCeth {
    return {
      cosmosSender: isSet(object.cosmosSender)
        ? String(object.cosmosSender)
        : "",
      cosmosReceiver: isSet(object.cosmosReceiver)
        ? String(object.cosmosReceiver)
        : "",
      cethAmount: isSet(object.cethAmount) ? String(object.cethAmount) : "",
    };
  },

  toJSON(message: MsgRescueCeth): unknown {
    const obj: any = {};
    message.cosmosSender !== undefined &&
      (obj.cosmosSender = message.cosmosSender);
    message.cosmosReceiver !== undefined &&
      (obj.cosmosReceiver = message.cosmosReceiver);
    message.cethAmount !== undefined && (obj.cethAmount = message.cethAmount);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgRescueCeth>, I>>(
    object: I,
  ): MsgRescueCeth {
    const message = createBaseMsgRescueCeth();
    message.cosmosSender = object.cosmosSender ?? "";
    message.cosmosReceiver = object.cosmosReceiver ?? "";
    message.cethAmount = object.cethAmount ?? "";
    return message;
  },
};

function createBaseMsgRescueCethResponse(): MsgRescueCethResponse {
  return {};
}

export const MsgRescueCethResponse = {
  encode(
    _: MsgRescueCethResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): MsgRescueCethResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgRescueCethResponse();
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

  fromJSON(_: any): MsgRescueCethResponse {
    return {};
  },

  toJSON(_: MsgRescueCethResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgRescueCethResponse>, I>>(
    _: I,
  ): MsgRescueCethResponse {
    const message = createBaseMsgRescueCethResponse();
    return message;
  },
};

function createBaseMsgSetBlacklist(): MsgSetBlacklist {
  return { from: "", addresses: [] };
}

export const MsgSetBlacklist = {
  encode(
    message: MsgSetBlacklist,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.from !== "") {
      writer.uint32(10).string(message.from);
    }
    for (const v of message.addresses) {
      writer.uint32(18).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgSetBlacklist {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSetBlacklist();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.from = reader.string();
          break;
        case 2:
          message.addresses.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgSetBlacklist {
    return {
      from: isSet(object.from) ? String(object.from) : "",
      addresses: Array.isArray(object?.addresses)
        ? object.addresses.map((e: any) => String(e))
        : [],
    };
  },

  toJSON(message: MsgSetBlacklist): unknown {
    const obj: any = {};
    message.from !== undefined && (obj.from = message.from);
    if (message.addresses) {
      obj.addresses = message.addresses.map((e) => e);
    } else {
      obj.addresses = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgSetBlacklist>, I>>(
    object: I,
  ): MsgSetBlacklist {
    const message = createBaseMsgSetBlacklist();
    message.from = object.from ?? "";
    message.addresses = object.addresses?.map((e) => e) || [];
    return message;
  },
};

function createBaseMsgSetBlacklistResponse(): MsgSetBlacklistResponse {
  return {};
}

export const MsgSetBlacklistResponse = {
  encode(
    _: MsgSetBlacklistResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): MsgSetBlacklistResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSetBlacklistResponse();
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

  fromJSON(_: any): MsgSetBlacklistResponse {
    return {};
  },

  toJSON(_: MsgSetBlacklistResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgSetBlacklistResponse>, I>>(
    _: I,
  ): MsgSetBlacklistResponse {
    const message = createBaseMsgSetBlacklistResponse();
    return message;
  },
};

/** Msg service for messages */
export interface Msg {
  Lock(request: MsgLock): Promise<MsgLockResponse>;
  Burn(request: MsgBurn): Promise<MsgBurnResponse>;
  CreateEthBridgeClaim(
    request: MsgCreateEthBridgeClaim,
  ): Promise<MsgCreateEthBridgeClaimResponse>;
  UpdateWhiteListValidator(
    request: MsgUpdateWhiteListValidator,
  ): Promise<MsgUpdateWhiteListValidatorResponse>;
  UpdateCethReceiverAccount(
    request: MsgUpdateCethReceiverAccount,
  ): Promise<MsgUpdateCethReceiverAccountResponse>;
  RescueCeth(request: MsgRescueCeth): Promise<MsgRescueCethResponse>;
  SetBlacklist(request: MsgSetBlacklist): Promise<MsgSetBlacklistResponse>;
}

export class MsgClientImpl implements Msg {
  private readonly rpc: Rpc;
  constructor(rpc: Rpc) {
    this.rpc = rpc;
    this.Lock = this.Lock.bind(this);
    this.Burn = this.Burn.bind(this);
    this.CreateEthBridgeClaim = this.CreateEthBridgeClaim.bind(this);
    this.UpdateWhiteListValidator = this.UpdateWhiteListValidator.bind(this);
    this.UpdateCethReceiverAccount = this.UpdateCethReceiverAccount.bind(this);
    this.RescueCeth = this.RescueCeth.bind(this);
    this.SetBlacklist = this.SetBlacklist.bind(this);
  }
  Lock(request: MsgLock): Promise<MsgLockResponse> {
    const data = MsgLock.encode(request).finish();
    const promise = this.rpc.request("sifnode.ethbridge.v1.Msg", "Lock", data);
    return promise.then((data) => MsgLockResponse.decode(new _m0.Reader(data)));
  }

  Burn(request: MsgBurn): Promise<MsgBurnResponse> {
    const data = MsgBurn.encode(request).finish();
    const promise = this.rpc.request("sifnode.ethbridge.v1.Msg", "Burn", data);
    return promise.then((data) => MsgBurnResponse.decode(new _m0.Reader(data)));
  }

  CreateEthBridgeClaim(
    request: MsgCreateEthBridgeClaim,
  ): Promise<MsgCreateEthBridgeClaimResponse> {
    const data = MsgCreateEthBridgeClaim.encode(request).finish();
    const promise = this.rpc.request(
      "sifnode.ethbridge.v1.Msg",
      "CreateEthBridgeClaim",
      data,
    );
    return promise.then((data) =>
      MsgCreateEthBridgeClaimResponse.decode(new _m0.Reader(data)),
    );
  }

  UpdateWhiteListValidator(
    request: MsgUpdateWhiteListValidator,
  ): Promise<MsgUpdateWhiteListValidatorResponse> {
    const data = MsgUpdateWhiteListValidator.encode(request).finish();
    const promise = this.rpc.request(
      "sifnode.ethbridge.v1.Msg",
      "UpdateWhiteListValidator",
      data,
    );
    return promise.then((data) =>
      MsgUpdateWhiteListValidatorResponse.decode(new _m0.Reader(data)),
    );
  }

  UpdateCethReceiverAccount(
    request: MsgUpdateCethReceiverAccount,
  ): Promise<MsgUpdateCethReceiverAccountResponse> {
    const data = MsgUpdateCethReceiverAccount.encode(request).finish();
    const promise = this.rpc.request(
      "sifnode.ethbridge.v1.Msg",
      "UpdateCethReceiverAccount",
      data,
    );
    return promise.then((data) =>
      MsgUpdateCethReceiverAccountResponse.decode(new _m0.Reader(data)),
    );
  }

  RescueCeth(request: MsgRescueCeth): Promise<MsgRescueCethResponse> {
    const data = MsgRescueCeth.encode(request).finish();
    const promise = this.rpc.request(
      "sifnode.ethbridge.v1.Msg",
      "RescueCeth",
      data,
    );
    return promise.then((data) =>
      MsgRescueCethResponse.decode(new _m0.Reader(data)),
    );
  }

  SetBlacklist(request: MsgSetBlacklist): Promise<MsgSetBlacklistResponse> {
    const data = MsgSetBlacklist.encode(request).finish();
    const promise = this.rpc.request(
      "sifnode.ethbridge.v1.Msg",
      "SetBlacklist",
      data,
    );
    return promise.then((data) =>
      MsgSetBlacklistResponse.decode(new _m0.Reader(data)),
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
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & Record<
        Exclude<keyof I, KeysOfUnion<P>>,
        never
      >;

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
