import { computed } from "vue";
import { useQuery } from "vue-query";

import { useSifchainClients } from "~/business/providers/SifchainClientsProvider";
import dangerouslyAssert from "~/utils/dangerouslyAssert";
import { useTokenRegistryEntriesQuery } from "~/domains/tokenRegistry/queries/tokenRegistry";

export function useMarginParamsQuery() {
  const sifchainClients = useSifchainClients();

  return useQuery(
    "marginParams",
    () => {
      dangerouslyAssert<"fulfilled">(sifchainClients.queryClientStatus);
      return sifchainClients.queryClient.margin.GetParams({});
    },
    {
      enabled: computed(
        () => sifchainClients.queryClientStatus === "fulfilled",
      ),
    },
  );
}

export function useMarginEnabledPoolsQuery() {
  const marginParamsQuery = useMarginParamsQuery();
  const tokenRegistryQuery = useTokenRegistryEntriesQuery();

  return useQuery(
    "marginEnabledPools",
    () => {
      dangerouslyAssert<"success">(marginParamsQuery.status.value);
      dangerouslyAssert<"success">(tokenRegistryQuery.status.value);

      const enabledPoolsDenoms =
        marginParamsQuery.data.value?.params?.pools ?? [];

      const tokenRegistryEntries =
        tokenRegistryQuery.data.value?.registry?.entries ?? [];

      const enabledPoolsEntries = tokenRegistryEntries.filter((entry) =>
        enabledPoolsDenoms.includes(entry.denom),
      );
      return enabledPoolsEntries;
    },
    {
      enabled: computed(
        () =>
          marginParamsQuery.isSuccess.value &&
          tokenRegistryQuery.isSuccess.value,
      ),
    },
  );
}
