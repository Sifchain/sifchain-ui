import { computed } from "vue";
import { useQuery } from "vue-query";

import { useSifchainClients } from "@/business/providers/SifchainClientsProvider";
import dangerouslyAssert from "@/utils/dangerouslyAssert";

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
