import { Network } from "@sifchain/sdk";
import { computed, unref } from "vue";
import { MaybeRef } from "vue-query/lib/vue/types";
import { useSifchainClients } from "~/business/providers/SifchainClientsProvider";
import { useBlockTimeQuery } from "~/domains/statistics/queries/blockTime";
import {
  useTokenRegistryEntriesQuery,
  useTokenRegistryEntryQuery,
} from "~/domains/tokenRegistry/queries/tokenRegistry";
import { useCore } from "~/hooks/useCore";
import dangerouslyAssert from "~/utils/dangerouslyAssert";
import useDependentQuery from "~/utils/useDependentQuery";

import { addDetailToLiquidityProvider } from "../utils";
import { useRewardsParamsQuery } from "./params";

export const LIQUIDITY_PROVIDER_KEY = "liquidityProvider";
export const LIQUIDITY_PROVIDERS_KEY = "liquidityProviders";

export const useLiquidityProviderQuery = (
  externalAssetBaseDenom: MaybeRef<string>,
) => {
  const { services, config } = useCore();
  const sifchainClients = useSifchainClients();
  const nativeAssetEntryQuery = useTokenRegistryEntryQuery(
    config.nativeAsset.symbol,
  );
  const externalAssetEntryQuery = useTokenRegistryEntryQuery(
    externalAssetBaseDenom,
  );
  const rewardsParamsQuery = useRewardsParamsQuery();
  const blockTimeQuery = useBlockTimeQuery();

  return useDependentQuery(
    [
      computed(
        () =>
          sifchainClients.signingClientStatus === "fulfilled" &&
          sifchainClients.queryClientStatus === "fulfilled",
      ),
      nativeAssetEntryQuery,
      externalAssetEntryQuery,
      rewardsParamsQuery,
      blockTimeQuery,
    ],
    [LIQUIDITY_PROVIDER_KEY, externalAssetBaseDenom],
    async () => {
      dangerouslyAssert<"fulfilled">(sifchainClients.queryClientStatus);
      dangerouslyAssert<"fulfilled">(sifchainClients.signingClientStatus);

      const walletAddress = await services.wallet.keplrProvider.connect(
        services.chains.get(Network.SIFCHAIN),
      );

      const liquidityProvider =
        await sifchainClients.queryClient.clp.GetLiquidityProvider({
          lpAddress: walletAddress,
          symbol: externalAssetEntryQuery.data.value?.denom ?? "",
        });

      const currentHeight = await sifchainClients.signingClient.getHeight();

      const lpWithAddedDetails =
        liquidityProvider.liquidityProvider === undefined ||
        rewardsParamsQuery.data.value?.params === undefined
          ? undefined
          : addDetailToLiquidityProvider(
              liquidityProvider.liquidityProvider,
              {
                value: liquidityProvider.nativeAssetBalance,
                fractionalDigits:
                  nativeAssetEntryQuery.data.value?.decimals.toNumber() ?? 0,
              },
              {
                value: liquidityProvider.externalAssetBalance,
                fractionalDigits:
                  externalAssetEntryQuery.data.value?.decimals.toNumber() ?? 0,
              },
              rewardsParamsQuery.data.value.params,
              currentHeight,
              blockTimeQuery.data.value ?? 0,
            );

      const updatedLiquidityProvider = {
        ...liquidityProvider,
        liquidityProvider: lpWithAddedDetails,
      };

      return updatedLiquidityProvider;
    },
  );
};

export const useLiquidityProvidersQuery = () => {
  const sifchainClients = useSifchainClients();
  const tokenRegistryEntriesQuery = useTokenRegistryEntriesQuery();
  const rewardsParamsQuery = useRewardsParamsQuery();
  const blockTimeQuery = useBlockTimeQuery();
  const { services, config } = useCore();

  return useDependentQuery(
    [
      computed(
        () =>
          sifchainClients.signingClientStatus === "fulfilled" &&
          sifchainClients.queryClientStatus === "fulfilled",
      ),
      tokenRegistryEntriesQuery,
      rewardsParamsQuery,
      rewardsParamsQuery,
      blockTimeQuery,
    ],
    LIQUIDITY_PROVIDERS_KEY,
    async () => {
      dangerouslyAssert<"fulfilled">(sifchainClients.queryClientStatus);
      dangerouslyAssert<"fulfilled">(sifchainClients.signingClientStatus);

      const walletAddress = await services.wallet.keplrProvider.connect(
        services.chains.get(Network.SIFCHAIN),
      );
      const liquidityProviders =
        await sifchainClients.queryClient.clp.GetLiquidityProviderData({
          lpAddress: walletAddress,
        });

      const currentHeight = await sifchainClients.signingClient.getHeight();

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
              (y) => y.denom === x.liquidityProvider?.asset?.symbol,
            );
            return {
              ...x,
              liquidityProvider:
                x.liquidityProvider === undefined ||
                rewardsParamsQuery.data.value?.params === undefined
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
                      rewardsParamsQuery.data.value.params,
                      currentHeight,
                      blockTimeQuery.data.value ?? 0,
                    ),
            };
          },
        ),
      };

      return updatedLiquidityProvider;
    },
  );
};

export function usePoolshareEstimateQuery(input: {
  externalAssetBaseDenom: MaybeRef<string>;
  externalAssetAmount: MaybeRef<string>;
  nativeAssetAmount: MaybeRef<string>;
}) {
  const sifchainClients = useSifchainClients();

  return useDependentQuery(
    [
      computed(
        () =>
          sifchainClients.signingClientStatus === "fulfilled" &&
          sifchainClients.queryClientStatus === "fulfilled",
      ),
    ],
    "poolshareEstimate",
    async () => {
      dangerouslyAssert<"fulfilled">(sifchainClients.queryClientStatus);
      dangerouslyAssert<"fulfilled">(sifchainClients.signingClientStatus);

      const poolshareEstimate =
        await sifchainClients.queryClient.clp.GetPoolShareEstimate({
          externalAssetAmount: unref(input.externalAssetAmount),
          externalAsset: {
            symbol: unref(input.externalAssetBaseDenom),
          },
          nativeAssetAmount: unref(input.nativeAssetAmount),
        });
      return poolshareEstimate;
    },
  );
}
