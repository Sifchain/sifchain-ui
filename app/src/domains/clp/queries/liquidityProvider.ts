import { useSifchainClients } from "@/business/providers/SifchainClientsProvider";
import { useCore } from "@/hooks/useCore";
import dangerouslyAssert from "@/utils/dangerouslyAssert";
import { Network } from "@sifchain/sdk";
import { computed } from "vue";
import { useQuery } from "vue-query";
import { MaybeRef } from "vue-query/lib/vue/types";
import { useTokenRegistryEntryQuery } from "../../tokenRegistry/queries/tokenRegistry";
import { addDetailToLiquidityProvider } from "../utils";

// TODO: duplicate logic that needed to be cleanup, too tired, getting sloppy ==

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
      dangerouslyAssert<"fulfilled">(sifchainClients.queryClientStatus);
      dangerouslyAssert<"fulfilled">(sifchainClients.signingClientStatus);

      const walletAddress = await services.wallet.keplrProvider.connect(
        services.chains.get(Network.SIFCHAIN),
      );

      const liquidityProvider =
        await sifchainClients.clpQueryClient.GetLiquidityProvider({
          lpAddress: walletAddress,
          symbol: tokenRegistryEntry.value?.denom ?? "",
        });

      const currentHeight = await sifchainClients.signingClient.getHeight();
      const { params } = await sifchainClients.clpQueryClient.GetParams({});

      const updatedLiquidityProvider = {
        ...liquidityProvider,
        liquidityProvider: {
          ...liquidityProvider.liquidityProvider,
          unlocks: addDetailToLiquidityProvider(
            liquidityProvider.liquidityProvider,
            params,
            currentHeight,
          ),
        },
      };

      return updatedLiquidityProvider;
    },
    {
      enabled: computed(
        () =>
          sifchainClients.signingClientStatus === "fulfilled" &&
          sifchainClients.queryClientStatus === "fulfilled" &&
          tokenRegistryEntry.value !== undefined,
      ),
    },
  );
};

export const useLiquidityProvidersQuery = () => {
  const sifchainClients = useSifchainClients();
  const { services } = useCore();

  return useQuery(
    "liquidityProviders",
    async () => {
      dangerouslyAssert<"fulfilled">(sifchainClients.queryClientStatus);
      dangerouslyAssert<"fulfilled">(sifchainClients.signingClientStatus);

      const walletAddress = await services.wallet.keplrProvider.connect(
        services.chains.get(Network.SIFCHAIN),
      );
      const liquidityProviders =
        await sifchainClients.clpQueryClient.GetLiquidityProviderData({
          lpAddress: walletAddress,
        });

      const currentHeight = await sifchainClients.signingClient.getHeight();
      const { params } = await sifchainClients.clpQueryClient.GetParams({});

      const updatedLiquidityProvider = {
        ...liquidityProviders,
        liquidityProviderData: liquidityProviders.liquidityProviderData.map(
          (x) => ({
            ...x,
            liquidityProvider: addDetailToLiquidityProvider(
              x.liquidityProvider,
              params,
              currentHeight,
            ),
          }),
        ),
      };

      return updatedLiquidityProvider;
    },
    {
      enabled: computed(
        () =>
          sifchainClients.signingClientStatus === "fulfilled" &&
          sifchainClients.queryClientStatus === "fulfilled",
      ),
    },
  );
};
