import { useSifchainClients } from "@/business/providers/SifchainClientsProvider";
import dangerouslyAssert from "@/utils/dangerouslyAssert";
import { computed, Ref } from "vue";
import { useQuery } from "vue-query";

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

export const useTokenRegistryEntryQuery = (baseDenom: Ref<string>) => {
  const registryQuery = useTokenRegistryEntriesQuery();

  return {
    ...registryQuery,
    data: computed(() =>
      registryQuery.data.value?.registry?.entries.find(
        (x) => x.baseDenom === baseDenom.value,
      ),
    ),
  };
};
