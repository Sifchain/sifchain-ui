import { Params } from "@sifchain/sdk/build/typescript/generated/sifnode/clp/v1/params";
import {
  LiquidityProvider,
  LiquidityUnlock,
} from "@sifchain/sdk/build/typescript/generated/sifnode/clp/v1/types";
import { addMilliseconds, addSeconds } from "date-fns";
import Long from "long";

// TODO: this shouldn't be here
// see if this can be extracted out or fetch from external service
const EST_SECONDS_PER_BLOCK = 7;

export const addDetailToUnlock = (
  unlock: LiquidityUnlock | undefined,
  params: Params | undefined,
  currentHeight: number | undefined,
) => {
  if (
    unlock === undefined ||
    params === undefined ||
    currentHeight === undefined
  )
    return undefined;

  const lockPeriod = params?.liquidityRemovalLockPeriod ?? Long.ZERO;
  const unlockedFromHeight = unlock.requestHeight.add(lockPeriod);
  const ready = currentHeight >= unlockedFromHeight.toNumber();

  const blocksUntilUnlock = unlockedFromHeight.toNumber() - currentHeight;
  const eta =
    blocksUntilUnlock <= 0
      ? undefined
      : addSeconds(new Date(), EST_SECONDS_PER_BLOCK * blocksUntilUnlock);

  return { ...unlock, ready, unlockedFromHeight, eta };
};

export const addDetailToLiquidityProvider = (
  liquidityProvider: LiquidityProvider | undefined,
  params: Params | undefined,
  currentHeight: number | undefined,
) => {
  return liquidityProvider === undefined
    ? undefined
    : {
        ...liquidityProvider,
        unlocks: liquidityProvider.unlocks.map(
          // as to not mess up the type definition
          // this is a mess though, should clean up later
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          (x) => addDetailToUnlock(x, params, currentHeight)!,
        ),
      };
};
