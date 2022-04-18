import { RewardParams } from "@sifchain/sdk/build/typescript/generated/proto/sifnode/clp/v1/params";
import {
  LiquidityProvider,
  LiquidityUnlock,
} from "@sifchain/sdk/build/typescript/generated/proto/sifnode/clp/v1/types";
import BigNumber from "bignumber.js";
import { addMilliseconds } from "date-fns";
import Long from "long";

const addDetailToUnlock = (
  unlock: LiquidityUnlock,
  params: RewardParams,
  currentHeight: number,
  totalUnits: BigNumber,
  totalNativeAssets: BigNumber,
  totalExternalAssets: BigNumber,
  estimatedBlockTimeMs: number,
) => {
  const lockPeriod = params?.liquidityRemovalLockPeriod ?? Long.ZERO;
  const unlockedFromHeight = unlock.requestHeight.add(lockPeriod).toNumber();
  const expiredAtHeight =
    unlockedFromHeight + params.liquidityRemovalCancelPeriod.toNumber();
  const expired = currentHeight >= expiredAtHeight;
  const ready = currentHeight >= unlockedFromHeight && !expired;

  const blocksUntilUnlock = unlockedFromHeight - currentHeight;
  const blockUntilExpiration = expiredAtHeight - currentHeight;
  const eta =
    blocksUntilUnlock <= 0
      ? undefined
      : addMilliseconds(new Date(), estimatedBlockTimeMs * blocksUntilUnlock);
  const expiration =
    blockUntilExpiration <= 0
      ? undefined
      : addMilliseconds(
          new Date(),
          estimatedBlockTimeMs * blockUntilExpiration,
        );

  const units = new BigNumber(unlock.units);
  const unlockPercentage = units.dividedBy(totalUnits);

  const nativeAssetAmount = new BigNumber(totalNativeAssets).multipliedBy(
    unlockPercentage,
  );
  const externalAssetAmount = new BigNumber(totalExternalAssets).multipliedBy(
    unlockPercentage,
  );

  return {
    ...unlock,
    nativeAssetAmount,
    externalAssetAmount,
    requestHeight: unlock.requestHeight.toNumber(),
    ready,
    expired,
    unlockedFromHeight,
    expiredAtHeight,
    eta,
    expiration,
  };
};

export const addDetailToLiquidityProvider = (
  liquidityProvider: LiquidityProvider,
  nativeAsset: { value: string; fractionalDigits: number },
  externalAsset: { value: string; fractionalDigits: number },
  params: RewardParams,
  currentHeight: number,
  estimatedBlockTimeMs: number,
) => {
  return {
    ...liquidityProvider,
    unlocks: liquidityProvider.unlocks
      .map((x) =>
        addDetailToUnlock(
          x,
          params,
          currentHeight,
          new BigNumber(liquidityProvider.liquidityProviderUnits),
          new BigNumber(nativeAsset.value).shiftedBy(
            -nativeAsset.fractionalDigits,
          ),
          new BigNumber(externalAsset.value).shiftedBy(
            -externalAsset.fractionalDigits,
          ),
          estimatedBlockTimeMs,
        ),
      )
      // Needed as unlock get set to 0 before they are removed by sifnode
      .filter((x) => !new BigNumber(x.units).isZero()),
  };
};
