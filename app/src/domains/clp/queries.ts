import { useSifchainClients } from "@/business/providers/SifchainClientsProvider";
import { useCore } from "@/hooks/useCore";
import dangerouslyAssert from "@/utils/dangerouslyAssert";
import { Network } from "@sifchain/sdk/src";
import { computed, Ref } from "vue";
import { useQuery } from "vue-query";
import { MaybeRef } from "vue-query/lib/vue/types";
import { useTokenRegistryEntryQuery } from "../tokenRegistry/queries";

export const usePoolQuery = (externalAssetBaseDenom: MaybeRef<string>) => {
  const sifchainClients = useSifchainClients();
  const { data: tokenRegistryEntry } = useTokenRegistryEntryQuery(
    externalAssetBaseDenom,
  );

  return useQuery(
    ["pool", externalAssetBaseDenom],
    () => {
      dangerouslyAssert<"fulfilled">(sifchainClients?.queryClientStatus);
      return sifchainClients.clpQueryClient.GetPool({
        symbol: tokenRegistryEntry.value?.denom ?? "",
      });
    },
    {
      enabled: computed(
        () =>
          sifchainClients?.queryClientStatus === "fulfilled" &&
          tokenRegistryEntry.value !== undefined,
      ),
    },
  );
};

export const useLiquidityProviderQuery = (
  externalAssetBaseDenom: MaybeRef<string>,
) => {
  const sifchainClients = useSifchainClients();
  const { data: tokenRegistryEntry } = useTokenRegistryEntryQuery(
    externalAssetBaseDenom,
  );
  const { services } = useCore();

  return useQuery(
    ["liquidityProvider", externalAssetBaseDenom],
    async () => {
      dangerouslyAssert<"fulfilled">(sifchainClients?.queryClientStatus);

      const walletAddress = await services.wallet.keplrProvider.connect(
        services.chains.get(Network.SIFCHAIN),
      );
      return sifchainClients.clpQueryClient.GetLiquidityProvider({
        lpAddress: walletAddress,
        symbol: tokenRegistryEntry.value?.denom ?? "",
      });
    },
    {
      enabled: computed(
        () =>
          sifchainClients?.queryClientStatus === "fulfilled" &&
          tokenRegistryEntry.value !== undefined,
      ),
    },
  );
};
