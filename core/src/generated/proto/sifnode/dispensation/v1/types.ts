/* eslint-disable */
import Long from "long";
import * as _m0 from "protobufjs/minimal";
import { Coin } from "../../../cosmos/base/coin";

export const protobufPackage = "sifnode.dispensation.v1";

/** Distribution type enum */
export enum DistributionType {
  /** DISTRIBUTION_TYPE_UNSPECIFIED - Unspecified distribution type */
  DISTRIBUTION_TYPE_UNSPECIFIED = 0,
  /** DISTRIBUTION_TYPE_AIRDROP - Airdrop distribution type */
  DISTRIBUTION_TYPE_AIRDROP = 1,
  /** DISTRIBUTION_TYPE_VALIDATOR_SUBSIDY - Validator Subsidy distribution type */
  DISTRIBUTION_TYPE_VALIDATOR_SUBSIDY = 2,
  /** DISTRIBUTION_TYPE_LIQUIDITY_MINING - Liquidity mining distribution type */
  DISTRIBUTION_TYPE_LIQUIDITY_MINING = 3,
  UNRECOGNIZED = -1,
}

export function distributionTypeFromJSON(object: any): DistributionType {
  switch (object) {
    case 0:
    case "DISTRIBUTION_TYPE_UNSPECIFIED":
      return DistributionType.DISTRIBUTION_TYPE_UNSPECIFIED;
    case 1:
    case "DISTRIBUTION_TYPE_AIRDROP":
      return DistributionType.DISTRIBUTION_TYPE_AIRDROP;
    case 2:
    case "DISTRIBUTION_TYPE_VALIDATOR_SUBSIDY":
      return DistributionType.DISTRIBUTION_TYPE_VALIDATOR_SUBSIDY;
    case 3:
    case "DISTRIBUTION_TYPE_LIQUIDITY_MINING":
      return DistributionType.DISTRIBUTION_TYPE_LIQUIDITY_MINING;
    case -1:
    case "UNRECOGNIZED":
    default:
      return DistributionType.UNRECOGNIZED;
  }
}

export function distributionTypeToJSON(object: DistributionType): string {
  switch (object) {
    case DistributionType.DISTRIBUTION_TYPE_UNSPECIFIED:
      return "DISTRIBUTION_TYPE_UNSPECIFIED";
    case DistributionType.DISTRIBUTION_TYPE_AIRDROP:
      return "DISTRIBUTION_TYPE_AIRDROP";
    case DistributionType.DISTRIBUTION_TYPE_VALIDATOR_SUBSIDY:
      return "DISTRIBUTION_TYPE_VALIDATOR_SUBSIDY";
    case DistributionType.DISTRIBUTION_TYPE_LIQUIDITY_MINING:
      return "DISTRIBUTION_TYPE_LIQUIDITY_MINING";
    default:
      return "UNKNOWN";
  }
}

/** Claim status enum */
export enum DistributionStatus {
  /** DISTRIBUTION_STATUS_UNSPECIFIED - Unspecified */
  DISTRIBUTION_STATUS_UNSPECIFIED = 0,
  /** DISTRIBUTION_STATUS_PENDING - Pending status */
  DISTRIBUTION_STATUS_PENDING = 1,
  /** DISTRIBUTION_STATUS_COMPLETED - Completed status */
  DISTRIBUTION_STATUS_COMPLETED = 2,
  /** DISTRIBUTION_STATUS_FAILED - Failed status */
  DISTRIBUTION_STATUS_FAILED = 3,
  UNRECOGNIZED = -1,
}

export function distributionStatusFromJSON(object: any): DistributionStatus {
  switch (object) {
    case 0:
    case "DISTRIBUTION_STATUS_UNSPECIFIED":
      return DistributionStatus.DISTRIBUTION_STATUS_UNSPECIFIED;
    case 1:
    case "DISTRIBUTION_STATUS_PENDING":
      return DistributionStatus.DISTRIBUTION_STATUS_PENDING;
    case 2:
    case "DISTRIBUTION_STATUS_COMPLETED":
      return DistributionStatus.DISTRIBUTION_STATUS_COMPLETED;
    case 3:
    case "DISTRIBUTION_STATUS_FAILED":
      return DistributionStatus.DISTRIBUTION_STATUS_FAILED;
    case -1:
    case "UNRECOGNIZED":
    default:
      return DistributionStatus.UNRECOGNIZED;
  }
}

