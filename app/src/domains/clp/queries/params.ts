import { addMilliseconds, minutesToMilliseconds } from "date-fns";
import { computed } from "vue";
import { useQuery } from "vue-query";

import { useSifchainClients } from "~/business/providers/SifchainClientsProvider";
import { useBlockTimeQuery } from "~/domains/statistics/queries/blockTime";
import dangerouslyAssert from "~/utils/dangerouslyAssert";
import useDependentQuery from "~/utils/useDependentQuery";

export function useRewardsParamsQuery() {
  const sifchainClients = useSifchainClients();

  return useQuery(
    "rewardsParams",
    () => {
      dangerouslyAssert<"fulfilled">(sifchainClients.queryClientStatus);
      return sifchainClients.queryClient.clp.GetRewardParams({});
    },
    {
      enabled: computed(
        () => sifchainClients.queryClientStatus === "fulfilled",
      ),
      staleTime: minutesToMilliseconds(5),
    },
  );
}

export function useProviderDistributionParams() {
  const sifchainClients = useSifchainClients();

  return useQuery(
    "providerDistributionParams",
    () => {
      dangerouslyAssert<"fulfilled">(sifchainClients.queryClientStatus);
      return sifchainClients.queryClient.clp.GetProviderDistributionParams({});
    },
    {
      enabled: computed(
        () => sifchainClients.queryClientStatus === "fulfilled",
      ),
      staleTime: minutesToMilliseconds(5),
    },
  );
}

export function useCurrentRewardPeriodStatistics() {
  const { data: rewardsParams } = useRewardsParamsQuery();
  const { data: blockTimeMs } = useBlockTimeQuery();

  return useQuery(
    "currentRewardPeriodStatistics",
    () => {
      const lockPeriod =
        rewardsParams.value?.params?.liquidityRemovalLockPeriod.toNumber() ?? 0;
      const cancelPeriod =
        rewardsParams.value?.params?.liquidityRemovalCancelPeriod.toNumber() ??
        0;

      return {
        estimatedLockMs: lockPeriod * (blockTimeMs.value ?? 0),
        estimatedCancelMs: cancelPeriod * (blockTimeMs.value ?? 0),
      };
    },
    {
      enabled: computed(
        () =>
          rewardsParams.value !== undefined && blockTimeMs.value !== undefined,
      ),
    },
  );
}

export function useCurrentRewardPeriod() {
  const sifchainClients = useSifchainClients();
  const blockTimeQuery = useBlockTimeQuery();
  const rewardsParamsQuery = useRewardsParamsQuery();

  return useDependentQuery(
    [
      computed(
        () =>
          sifchainClients.queryClientStatus === "fulfilled" &&
          sifchainClients.signingClientStatus === "fulfilled",
      ),
      blockTimeQuery,
      rewardsParamsQuery,
    ],
    "currentRewardPeriod",
    async () => {
      dangerouslyAssert<"fulfilled">(sifchainClients.queryClientStatus);
      dangerouslyAssert<"fulfilled">(sifchainClients.signingClientStatus);

      const currentHeight = await sifchainClients.signingClient.getHeight();

      const currentRewardPeriod =
        rewardsParamsQuery.data.value?.params?.rewardPeriods.find((x) => {
          const startBlock = x.rewardPeriodStartBlock.toNumber();
          const endBlock = x.rewardPeriodEndBlock.toNumber();

          return startBlock <= currentHeight && currentHeight < endBlock;
        });

      if (currentRewardPeriod === undefined) return;

      const blocksRemainingTilInactive =
        currentRewardPeriod.rewardPeriodEndBlock.toNumber() - currentHeight;
      const estimatedRewardPeriodEndDate = addMilliseconds(
        new Date(),
        blocksRemainingTilInactive * (blockTimeQuery.data.value ?? 0),
      );

      return { ...currentRewardPeriod, estimatedRewardPeriodEndDate };
    },
  );
}

export function useCurrentProviderDistributionPeriod() {
  const sifchainClients = useSifchainClients();
  const blockTimeQuery = useBlockTimeQuery();
  const lpdParamsQuery = useProviderDistributionParams();

  return useDependentQuery(
    [
      computed(
        () =>
          sifchainClients.queryClientStatus === "fulfilled" &&
          sifchainClients.signingClientStatus === "fulfilled",
      ),
      blockTimeQuery,
      lpdParamsQuery,
    ],
    "currentProviderDistributionPeriod",
    async () => {
      dangerouslyAssert<"fulfilled">(sifchainClients.queryClientStatus);
      dangerouslyAssert<"fulfilled">(sifchainClients.signingClientStatus);

      const currentHeight = await sifchainClients.signingClient.getHeight();

      const currentRewardPeriod =
        lpdParamsQuery.data.value?.params?.distributionPeriods.find((x) => {
          const startBlock = x.distributionPeriodStartBlock.toNumber();
          const endBlock = x.distributionPeriodEndBlock.toNumber();

          return startBlock <= currentHeight && currentHeight < endBlock;
        });

      if (currentRewardPeriod === undefined) return;

      const blocksRemainingTilInactive =
        currentRewardPeriod.distributionPeriodEndBlock.toNumber() -
        currentHeight;

      const estimatedRewardPeriodEndDate = addMilliseconds(
        new Date(),
        blocksRemainingTilInactive * (blockTimeQuery.data.value ?? 0),
      );

      return { ...currentRewardPeriod, estimatedRewardPeriodEndDate };
    },
  );
}

export function useSwapFeeRate() {
  const sifchainClients = useSifchainClients();

  return useDependentQuery(
    [
      computed(
        () =>
          sifchainClients.queryClientStatus === "fulfilled" &&
          sifchainClients.signingClientStatus === "fulfilled",
      ),
    ],
    "swapFeeRate",
    async () => {
      dangerouslyAssert<"fulfilled">(sifchainClients.queryClientStatus);

      const { queryClient } = sifchainClients;

      return await queryClient.clp.GetSwapFeeRate({});
    },
  );
}

export function useLiquidityProtectionParams() {
  const sifchainClients = useSifchainClients();

  return useDependentQuery(
    [
      computed(
        () =>
          sifchainClients.queryClientStatus === "fulfilled" &&
          sifchainClients.signingClientStatus === "fulfilled",
      ),
    ],
    "liquidityProtectionParams",
    async () => {
      dangerouslyAssert<"fulfilled">(sifchainClients.queryClientStatus);

      const { queryClient } = sifchainClients;

      return await queryClient.clp.GetLiquidityProtectionParams({});
    },
    {
      refetchInterval: 6_000,
    },
  );
}
