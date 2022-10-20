import { useSifchainClients } from "~/business/providers/SifchainClientsProvider";
import dangerouslyAssert from "~/utils/dangerouslyAssert";
import useDependentQuery from "~/utils/useDependentQuery";
import { QueryEntriesResponse } from "@sifchain/sdk/build/typescript/generated/proto/sifnode/tokenregistry/v1/query";
import { computed, unref } from "vue";
import { UseQueryOptions } from "vue-query";
import { MaybeRef } from "vue-query/lib/vue/types";

export const useTokenRegistryEntriesQuery = (
  options?: UseQueryOptions<QueryEntriesResponse>,
) => {
  const sifchainClients = useSifchainClients();

  return useDependentQuery(
    [computed(() => sifchainClients?.queryClientStatus === "fulfilled")],
    "tokenRegistryEntries",
    () => {
      dangerouslyAssert<"fulfilled">(sifchainClients.queryClientStatus);

      return sifchainClients.queryClient.tokenRegistry.Entries({});
    },
    {
      staleTime: Infinity,
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
