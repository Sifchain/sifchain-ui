import { useSifchainClients } from "@/business/providers/SifchainClientsProvider";
import dangerouslyAssert from "@/utils/dangerouslyAssert";
import { computed } from "vue";
import { useQuery } from "vue-query";

const REWARD_PARAMS_KEY = "rewardsParams";

export const useRewardsParamsQuery = () => {
  const sifchainClients = useSifchainClients();

  return useQuery(
    REWARD_PARAMS_KEY,
    () => {
      dangerouslyAssert<"fulfilled">(sifchainClients.queryClientStatus);
      return sifchainClients.clpQueryClient.GetRewardParams({});
    },
    {
      enabled: computed(
        () => sifchainClients.queryClientStatus === "fulfilled",
      ),
    },
  );
};
