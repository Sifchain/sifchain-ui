import { useSifchainClients } from "@/business/providers/SifchainClientsProvider";
import dangerouslyAssert from "@/utils/dangerouslyAssert";
import { QueryEntriesResponse } from "@sifchain/sdk/build/typescript/generated/proto/sifnode/tokenregistry/v1/query";
import { computed, unref } from "vue";
import { useQuery, UseQueryOptions } from "vue-query";
import { MaybeRef } from "vue-query/lib/vue/types";

export const useTokenRegistryEntriesQuery = (
  options?: UseQueryOptions<QueryEntriesResponse>,
) => {
  const sifchainClients = useSifchainClients();

  return useQuery(
    "tokenRegistryEntries",
    () => {
      dangerouslyAssert<"fulfilled">(sifchainClients.queryClientStatus);

      return sifchainClients.queryClient.tokenRegistry.Entries({});
    },
    {
      enabled: computed(
        () => sifchainClients?.queryClientStatus === "fulfilled",
      ),
      ...options,
    },
  );
};

export const useTokenRegistryEntryQuery = (
  baseDenom: MaybeRef<string>,
  options?: Parameters<typeof useTokenRegistryEntriesQuery>[0],
) => {
  const registryQuery = useTokenRegistryEntriesQuery(options);

  return {
    ...registryQuery,
    data: computed(() =>
      registryQuery.data.value?.registry?.entries.find(
        (x) => x.baseDenom === unref(baseDenom),
      ),
    ),
  };
};
