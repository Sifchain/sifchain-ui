/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";

export const protobufPackage = "sifnode.ethbridge.v1";

/** Claim type enum */
export enum ClaimType {
  /** CLAIM_TYPE_UNSPECIFIED - Unspecified claim type */
  CLAIM_TYPE_UNSPECIFIED = 0,
  /** CLAIM_TYPE_BURN - Burn claim type */
  CLAIM_TYPE_BURN = 1,
  /** CLAIM_TYPE_LOCK - Lock claim type */
  CLAIM_TYPE_LOCK = 2,
  UNRECOGNIZED = -1,
}

export function claimTypeFromJSON(object: any): ClaimType {
  switch (object) {
    case 0:
    case "CLAIM_TYPE_UNSPECIFIED":
      return ClaimType.CLAIM_TYPE_UNSPECIFIED;
    case 1:
    case "CLAIM_TYPE_BURN":
      return ClaimType.CLAIM_TYPE_BURN;
    case 2:
    case "CLAIM_TYPE_LOCK":
      return ClaimType.CLAIM_TYPE_LOCK;
    case -1:
    case "UNRECOGNIZED":
    default:
      return ClaimType.UNRECOGNIZED;
  }
}

export function claimTypeToJSON(object: ClaimType): string {
  switch (object) {
    case ClaimType.CLAIM_TYPE_UNSPECIFIED:
      return "CLAIM_TYPE_UNSPECIFIED";
    case ClaimType.CLAIM_TYPE_BURN:
      return "CLAIM_TYPE_BURN";
    case ClaimType.CLAIM_TYPE_LOCK:
      return "CLAIM_TYPE_LOCK";
    case ClaimType.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

/**
 * EthBridgeClaim is a structure that contains all the data for a particular
 * bridge claim
 */
export interface EthBridgeClaim {
  ethereumChainId: Long;
  /** bridge_contract_address is an EthereumAddress */
  bridgeContractAddress: string;
  nonce: Long;
  symbol: string;
  /** token_contract_address is an EthereumAddress */
  tokenContractAddress: string;
  /** ethereum_sender is an EthereumAddress */
  ethereumSender: string;
  /** cosmos_receiver is an sdk.AccAddress */
  cosmosReceiver: string;
  /** validator_address is an sdk.ValAddress */
  validatorAddress: string;
  amount: string;
  claimType: ClaimType;
}

export interface PeggyTokens {
  tokens: string[];
}

/** GenesisState for ethbridge */
export interface GenesisState {
  cethReceiveAccount: string;
  peggyTokens: string[];
}

function createBaseEthBridgeClaim(): EthBridgeClaim {
  return {
    ethereumChainId: Long.ZERO,
    bridgeContractAddress: "",
    nonce: Long.ZERO,
    symbol: "",
    tokenContractAddress: "",
    ethereumSender: "",
    cosmosReceiver: "",
    validatorAddress: "",
    amount: "",
    claimType: 0,
  };
}

export const EthBridgeClaim = {
  encode(
    message: EthBridgeClaim,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
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
    if (message.cosmosReceiver !== "") {
      writer.uint32(58).string(message.cosmosReceiver);
    }
    if (message.validatorAddress !== "") {
      writer.uint32(66).string(message.validatorAddress);
    }
    if (message.amount !== "") {
      writer.uint32(74).string(message.amount);
    }
    if (message.claimType !== 0) {
      writer.uint32(80).int32(message.claimType);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EthBridgeClaim {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEthBridgeClaim();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.ethereumChainId = reader.int64() as Long;
          break;
        case 2:
          message.bridgeContractAddress = reader.string();
          break;
        case 3:
          message.nonce = reader.int64() as Long;
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
        case 7:
          message.cosmosReceiver = reader.string();
          break;
        case 8:
          message.validatorAddress = reader.string();
          break;
        case 9:
          message.amount = reader.string();
          break;
        case 10:
          message.claimType = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): EthBridgeClaim {
    return {
      ethereumChainId: isSet(object.ethereumChainId)
        ? Long.fromValue(object.ethereumChainId)
        : Long.ZERO,
      bridgeContractAddress: isSet(object.bridgeContractAddress)
        ? String(object.bridgeContractAddress)
        : "",
      nonce: isSet(object.nonce) ? Long.fromValue(object.nonce) : Long.ZERO,
      symbol: isSet(object.symbol) ? String(object.symbol) : "",
      tokenContractAddress: isSet(object.tokenContractAddress)
        ? String(object.tokenContractAddress)
        : "",
      ethereumSender: isSet(object.ethereumSender)
        ? String(object.ethereumSender)
        : "",
      cosmosReceiver: isSet(object.cosmosReceiver)
        ? String(object.cosmosReceiver)
        : "",
      validatorAddress: isSet(object.validatorAddress)
        ? String(object.validatorAddress)
        : "",
      amount: isSet(object.amount) ? String(object.amount) : "",
      claimType: isSet(object.claimType)
        ? claimTypeFromJSON(object.claimType)
        : 0,
    };
  },

  toJSON(message: EthBridgeClaim): unknown {
    const obj: any = {};
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
    message.cosmosReceiver !== undefined &&
      (obj.cosmosReceiver = message.cosmosReceiver);
    message.validatorAddress !== undefined &&
      (obj.validatorAddress = message.validatorAddress);
    message.amount !== undefined && (obj.amount = message.amount);
    message.claimType !== undefined &&
      (obj.claimType = claimTypeToJSON(message.claimType));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<EthBridgeClaim>, I>>(
    object: I,
  ): EthBridgeClaim {
    const message = createBaseEthBridgeClaim();
    message.ethereumChainId =
      object.ethereumChainId !== undefined && object.ethereumChainId !== null
        ? Long.fromValue(object.ethereumChainId)
        : Long.ZERO;
    message.bridgeContractAddress = object.bridgeContractAddress ?? "";
    message.nonce =
      object.nonce !== undefined && object.nonce !== null
        ? Long.fromValue(object.nonce)
        : Long.ZERO;
    message.symbol = object.symbol ?? "";
    message.tokenContractAddress = object.tokenContractAddress ?? "";
    message.ethereumSender = object.ethereumSender ?? "";
    message.cosmosReceiver = object.cosmosReceiver ?? "";
    message.validatorAddress = object.validatorAddress ?? "";
    message.amount = object.amount ?? "";
    message.claimType = object.claimType ?? 0;
    return message;
  },
};

function createBasePeggyTokens(): PeggyTokens {
  return { tokens: [] };
}

export const PeggyTokens = {
  encode(
    message: PeggyTokens,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    for (const v of message.tokens) {
      writer.uint32(10).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PeggyTokens {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePeggyTokens();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.tokens.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): PeggyTokens {
    return {
      tokens: Array.isArray(object?.tokens)
        ? object.tokens.map((e: any) => String(e))
        : [],
    };
  },

  toJSON(message: PeggyTokens): unknown {
    const obj: any = {};
    if (message.tokens) {
      obj.tokens = message.tokens.map((e) => e);
    } else {
      obj.tokens = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<PeggyTokens>, I>>(
    object: I,
  ): PeggyTokens {
    const message = createBasePeggyTokens();
    message.tokens = object.tokens?.map((e) => e) || [];
    return message;
  },
};

function createBaseGenesisState(): GenesisState {
  return { cethReceiveAccount: "", peggyTokens: [] };
}

export const GenesisState = {
  encode(
    message: GenesisState,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.cethReceiveAccount !== "") {
      writer.uint32(10).string(message.cethReceiveAccount);
    }
    for (const v of message.peggyTokens) {
      writer.uint32(18).string(v!);
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
          message.cethReceiveAccount = reader.string();
          break;
        case 2:
          message.peggyTokens.push(reader.string());
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
      cethReceiveAccount: isSet(object.cethReceiveAccount)
        ? String(object.cethReceiveAccount)
        : "",
      peggyTokens: Array.isArray(object?.peggyTokens)
        ? object.peggyTokens.map((e: any) => String(e))
        : [],
    };
  },

  toJSON(message: GenesisState): unknown {
    const obj: any = {};
    message.cethReceiveAccount !== undefined &&
      (obj.cethReceiveAccount = message.cethReceiveAccount);
    if (message.peggyTokens) {
      obj.peggyTokens = message.peggyTokens.map((e) => e);
    } else {
      obj.peggyTokens = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<GenesisState>, I>>(
    object: I,
  ): GenesisState {
    const message = createBaseGenesisState();
    message.cethReceiveAccount = object.cethReceiveAccount ?? "";
    message.peggyTokens = object.peggyTokens?.map((e) => e) || [];
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
