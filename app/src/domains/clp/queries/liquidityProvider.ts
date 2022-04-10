import { useSifchainClients } from "@/business/providers/SifchainClientsProvider";
import { useCore } from "@/hooks/useCore";
import dangerouslyAssert from "@/utils/dangerouslyAssert";
import { Network } from "@sifchain/sdk";
import { computed } from "vue";
import { useQuery } from "vue-query";
import { MaybeRef } from "vue-query/lib/vue/types";
import {
  useTokenRegistryEntriesQuery,
  useTokenRegistryEntryQuery,
} from "../../tokenRegistry/queries/tokenRegistry";
import { addDetailToLiquidityProvider } from "../utils";

// TODO: duplicate logic that needed to be cleanup, too tired, getting sloppy ==

export const LIQUIDITY_PROVIDER_KEY = "liquidityProvider";
export const LIQUIDITY_PROVIDERS_KEY = "liquidityProviders";

export const useLiquidityProviderQuery = (
  externalAssetBaseDenom: MaybeRef<string>,
) => {
  const { services, config } = useCore();
  const sifchainClients = useSifchainClients();
  const { data: nativeAssetTokenEntry } = useTokenRegistryEntryQuery(
    config.nativeAsset.symbol,
  );
  const { data: externalAssetTokenEntry } = useTokenRegistryEntryQuery(
    externalAssetBaseDenom,
  );

  return useQuery(
    [LIQUIDITY_PROVIDERS_KEY, externalAssetBaseDenom],
    async () => {
      dangerouslyAssert<"fulfilled">(sifchainClients.queryClientStatus);
      dangerouslyAssert<"fulfilled">(sifchainClients.signingClientStatus);

      const walletAddress = await services.wallet.keplrProvider.connect(
        services.chains.get(Network.SIFCHAIN),
      );

      const liquidityProvider =
        await sifchainClients.clpQueryClient.GetLiquidityProvider({
          lpAddress: walletAddress,
          symbol: externalAssetTokenEntry.value?.denom ?? "",
        });

      const currentHeight = await sifchainClients.signingClient.getHeight();
      const { params } = await sifchainClients.clpQueryClient.GetRewardParams(
        {},
      );

      const lpWithAddedDetails =
        liquidityProvider.liquidityProvider === undefined ||
        params === undefined
          ? undefined
          : addDetailToLiquidityProvider(
              liquidityProvider.liquidityProvider,
              {
                value: liquidityProvider.nativeAssetBalance,
                fractionalDigits:
                  nativeAssetTokenEntry.value?.decimals.toNumber() ?? 0,
              },
              {
                value: liquidityProvider.externalAssetBalance,
                fractionalDigits:
                  externalAssetTokenEntry.value?.decimals.toNumber() ?? 0,
              },
              params,
              currentHeight,
            );

      const updatedLiquidityProvider = {
        ...liquidityProvider,
        liquidityProvider: lpWithAddedDetails,
      };

      return updatedLiquidityProvider;
    },
    {
      enabled: computed(
        () =>
          sifchainClients.signingClientStatus === "fulfilled" &&
          sifchainClients.queryClientStatus === "fulfilled" &&
          nativeAssetTokenEntry.value !== undefined &&
          externalAssetTokenEntry.value !== undefined,
      ),
    },
  );
};

export const useLiquidityProvidersQuery = () => {
  const sifchainClients = useSifchainClients();
  const tokenRegistryEntriesQuery = useTokenRegistryEntriesQuery();
  const { services, config } = useCore();

  return useQuery(
    LIQUIDITY_PROVIDER_KEY,
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
      const { params } = await sifchainClients.clpQueryClient.GetRewardParams(
        {},
      );

      const tokenEntries =
        tokenRegistryEntriesQuery.data.value?.registry?.entries;
      const nativeAssetTokenEntry = tokenEntries?.find(
        (x) => x.baseDenom === config.nativeAsset.symbol,
      );

      const updatedLiquidityProvider = {
        ...liquidityProviders,
        liquidityProviderData: liquidityProviders.liquidityProviderData.map(
          (x) => {
            const externalAssetTokenEntry = tokenEntries?.find(
              (y) => y.baseDenom === x.liquidityProvider?.asset?.symbol,
            );
            return {
              ...x,
              liquidityProvider:
                x.liquidityProvider === undefined || params === undefined
                  ? undefined
                  : addDetailToLiquidityProvider(
                      x.liquidityProvider,
                      {
                        value: x.nativeAssetBalance,
                        fractionalDigits:
                          nativeAssetTokenEntry?.decimals.toNumber() ?? 0,
                      },
                      {
                        value: x.externalAssetBalance,
                        fractionalDigits:
                          externalAssetTokenEntry?.decimals.toNumber() ?? 0,
                      },
                      params,
                      currentHeight,
                    ),
            };
          },
        ),
      };

      return updatedLiquidityProvider;
    },
    {
      enabled: computed(
        () =>
          sifchainClients.signingClientStatus === "fulfilled" &&
          sifchainClients.queryClientStatus === "fulfilled" &&
          tokenRegistryEntriesQuery.data.value !== undefined,
      ),
    },
  );
};