export function distributionStatusToJSON(object: DistributionStatus): string {
  switch (object) {
    case DistributionStatus.DISTRIBUTION_STATUS_UNSPECIFIED:
      return "DISTRIBUTION_STATUS_UNSPECIFIED";
    case DistributionStatus.DISTRIBUTION_STATUS_PENDING:
      return "DISTRIBUTION_STATUS_PENDING";
    case DistributionStatus.DISTRIBUTION_STATUS_COMPLETED:
      return "DISTRIBUTION_STATUS_COMPLETED";
    case DistributionStatus.DISTRIBUTION_STATUS_FAILED:
      return "DISTRIBUTION_STATUS_FAILED";
    default:
      return "UNKNOWN";
  }
}

export interface GenesisState {
  distributionRecords?: DistributionRecords;
  distributions?: Distributions;
  claims?: UserClaims;
}

export interface DistributionRecord {
  distributionStatus: DistributionStatus;
  distributionType: DistributionType;
  distributionName: string;
  recipientAddress: string;
  coins: Coin[];
  distributionStartHeight: Long;
  distributionCompletedHeight: Long;
  authorizedRunner: string;
}

export interface DistributionRecords {
  distributionRecords: DistributionRecord[];
}

export interface Distributions {
  distributions: Distribution[];
}

export interface Distribution {
  distributionType: DistributionType;
  distributionName: string;
  runner: string;
}

export interface UserClaim {
  userAddress: string;
  userClaimType: DistributionType;
  userClaimTime: string;
}

export interface UserClaims {
  userClaims: UserClaim[];
}

export interface MintController {
  totalCounter?: Coin;
}

function createBaseGenesisState(): GenesisState {
  return {
    distributionRecords: undefined,
    distributions: undefined,
    claims: undefined,
  };
}

