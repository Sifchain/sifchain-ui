import { useSifchainClients } from "@/business/providers/SifchainClientsProvider";
import { useBlockTimeQuery } from "@/domains/statistics/queries/blockTime";
import dangerouslyAssert from "@/utils/dangerouslyAssert";
import useDependentQuery from "@/utils/useDependentQuery";
import { addMilliseconds, minutesToMilliseconds } from "date-fns";
import { computed } from "vue";
import { useQuery } from "vue-query";

const REWARD_PARAMS_KEY = "rewardsParams";

export const useRewardsParamsQuery = () => {
  const sifchainClients = useSifchainClients();

  return useQuery(
    REWARD_PARAMS_KEY,
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
};

export const useCurrentRewardPeriodStatistics = () => {
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
};

export const useCurrentRewardPeriod = () => {
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
};
