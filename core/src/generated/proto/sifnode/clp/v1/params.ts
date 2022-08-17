/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";

export const protobufPackage = "sifnode.clp.v1";

/** Params - used for initializing default parameter for clp at genesis */
export interface Params {
  minCreatePoolThreshold: Long;
  enableRemovalQueue: boolean;
}

export interface RewardParams {
  /** in blocks */
  liquidityRemovalLockPeriod: Long;
  /** in blocks */
  liquidityRemovalCancelPeriod: Long;
  rewardPeriods: RewardPeriod[];
  /** start time of the current (or last) reward period */
  rewardPeriodStartTime: string;
}

/** These params are non-governable and are calculated on chain */
export interface PmtpRateParams {
  pmtpPeriodBlockRate: string;
  pmtpCurrentRunningRate: string;
  pmtpInterPolicyRate: string;
}

export interface PmtpParams {
  pmtpPeriodGovernanceRate: string;
  pmtpPeriodEpochLength: Long;
  pmtpPeriodStartBlock: Long;
  pmtpPeriodEndBlock: Long;
}

export interface RewardPeriod {
  rewardPeriodId: string;
  rewardPeriodStartBlock: Long;
  rewardPeriodEndBlock: Long;
  rewardPeriodAllocation: string;
  rewardPeriodPoolMultipliers: PoolMultiplier[];
  rewardPeriodDefaultMultiplier: string;
  rewardPeriodDistribute: boolean;
  rewardPeriodMod: Long;
}

export interface PoolMultiplier {
  poolMultiplierAsset: string;
  multiplier: string;
}

export interface LiquidityProtectionParams {
  maxRowanLiquidityThreshold: string;
  maxRowanLiquidityThresholdAsset: string;
  epochLength: Long;
  isActive: boolean;
}

export interface LiquidityProtectionRateParams {
  currentRowanLiquidityThreshold: string;
}

export interface ProviderDistributionPeriod {
  distributionPeriodBlockRate: string;
  distributionPeriodStartBlock: Long;
  distributionPeriodEndBlock: Long;
  distributionPeriodMod: Long;
}

export interface ProviderDistributionParams {
  distributionPeriods: ProviderDistributionPeriod[];
}

function createBaseParams(): Params {
  return { minCreatePoolThreshold: Long.UZERO, enableRemovalQueue: false };
}

