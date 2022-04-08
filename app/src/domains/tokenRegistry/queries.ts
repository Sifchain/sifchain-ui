import { useSifchainClients } from "@/business/providers/SifchainClientsProvider";
import dangerouslyAssert from "@/utils/dangerouslyAssert";
import { computed, Ref, unref } from "vue";
import { useQuery } from "vue-query";
import { MaybeRef } from "vue-query/lib/vue/types";

export const useTokenRegistryEntriesQuery = () => {
  const sifchainClients = useSifchainClients();

  return useQuery(
    "tokenRegistryEntries",
    () => {
      dangerouslyAssert<"fulfilled">(sifchainClients.queryClientStatus);

      return sifchainClients.tokenRegistryQueryClient.Entries({});
    },
    {
      enabled: computed(
        () => sifchainClients?.queryClientStatus === "fulfilled",
      ),
    },
  );
};

export const useTokenRegistryEntryQuery = (baseDenom: MaybeRef<string>) => {
  const registryQuery = useTokenRegistryEntriesQuery();

  return {
    ...registryQuery,
    data: computed(() =>
      registryQuery.data.value?.registry?.entries.find(
        (x) => x.baseDenom === unref(baseDenom),
      ),
    ),
  };
};