export const GenesisState = {
  encode(
    message: GenesisState,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.distributionRecords !== undefined) {
      DistributionRecords.encode(
        message.distributionRecords,
        writer.uint32(10).fork(),
      ).ldelim();
    }
    if (message.distributions !== undefined) {
      Distributions.encode(
        message.distributions,
        writer.uint32(18).fork(),
      ).ldelim();
    }
    if (message.claims !== undefined) {
      UserClaims.encode(message.claims, writer.uint32(26).fork()).ldelim();
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
          message.distributionRecords = DistributionRecords.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 2:
          message.distributions = Distributions.decode(reader, reader.uint32());
          break;
        case 3:
          message.claims = UserClaims.decode(reader, reader.uint32());
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
      distributionRecords: isSet(object.distributionRecords)
        ? DistributionRecords.fromJSON(object.distributionRecords)
        : undefined,
      distributions: isSet(object.distributions)
        ? Distributions.fromJSON(object.distributions)
        : undefined,
      claims: isSet(object.claims)
        ? UserClaims.fromJSON(object.claims)
        : undefined,
    };
  },

  toJSON(message: GenesisState): unknown {
    const obj: any = {};
    message.distributionRecords !== undefined &&
      (obj.distributionRecords = message.distributionRecords
        ? DistributionRecords.toJSON(message.distributionRecords)
        : undefined);
    message.distributions !== undefined &&
      (obj.distributions = message.distributions
        ? Distributions.toJSON(message.distributions)
        : undefined);
    message.claims !== undefined &&
      (obj.claims = message.claims
        ? UserClaims.toJSON(message.claims)
        : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<GenesisState>, I>>(
    object: I,
  ): GenesisState {
    const message = createBaseGenesisState();
    message.distributionRecords =
      object.distributionRecords !== undefined &&
      object.distributionRecords !== null
        ? DistributionRecords.fromPartial(object.distributionRecords)
        : undefined;
    message.distributions =
      object.distributions !== undefined && object.distributions !== null
        ? Distributions.fromPartial(object.distributions)
        : undefined;
    message.claims =
      object.claims !== undefined && object.claims !== null
        ? UserClaims.fromPartial(object.claims)
        : undefined;
    return message;
  },
};

function createBaseDistributionRecord(): DistributionRecord {
  return {
    distributionStatus: 0,
    distributionType: 0,
    distributionName: "",
    recipientAddress: "",
    coins: [],
    distributionStartHeight: Long.ZERO,
    distributionCompletedHeight: Long.ZERO,
    authorizedRunner: "",
  };
}

export const DistributionRecord = {
  encode(
    message: DistributionRecord,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.distributionStatus !== 0) {
      writer.uint32(8).int32(message.distributionStatus);
    }
    if (message.distributionType !== 0) {
      writer.uint32(16).int32(message.distributionType);
    }
    if (message.distributionName !== "") {
      writer.uint32(26).string(message.distributionName);
    }
    if (message.recipientAddress !== "") {
      writer.uint32(34).string(message.recipientAddress);
    }
    for (const v of message.coins) {
      Coin.encode(v!, writer.uint32(42).fork()).ldelim();
    }
    if (!message.distributionStartHeight.isZero()) {
      writer.uint32(48).int64(message.distributionStartHeight);
    }
    if (!message.distributionCompletedHeight.isZero()) {
      writer.uint32(56).int64(message.distributionCompletedHeight);
    }
    if (message.authorizedRunner !== "") {
      writer.uint32(66).string(message.authorizedRunner);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DistributionRecord {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDistributionRecord();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.distributionStatus = reader.int32() as any;
          break;
        case 2:
          message.distributionType = reader.int32() as any;
          break;
        case 3:
          message.distributionName = reader.string();
          break;
        case 4:
          message.recipientAddress = reader.string();
          break;
        case 5:
          message.coins.push(Coin.decode(reader, reader.uint32()));
          break;
        case 6:
          message.distributionStartHeight = reader.int64() as Long;
          break;
        case 7:
          message.distributionCompletedHeight = reader.int64() as Long;
          break;
        case 8:
          message.authorizedRunner = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DistributionRecord {
    return {
      distributionStatus: isSet(object.distributionStatus)
        ? distributionStatusFromJSON(object.distributionStatus)
        : 0,
      distributionType: isSet(object.distributionType)
        ? distributionTypeFromJSON(object.distributionType)
        : 0,
      distributionName: isSet(object.distributionName)
        ? String(object.distributionName)
        : "",
      recipientAddress: isSet(object.recipientAddress)
        ? String(object.recipientAddress)
        : "",
      coins: Array.isArray(object?.coins)
        ? object.coins.map((e: any) => Coin.fromJSON(e))
        : [],
      distributionStartHeight: isSet(object.distributionStartHeight)
        ? Long.fromString(object.distributionStartHeight)
        : Long.ZERO,
      distributionCompletedHeight: isSet(object.distributionCompletedHeight)
        ? Long.fromString(object.distributionCompletedHeight)
        : Long.ZERO,
      authorizedRunner: isSet(object.authorizedRunner)
        ? String(object.authorizedRunner)
        : "",
    };
  },

  toJSON(message: DistributionRecord): unknown {
    const obj: any = {};
    message.distributionStatus !== undefined &&
      (obj.distributionStatus = distributionStatusToJSON(
        message.distributionStatus,
      ));
    message.distributionType !== undefined &&
      (obj.distributionType = distributionTypeToJSON(message.distributionType));
    message.distributionName !== undefined &&
      (obj.distributionName = message.distributionName);
    message.recipientAddress !== undefined &&
      (obj.recipientAddress = message.recipientAddress);
    if (message.coins) {
      obj.coins = message.coins.map((e) => (e ? Coin.toJSON(e) : undefined));
    } else {
      obj.coins = [];
    }
    message.distributionStartHeight !== undefined &&
      (obj.distributionStartHeight = (
        message.distributionStartHeight || Long.ZERO
      ).toString());
    message.distributionCompletedHeight !== undefined &&
      (obj.distributionCompletedHeight = (
        message.distributionCompletedHeight || Long.ZERO
      ).toString());
    message.authorizedRunner !== undefined &&
      (obj.authorizedRunner = message.authorizedRunner);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DistributionRecord>, I>>(
    object: I,
  ): DistributionRecord {
    const message = createBaseDistributionRecord();
    message.distributionStatus = object.distributionStatus ?? 0;
    message.distributionType = object.distributionType ?? 0;
    message.distributionName = object.distributionName ?? "";
    message.recipientAddress = object.recipientAddress ?? "";
    message.coins = object.coins?.map((e) => Coin.fromPartial(e)) || [];
    message.distributionStartHeight =
      object.distributionStartHeight !== undefined &&
      object.distributionStartHeight !== null
        ? Long.fromValue(object.distributionStartHeight)
        : Long.ZERO;
    message.distributionCompletedHeight =
      object.distributionCompletedHeight !== undefined &&
      object.distributionCompletedHeight !== null
        ? Long.fromValue(object.distributionCompletedHeight)
        : Long.ZERO;
    message.authorizedRunner = object.authorizedRunner ?? "";
    return message;
  },
};

function createBaseDistributionRecords(): DistributionRecords {
  return { distributionRecords: [] };
}

export const DistributionRecords = {
  encode(
    message: DistributionRecords,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    for (const v of message.distributionRecords) {
      DistributionRecord.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DistributionRecords {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDistributionRecords();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.distributionRecords.push(
            DistributionRecord.decode(reader, reader.uint32()),
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DistributionRecords {
    return {
      distributionRecords: Array.isArray(object?.distributionRecords)
        ? object.distributionRecords.map((e: any) =>
            DistributionRecord.fromJSON(e),
          )
        : [],
    };
  },

  toJSON(message: DistributionRecords): unknown {
    const obj: any = {};
    if (message.distributionRecords) {
      obj.distributionRecords = message.distributionRecords.map((e) =>
        e ? DistributionRecord.toJSON(e) : undefined,
      );
    } else {
      obj.distributionRecords = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DistributionRecords>, I>>(
    object: I,
  ): DistributionRecords {
    const message = createBaseDistributionRecords();
    message.distributionRecords =
      object.distributionRecords?.map((e) =>
        DistributionRecord.fromPartial(e),
      ) || [];
    return message;
  },
};

function createBaseDistributions(): Distributions {
  return { distributions: [] };
}

export const Distributions = {
  encode(
    message: Distributions,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    for (const v of message.distributions) {
      Distribution.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Distributions {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDistributions();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.distributions.push(
            Distribution.decode(reader, reader.uint32()),
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Distributions {
    return {
      distributions: Array.isArray(object?.distributions)
        ? object.distributions.map((e: any) => Distribution.fromJSON(e))
        : [],
    };
  },

  toJSON(message: Distributions): unknown {
    const obj: any = {};
    if (message.distributions) {
      obj.distributions = message.distributions.map((e) =>
        e ? Distribution.toJSON(e) : undefined,
      );
    } else {
      obj.distributions = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<Distributions>, I>>(
    object: I,
  ): Distributions {
    const message = createBaseDistributions();
    message.distributions =
      object.distributions?.map((e) => Distribution.fromPartial(e)) || [];
    return message;
  },
};

function createBaseDistribution(): Distribution {
  return { distributionType: 0, distributionName: "", runner: "" };
}

export const Distribution = {
  encode(
    message: Distribution,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.distributionType !== 0) {
      writer.uint32(8).int32(message.distributionType);
    }
    if (message.distributionName !== "") {
      writer.uint32(18).string(message.distributionName);
    }
    if (message.runner !== "") {
      writer.uint32(26).string(message.runner);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Distribution {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDistribution();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.distributionType = reader.int32() as any;
          break;
        case 2:
          message.distributionName = reader.string();
          break;
        case 3:
          message.runner = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Distribution {
    return {
      distributionType: isSet(object.distributionType)
        ? distributionTypeFromJSON(object.distributionType)
        : 0,
      distributionName: isSet(object.distributionName)
        ? String(object.distributionName)
        : "",
      runner: isSet(object.runner) ? String(object.runner) : "",
    };
  },

  toJSON(message: Distribution): unknown {
    const obj: any = {};
    message.distributionType !== undefined &&
      (obj.distributionType = distributionTypeToJSON(message.distributionType));
    message.distributionName !== undefined &&
      (obj.distributionName = message.distributionName);
    message.runner !== undefined && (obj.runner = message.runner);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<Distribution>, I>>(
    object: I,
  ): Distribution {
    const message = createBaseDistribution();
    message.distributionType = object.distributionType ?? 0;
    message.distributionName = object.distributionName ?? "";
    message.runner = object.runner ?? "";
    return message;
  },
};

function createBaseUserClaim(): UserClaim {
  return { userAddress: "", userClaimType: 0, userClaimTime: "" };
}

export const UserClaim = {
  encode(
    message: UserClaim,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.userAddress !== "") {
      writer.uint32(10).string(message.userAddress);
    }
    if (message.userClaimType !== 0) {
      writer.uint32(16).int32(message.userClaimType);
    }
    if (message.userClaimTime !== "") {
      writer.uint32(26).string(message.userClaimTime);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UserClaim {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUserClaim();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.userAddress = reader.string();
          break;
        case 2:
          message.userClaimType = reader.int32() as any;
          break;
        case 3:
          message.userClaimTime = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): UserClaim {
    return {
      userAddress: isSet(object.userAddress) ? String(object.userAddress) : "",
      userClaimType: isSet(object.userClaimType)
        ? distributionTypeFromJSON(object.userClaimType)
        : 0,
      userClaimTime: isSet(object.userClaimTime)
        ? String(object.userClaimTime)
        : "",
    };
  },

  toJSON(message: UserClaim): unknown {
    const obj: any = {};
    message.userAddress !== undefined &&
      (obj.userAddress = message.userAddress);
    message.userClaimType !== undefined &&
      (obj.userClaimType = distributionTypeToJSON(message.userClaimType));
    message.userClaimTime !== undefined &&
      (obj.userClaimTime = message.userClaimTime);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<UserClaim>, I>>(
    object: I,
  ): UserClaim {
    const message = createBaseUserClaim();
    message.userAddress = object.userAddress ?? "";
    message.userClaimType = object.userClaimType ?? 0;
    message.userClaimTime = object.userClaimTime ?? "";
    return message;
  },
};

function createBaseUserClaims(): UserClaims {
  return { userClaims: [] };
}

export const UserClaims = {
  encode(
    message: UserClaims,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    for (const v of message.userClaims) {
      UserClaim.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UserClaims {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUserClaims();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.userClaims.push(UserClaim.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): UserClaims {
    return {
      userClaims: Array.isArray(object?.userClaims)
        ? object.userClaims.map((e: any) => UserClaim.fromJSON(e))
        : [],
    };
  },

  toJSON(message: UserClaims): unknown {
    const obj: any = {};
    if (message.userClaims) {
      obj.userClaims = message.userClaims.map((e) =>
        e ? UserClaim.toJSON(e) : undefined,
      );
    } else {
      obj.userClaims = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<UserClaims>, I>>(
    object: I,
  ): UserClaims {
    const message = createBaseUserClaims();
    message.userClaims =
      object.userClaims?.map((e) => UserClaim.fromPartial(e)) || [];
    return message;
  },
};

function createBaseMintController(): MintController {
  return { totalCounter: undefined };
}

export const MintController = {
  encode(
    message: MintController,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.totalCounter !== undefined) {
      Coin.encode(message.totalCounter, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MintController {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMintController();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.totalCounter = Coin.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MintController {
    return {
      totalCounter: isSet(object.totalCounter)
        ? Coin.fromJSON(object.totalCounter)
        : undefined,
    };
  },

  toJSON(message: MintController): unknown {
    const obj: any = {};
    message.totalCounter !== undefined &&
      (obj.totalCounter = message.totalCounter
        ? Coin.toJSON(message.totalCounter)
        : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MintController>, I>>(
    object: I,
  ): MintController {
    const message = createBaseMintController();
    message.totalCounter =
      object.totalCounter !== undefined && object.totalCounter !== null
        ? Coin.fromPartial(object.totalCounter)
        : undefined;
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