export const Params = {
  encode(
    message: Params,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (!message.minCreatePoolThreshold.isZero()) {
      writer.uint32(8).uint64(message.minCreatePoolThreshold);
    }
    if (message.enableRemovalQueue === true) {
      writer.uint32(16).bool(message.enableRemovalQueue);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Params {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseParams();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.minCreatePoolThreshold = reader.uint64() as Long;
          break;
        case 2:
          message.enableRemovalQueue = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Params {
    return {
      minCreatePoolThreshold: isSet(object.minCreatePoolThreshold)
        ? Long.fromValue(object.minCreatePoolThreshold)
        : Long.UZERO,
      enableRemovalQueue: isSet(object.enableRemovalQueue)
        ? Boolean(object.enableRemovalQueue)
        : false,
    };
  },

  toJSON(message: Params): unknown {
    const obj: any = {};
    message.minCreatePoolThreshold !== undefined &&
      (obj.minCreatePoolThreshold = (
        message.minCreatePoolThreshold || Long.UZERO
      ).toString());
    message.enableRemovalQueue !== undefined &&
      (obj.enableRemovalQueue = message.enableRemovalQueue);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<Params>, I>>(object: I): Params {
    const message = createBaseParams();
    message.minCreatePoolThreshold =
      object.minCreatePoolThreshold !== undefined &&
      object.minCreatePoolThreshold !== null
        ? Long.fromValue(object.minCreatePoolThreshold)
        : Long.UZERO;
    message.enableRemovalQueue = object.enableRemovalQueue ?? false;
    return message;
  },
};

function createBaseRewardParams(): RewardParams {
  return {
    liquidityRemovalLockPeriod: Long.UZERO,
    liquidityRemovalCancelPeriod: Long.UZERO,
    rewardPeriods: [],
    rewardPeriodStartTime: "",
  };
}

export const RewardParams = {
  encode(
    message: RewardParams,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (!message.liquidityRemovalLockPeriod.isZero()) {
      writer.uint32(8).uint64(message.liquidityRemovalLockPeriod);
    }
    if (!message.liquidityRemovalCancelPeriod.isZero()) {
      writer.uint32(16).uint64(message.liquidityRemovalCancelPeriod);
    }
    for (const v of message.rewardPeriods) {
      RewardPeriod.encode(v!, writer.uint32(34).fork()).ldelim();
    }
    if (message.rewardPeriodStartTime !== "") {
      writer.uint32(42).string(message.rewardPeriodStartTime);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RewardParams {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRewardParams();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.liquidityRemovalLockPeriod = reader.uint64() as Long;
          break;
        case 2:
          message.liquidityRemovalCancelPeriod = reader.uint64() as Long;
          break;
        case 4:
          message.rewardPeriods.push(
            RewardPeriod.decode(reader, reader.uint32()),
          );
          break;
        case 5:
          message.rewardPeriodStartTime = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): RewardParams {
    return {
      liquidityRemovalLockPeriod: isSet(object.liquidityRemovalLockPeriod)
        ? Long.fromValue(object.liquidityRemovalLockPeriod)
        : Long.UZERO,
      liquidityRemovalCancelPeriod: isSet(object.liquidityRemovalCancelPeriod)
        ? Long.fromValue(object.liquidityRemovalCancelPeriod)
        : Long.UZERO,
      rewardPeriods: Array.isArray(object?.rewardPeriods)
        ? object.rewardPeriods.map((e: any) => RewardPeriod.fromJSON(e))
        : [],
      rewardPeriodStartTime: isSet(object.rewardPeriodStartTime)
        ? String(object.rewardPeriodStartTime)
        : "",
    };
  },

  toJSON(message: RewardParams): unknown {
    const obj: any = {};
    message.liquidityRemovalLockPeriod !== undefined &&
      (obj.liquidityRemovalLockPeriod = (
        message.liquidityRemovalLockPeriod || Long.UZERO
      ).toString());
    message.liquidityRemovalCancelPeriod !== undefined &&
      (obj.liquidityRemovalCancelPeriod = (
        message.liquidityRemovalCancelPeriod || Long.UZERO
      ).toString());
    if (message.rewardPeriods) {
      obj.rewardPeriods = message.rewardPeriods.map((e) =>
        e ? RewardPeriod.toJSON(e) : undefined,
      );
    } else {
      obj.rewardPeriods = [];
    }
    message.rewardPeriodStartTime !== undefined &&
      (obj.rewardPeriodStartTime = message.rewardPeriodStartTime);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<RewardParams>, I>>(
    object: I,
  ): RewardParams {
    const message = createBaseRewardParams();
    message.liquidityRemovalLockPeriod =
      object.liquidityRemovalLockPeriod !== undefined &&
      object.liquidityRemovalLockPeriod !== null
        ? Long.fromValue(object.liquidityRemovalLockPeriod)
        : Long.UZERO;
    message.liquidityRemovalCancelPeriod =
      object.liquidityRemovalCancelPeriod !== undefined &&
      object.liquidityRemovalCancelPeriod !== null
        ? Long.fromValue(object.liquidityRemovalCancelPeriod)
        : Long.UZERO;
    message.rewardPeriods =
      object.rewardPeriods?.map((e) => RewardPeriod.fromPartial(e)) || [];
    message.rewardPeriodStartTime = object.rewardPeriodStartTime ?? "";
    return message;
  },
};

function createBasePmtpRateParams(): PmtpRateParams {
  return {
    pmtpPeriodBlockRate: "",
    pmtpCurrentRunningRate: "",
    pmtpInterPolicyRate: "",
  };
}

export const PmtpRateParams = {
  encode(
    message: PmtpRateParams,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.pmtpPeriodBlockRate !== "") {
      writer.uint32(18).string(message.pmtpPeriodBlockRate);
    }
    if (message.pmtpCurrentRunningRate !== "") {
      writer.uint32(26).string(message.pmtpCurrentRunningRate);
    }
    if (message.pmtpInterPolicyRate !== "") {
      writer.uint32(34).string(message.pmtpInterPolicyRate);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PmtpRateParams {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePmtpRateParams();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2:
          message.pmtpPeriodBlockRate = reader.string();
          break;
        case 3:
          message.pmtpCurrentRunningRate = reader.string();
          break;
        case 4:
          message.pmtpInterPolicyRate = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): PmtpRateParams {
    return {
      pmtpPeriodBlockRate: isSet(object.pmtpPeriodBlockRate)
        ? String(object.pmtpPeriodBlockRate)
        : "",
      pmtpCurrentRunningRate: isSet(object.pmtpCurrentRunningRate)
        ? String(object.pmtpCurrentRunningRate)
        : "",
      pmtpInterPolicyRate: isSet(object.pmtpInterPolicyRate)
        ? String(object.pmtpInterPolicyRate)
        : "",
    };
  },

  toJSON(message: PmtpRateParams): unknown {
    const obj: any = {};
    message.pmtpPeriodBlockRate !== undefined &&
      (obj.pmtpPeriodBlockRate = message.pmtpPeriodBlockRate);
    message.pmtpCurrentRunningRate !== undefined &&
      (obj.pmtpCurrentRunningRate = message.pmtpCurrentRunningRate);
    message.pmtpInterPolicyRate !== undefined &&
      (obj.pmtpInterPolicyRate = message.pmtpInterPolicyRate);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<PmtpRateParams>, I>>(
    object: I,
  ): PmtpRateParams {
    const message = createBasePmtpRateParams();
    message.pmtpPeriodBlockRate = object.pmtpPeriodBlockRate ?? "";
    message.pmtpCurrentRunningRate = object.pmtpCurrentRunningRate ?? "";
    message.pmtpInterPolicyRate = object.pmtpInterPolicyRate ?? "";
    return message;
  },
};

function createBasePmtpParams(): PmtpParams {
  return {
    pmtpPeriodGovernanceRate: "",
    pmtpPeriodEpochLength: Long.ZERO,
    pmtpPeriodStartBlock: Long.ZERO,
    pmtpPeriodEndBlock: Long.ZERO,
  };
}

export const PmtpParams = {
  encode(
    message: PmtpParams,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.pmtpPeriodGovernanceRate !== "") {
      writer.uint32(10).string(message.pmtpPeriodGovernanceRate);
    }
    if (!message.pmtpPeriodEpochLength.isZero()) {
      writer.uint32(16).int64(message.pmtpPeriodEpochLength);
    }
    if (!message.pmtpPeriodStartBlock.isZero()) {
      writer.uint32(24).int64(message.pmtpPeriodStartBlock);
    }
    if (!message.pmtpPeriodEndBlock.isZero()) {
      writer.uint32(32).int64(message.pmtpPeriodEndBlock);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PmtpParams {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePmtpParams();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.pmtpPeriodGovernanceRate = reader.string();
          break;
        case 2:
          message.pmtpPeriodEpochLength = reader.int64() as Long;
          break;
        case 3:
          message.pmtpPeriodStartBlock = reader.int64() as Long;
          break;
        case 4:
          message.pmtpPeriodEndBlock = reader.int64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): PmtpParams {
    return {
      pmtpPeriodGovernanceRate: isSet(object.pmtpPeriodGovernanceRate)
        ? String(object.pmtpPeriodGovernanceRate)
        : "",
      pmtpPeriodEpochLength: isSet(object.pmtpPeriodEpochLength)
        ? Long.fromValue(object.pmtpPeriodEpochLength)
        : Long.ZERO,
      pmtpPeriodStartBlock: isSet(object.pmtpPeriodStartBlock)
        ? Long.fromValue(object.pmtpPeriodStartBlock)
        : Long.ZERO,
      pmtpPeriodEndBlock: isSet(object.pmtpPeriodEndBlock)
        ? Long.fromValue(object.pmtpPeriodEndBlock)
        : Long.ZERO,
    };
  },

  toJSON(message: PmtpParams): unknown {
    const obj: any = {};
    message.pmtpPeriodGovernanceRate !== undefined &&
      (obj.pmtpPeriodGovernanceRate = message.pmtpPeriodGovernanceRate);
    message.pmtpPeriodEpochLength !== undefined &&
      (obj.pmtpPeriodEpochLength = (
        message.pmtpPeriodEpochLength || Long.ZERO
      ).toString());
    message.pmtpPeriodStartBlock !== undefined &&
      (obj.pmtpPeriodStartBlock = (
        message.pmtpPeriodStartBlock || Long.ZERO
      ).toString());
    message.pmtpPeriodEndBlock !== undefined &&
      (obj.pmtpPeriodEndBlock = (
        message.pmtpPeriodEndBlock || Long.ZERO
      ).toString());
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<PmtpParams>, I>>(
    object: I,
  ): PmtpParams {
    const message = createBasePmtpParams();
    message.pmtpPeriodGovernanceRate = object.pmtpPeriodGovernanceRate ?? "";
    message.pmtpPeriodEpochLength =
      object.pmtpPeriodEpochLength !== undefined &&
      object.pmtpPeriodEpochLength !== null
        ? Long.fromValue(object.pmtpPeriodEpochLength)
        : Long.ZERO;
    message.pmtpPeriodStartBlock =
      object.pmtpPeriodStartBlock !== undefined &&
      object.pmtpPeriodStartBlock !== null
        ? Long.fromValue(object.pmtpPeriodStartBlock)
        : Long.ZERO;
    message.pmtpPeriodEndBlock =
      object.pmtpPeriodEndBlock !== undefined &&
      object.pmtpPeriodEndBlock !== null
        ? Long.fromValue(object.pmtpPeriodEndBlock)
        : Long.ZERO;
    return message;
  },
};

function createBaseRewardPeriod(): RewardPeriod {
  return {
    rewardPeriodId: "",
    rewardPeriodStartBlock: Long.UZERO,
    rewardPeriodEndBlock: Long.UZERO,
    rewardPeriodAllocation: "",
    rewardPeriodPoolMultipliers: [],
    rewardPeriodDefaultMultiplier: "",
    rewardPeriodDistribute: false,
    rewardPeriodMod: Long.UZERO,
  };
}

export const RewardPeriod = {
  encode(
    message: RewardPeriod,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.rewardPeriodId !== "") {
      writer.uint32(10).string(message.rewardPeriodId);
    }
    if (!message.rewardPeriodStartBlock.isZero()) {
      writer.uint32(16).uint64(message.rewardPeriodStartBlock);
    }
    if (!message.rewardPeriodEndBlock.isZero()) {
      writer.uint32(24).uint64(message.rewardPeriodEndBlock);
    }
    if (message.rewardPeriodAllocation !== "") {
      writer.uint32(34).string(message.rewardPeriodAllocation);
    }
    for (const v of message.rewardPeriodPoolMultipliers) {
      PoolMultiplier.encode(v!, writer.uint32(42).fork()).ldelim();
    }
    if (message.rewardPeriodDefaultMultiplier !== "") {
      writer.uint32(50).string(message.rewardPeriodDefaultMultiplier);
    }
    if (message.rewardPeriodDistribute === true) {
      writer.uint32(56).bool(message.rewardPeriodDistribute);
    }
    if (!message.rewardPeriodMod.isZero()) {
      writer.uint32(64).uint64(message.rewardPeriodMod);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RewardPeriod {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRewardPeriod();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.rewardPeriodId = reader.string();
          break;
        case 2:
          message.rewardPeriodStartBlock = reader.uint64() as Long;
          break;
        case 3:
          message.rewardPeriodEndBlock = reader.uint64() as Long;
          break;
        case 4:
          message.rewardPeriodAllocation = reader.string();
          break;
        case 5:
          message.rewardPeriodPoolMultipliers.push(
            PoolMultiplier.decode(reader, reader.uint32()),
          );
          break;
        case 6:
          message.rewardPeriodDefaultMultiplier = reader.string();
          break;
        case 7:
          message.rewardPeriodDistribute = reader.bool();
          break;
        case 8:
          message.rewardPeriodMod = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): RewardPeriod {
    return {
      rewardPeriodId: isSet(object.rewardPeriodId)
        ? String(object.rewardPeriodId)
        : "",
      rewardPeriodStartBlock: isSet(object.rewardPeriodStartBlock)
        ? Long.fromValue(object.rewardPeriodStartBlock)
        : Long.UZERO,
      rewardPeriodEndBlock: isSet(object.rewardPeriodEndBlock)
        ? Long.fromValue(object.rewardPeriodEndBlock)
        : Long.UZERO,
      rewardPeriodAllocation: isSet(object.rewardPeriodAllocation)
        ? String(object.rewardPeriodAllocation)
        : "",
      rewardPeriodPoolMultipliers: Array.isArray(
        object?.rewardPeriodPoolMultipliers,
      )
        ? object.rewardPeriodPoolMultipliers.map((e: any) =>
            PoolMultiplier.fromJSON(e),
          )
        : [],
      rewardPeriodDefaultMultiplier: isSet(object.rewardPeriodDefaultMultiplier)
        ? String(object.rewardPeriodDefaultMultiplier)
        : "",
      rewardPeriodDistribute: isSet(object.rewardPeriodDistribute)
        ? Boolean(object.rewardPeriodDistribute)
        : false,
      rewardPeriodMod: isSet(object.rewardPeriodMod)
        ? Long.fromValue(object.rewardPeriodMod)
        : Long.UZERO,
    };
  },

  toJSON(message: RewardPeriod): unknown {
    const obj: any = {};
    message.rewardPeriodId !== undefined &&
      (obj.rewardPeriodId = message.rewardPeriodId);
    message.rewardPeriodStartBlock !== undefined &&
      (obj.rewardPeriodStartBlock = (
        message.rewardPeriodStartBlock || Long.UZERO
      ).toString());
    message.rewardPeriodEndBlock !== undefined &&
      (obj.rewardPeriodEndBlock = (
        message.rewardPeriodEndBlock || Long.UZERO
      ).toString());
    message.rewardPeriodAllocation !== undefined &&
      (obj.rewardPeriodAllocation = message.rewardPeriodAllocation);
    if (message.rewardPeriodPoolMultipliers) {
      obj.rewardPeriodPoolMultipliers = message.rewardPeriodPoolMultipliers.map(
        (e) => (e ? PoolMultiplier.toJSON(e) : undefined),
      );
    } else {
      obj.rewardPeriodPoolMultipliers = [];
    }
    message.rewardPeriodDefaultMultiplier !== undefined &&
      (obj.rewardPeriodDefaultMultiplier =
        message.rewardPeriodDefaultMultiplier);
    message.rewardPeriodDistribute !== undefined &&
      (obj.rewardPeriodDistribute = message.rewardPeriodDistribute);
    message.rewardPeriodMod !== undefined &&
      (obj.rewardPeriodMod = (
        message.rewardPeriodMod || Long.UZERO
      ).toString());
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<RewardPeriod>, I>>(
    object: I,
  ): RewardPeriod {
    const message = createBaseRewardPeriod();
    message.rewardPeriodId = object.rewardPeriodId ?? "";
    message.rewardPeriodStartBlock =
      object.rewardPeriodStartBlock !== undefined &&
      object.rewardPeriodStartBlock !== null
        ? Long.fromValue(object.rewardPeriodStartBlock)
        : Long.UZERO;
    message.rewardPeriodEndBlock =
      object.rewardPeriodEndBlock !== undefined &&
      object.rewardPeriodEndBlock !== null
        ? Long.fromValue(object.rewardPeriodEndBlock)
        : Long.UZERO;
    message.rewardPeriodAllocation = object.rewardPeriodAllocation ?? "";
    message.rewardPeriodPoolMultipliers =
      object.rewardPeriodPoolMultipliers?.map((e) =>
        PoolMultiplier.fromPartial(e),
      ) || [];
    message.rewardPeriodDefaultMultiplier =
      object.rewardPeriodDefaultMultiplier ?? "";
    message.rewardPeriodDistribute = object.rewardPeriodDistribute ?? false;
    message.rewardPeriodMod =
      object.rewardPeriodMod !== undefined && object.rewardPeriodMod !== null
        ? Long.fromValue(object.rewardPeriodMod)
        : Long.UZERO;
    return message;
  },
};

function createBasePoolMultiplier(): PoolMultiplier {
  return { poolMultiplierAsset: "", multiplier: "" };
}

export const PoolMultiplier = {
  encode(
    message: PoolMultiplier,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.poolMultiplierAsset !== "") {
      writer.uint32(10).string(message.poolMultiplierAsset);
    }
    if (message.multiplier !== "") {
      writer.uint32(18).string(message.multiplier);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PoolMultiplier {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePoolMultiplier();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.poolMultiplierAsset = reader.string();
          break;
        case 2:
          message.multiplier = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): PoolMultiplier {
    return {
      poolMultiplierAsset: isSet(object.poolMultiplierAsset)
        ? String(object.poolMultiplierAsset)
        : "",
      multiplier: isSet(object.multiplier) ? String(object.multiplier) : "",
    };
  },

  toJSON(message: PoolMultiplier): unknown {
    const obj: any = {};
    message.poolMultiplierAsset !== undefined &&
      (obj.poolMultiplierAsset = message.poolMultiplierAsset);
    message.multiplier !== undefined && (obj.multiplier = message.multiplier);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<PoolMultiplier>, I>>(
    object: I,
  ): PoolMultiplier {
    const message = createBasePoolMultiplier();
    message.poolMultiplierAsset = object.poolMultiplierAsset ?? "";
    message.multiplier = object.multiplier ?? "";
    return message;
  },
};

function createBaseLiquidityProtectionParams(): LiquidityProtectionParams {
  return {
    maxRowanLiquidityThreshold: "",
    maxRowanLiquidityThresholdAsset: "",
    epochLength: Long.UZERO,
    isActive: false,
  };
}

export const LiquidityProtectionParams = {
  encode(
    message: LiquidityProtectionParams,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.maxRowanLiquidityThreshold !== "") {
      writer.uint32(10).string(message.maxRowanLiquidityThreshold);
    }
    if (message.maxRowanLiquidityThresholdAsset !== "") {
      writer.uint32(18).string(message.maxRowanLiquidityThresholdAsset);
    }
    if (!message.epochLength.isZero()) {
      writer.uint32(24).uint64(message.epochLength);
    }
    if (message.isActive === true) {
      writer.uint32(32).bool(message.isActive);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): LiquidityProtectionParams {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLiquidityProtectionParams();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.maxRowanLiquidityThreshold = reader.string();
          break;
        case 2:
          message.maxRowanLiquidityThresholdAsset = reader.string();
          break;
        case 3:
          message.epochLength = reader.uint64() as Long;
          break;
        case 4:
          message.isActive = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): LiquidityProtectionParams {
    return {
      maxRowanLiquidityThreshold: isSet(object.maxRowanLiquidityThreshold)
        ? String(object.maxRowanLiquidityThreshold)
        : "",
      maxRowanLiquidityThresholdAsset: isSet(
        object.maxRowanLiquidityThresholdAsset,
      )
        ? String(object.maxRowanLiquidityThresholdAsset)
        : "",
      epochLength: isSet(object.epochLength)
        ? Long.fromValue(object.epochLength)
        : Long.UZERO,
      isActive: isSet(object.isActive) ? Boolean(object.isActive) : false,
    };
  },

  toJSON(message: LiquidityProtectionParams): unknown {
    const obj: any = {};
    message.maxRowanLiquidityThreshold !== undefined &&
      (obj.maxRowanLiquidityThreshold = message.maxRowanLiquidityThreshold);
    message.maxRowanLiquidityThresholdAsset !== undefined &&
      (obj.maxRowanLiquidityThresholdAsset =
        message.maxRowanLiquidityThresholdAsset);
    message.epochLength !== undefined &&
      (obj.epochLength = (message.epochLength || Long.UZERO).toString());
    message.isActive !== undefined && (obj.isActive = message.isActive);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<LiquidityProtectionParams>, I>>(
    object: I,
  ): LiquidityProtectionParams {
    const message = createBaseLiquidityProtectionParams();
    message.maxRowanLiquidityThreshold =
      object.maxRowanLiquidityThreshold ?? "";
    message.maxRowanLiquidityThresholdAsset =
      object.maxRowanLiquidityThresholdAsset ?? "";
    message.epochLength =
      object.epochLength !== undefined && object.epochLength !== null
        ? Long.fromValue(object.epochLength)
        : Long.UZERO;
    message.isActive = object.isActive ?? false;
    return message;
  },
};

function createBaseLiquidityProtectionRateParams(): LiquidityProtectionRateParams {
  return { currentRowanLiquidityThreshold: "" };
}

export const LiquidityProtectionRateParams = {
  encode(
    message: LiquidityProtectionRateParams,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.currentRowanLiquidityThreshold !== "") {
      writer.uint32(10).string(message.currentRowanLiquidityThreshold);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): LiquidityProtectionRateParams {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLiquidityProtectionRateParams();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.currentRowanLiquidityThreshold = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): LiquidityProtectionRateParams {
    return {
      currentRowanLiquidityThreshold: isSet(
        object.currentRowanLiquidityThreshold,
      )
        ? String(object.currentRowanLiquidityThreshold)
        : "",
    };
  },

  toJSON(message: LiquidityProtectionRateParams): unknown {
    const obj: any = {};
    message.currentRowanLiquidityThreshold !== undefined &&
      (obj.currentRowanLiquidityThreshold =
        message.currentRowanLiquidityThreshold);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<LiquidityProtectionRateParams>, I>>(
    object: I,
  ): LiquidityProtectionRateParams {
    const message = createBaseLiquidityProtectionRateParams();
    message.currentRowanLiquidityThreshold =
      object.currentRowanLiquidityThreshold ?? "";
    return message;
  },
};

function createBaseProviderDistributionPeriod(): ProviderDistributionPeriod {
  return {
    distributionPeriodBlockRate: "",
    distributionPeriodStartBlock: Long.UZERO,
    distributionPeriodEndBlock: Long.UZERO,
    distributionPeriodMod: Long.UZERO,
  };
}

export const ProviderDistributionPeriod = {
  encode(
    message: ProviderDistributionPeriod,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.distributionPeriodBlockRate !== "") {
      writer.uint32(10).string(message.distributionPeriodBlockRate);
    }
    if (!message.distributionPeriodStartBlock.isZero()) {
      writer.uint32(16).uint64(message.distributionPeriodStartBlock);
    }
    if (!message.distributionPeriodEndBlock.isZero()) {
      writer.uint32(24).uint64(message.distributionPeriodEndBlock);
    }
    if (!message.distributionPeriodMod.isZero()) {
      writer.uint32(32).uint64(message.distributionPeriodMod);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): ProviderDistributionPeriod {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProviderDistributionPeriod();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.distributionPeriodBlockRate = reader.string();
          break;
        case 2:
          message.distributionPeriodStartBlock = reader.uint64() as Long;
          break;
        case 3:
          message.distributionPeriodEndBlock = reader.uint64() as Long;
          break;
        case 4:
          message.distributionPeriodMod = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ProviderDistributionPeriod {
    return {
      distributionPeriodBlockRate: isSet(object.distributionPeriodBlockRate)
        ? String(object.distributionPeriodBlockRate)
        : "",
      distributionPeriodStartBlock: isSet(object.distributionPeriodStartBlock)
        ? Long.fromValue(object.distributionPeriodStartBlock)
        : Long.UZERO,
      distributionPeriodEndBlock: isSet(object.distributionPeriodEndBlock)
        ? Long.fromValue(object.distributionPeriodEndBlock)
        : Long.UZERO,
      distributionPeriodMod: isSet(object.distributionPeriodMod)
        ? Long.fromValue(object.distributionPeriodMod)
        : Long.UZERO,
    };
  },

  toJSON(message: ProviderDistributionPeriod): unknown {
    const obj: any = {};
    message.distributionPeriodBlockRate !== undefined &&
      (obj.distributionPeriodBlockRate = message.distributionPeriodBlockRate);
    message.distributionPeriodStartBlock !== undefined &&
      (obj.distributionPeriodStartBlock = (
        message.distributionPeriodStartBlock || Long.UZERO
      ).toString());
    message.distributionPeriodEndBlock !== undefined &&
      (obj.distributionPeriodEndBlock = (
        message.distributionPeriodEndBlock || Long.UZERO
      ).toString());
    message.distributionPeriodMod !== undefined &&
      (obj.distributionPeriodMod = (
        message.distributionPeriodMod || Long.UZERO
      ).toString());
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<ProviderDistributionPeriod>, I>>(
    object: I,
  ): ProviderDistributionPeriod {
    const message = createBaseProviderDistributionPeriod();
    message.distributionPeriodBlockRate =
      object.distributionPeriodBlockRate ?? "";
    message.distributionPeriodStartBlock =
      object.distributionPeriodStartBlock !== undefined &&
      object.distributionPeriodStartBlock !== null
        ? Long.fromValue(object.distributionPeriodStartBlock)
        : Long.UZERO;
    message.distributionPeriodEndBlock =
      object.distributionPeriodEndBlock !== undefined &&
      object.distributionPeriodEndBlock !== null
        ? Long.fromValue(object.distributionPeriodEndBlock)
        : Long.UZERO;
    message.distributionPeriodMod =
      object.distributionPeriodMod !== undefined &&
      object.distributionPeriodMod !== null
        ? Long.fromValue(object.distributionPeriodMod)
        : Long.UZERO;
    return message;
  },
};

function createBaseProviderDistributionParams(): ProviderDistributionParams {
  return { distributionPeriods: [] };
}

export const ProviderDistributionParams = {
  encode(
    message: ProviderDistributionParams,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    for (const v of message.distributionPeriods) {
      ProviderDistributionPeriod.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): ProviderDistributionParams {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProviderDistributionParams();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.distributionPeriods.push(
            ProviderDistributionPeriod.decode(reader, reader.uint32()),
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ProviderDistributionParams {
    return {
      distributionPeriods: Array.isArray(object?.distributionPeriods)
        ? object.distributionPeriods.map((e: any) =>
            ProviderDistributionPeriod.fromJSON(e),
          )
        : [],
    };
  },

  toJSON(message: ProviderDistributionParams): unknown {
    const obj: any = {};
    if (message.distributionPeriods) {
      obj.distributionPeriods = message.distributionPeriods.map((e) =>
        e ? ProviderDistributionPeriod.toJSON(e) : undefined,
      );
    } else {
      obj.distributionPeriods = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<ProviderDistributionParams>, I>>(
    object: I,
  ): ProviderDistributionParams {
    const message = createBaseProviderDistributionParams();
    message.distributionPeriods =
      object.distributionPeriods?.map((e) =>
        ProviderDistributionPeriod.fromPartial(e),
      ) || [];
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
