import { useSifchainClients } from "~/business/providers/SifchainClientsProvider";
import dangerouslyAssert from "~/utils/dangerouslyAssert";
import { PoolRes } from "@sifchain/sdk/build/typescript/generated/proto/sifnode/clp/v1/querier";
import { computed } from "vue";
import { useQuery, UseQueryOptions } from "vue-query";
import { MaybeRef } from "vue-query/lib/vue/types";
import { useTokenRegistryEntryQuery } from "../../tokenRegistry/queries/tokenRegistry";

export const usePoolQuery = (
  externalAssetBaseDenom: MaybeRef<string>,
  options?: Omit<UseQueryOptions<PoolRes>, "queryFn" | "queryKey">,
) => {
  const sifchainClients = useSifchainClients();
  const { data: tokenRegistryEntry } = useTokenRegistryEntryQuery(
    externalAssetBaseDenom,
  );

  return useQuery(
    ["pool", externalAssetBaseDenom],
    () => {
      dangerouslyAssert<"fulfilled">(sifchainClients?.queryClientStatus);
      return sifchainClients.queryClient.clp.GetPool({
        symbol: tokenRegistryEntry.value?.denom ?? "",
      });
    },
    {
      enabled: computed(
        () =>
          sifchainClients?.queryClientStatus === "fulfilled" &&
          tokenRegistryEntry.value !== undefined,
      ),
      ...((options ?? {}) as any),
    },
  );
};
