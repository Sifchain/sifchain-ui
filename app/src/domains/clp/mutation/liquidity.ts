import { useSifchainClients } from "@/business/providers/SifchainClientsProvider";
import { useCore } from "@/hooks/useCore";
import { UseQueryDataType } from "@/utils/types";
import { isDeliverTxFailure, isDeliverTxSuccess } from "@cosmjs/stargate";
import { DEFAULT_FEE, SifchainEncodeObjectRecord } from "@sifchain/sdk";
import { Network } from "@sifchain/sdk/src";
import produce from "immer";
import { useMutation, useQueryClient } from "vue-query";
import {
  LIQUIDITY_PROVIDERS_KEY,
  LIQUIDITY_PROVIDER_KEY,
  useLiquidityProviderQuery,
  useLiquidityProvidersQuery,
} from "../queries/liquidityProvider";

export type UnlockLiquidityParams = {
  units: string;
  externalAssetSymbol: string;
};

export const useUnlockLiquidityMutation = () => {
  const queryClient = useQueryClient();
  const sifchainClients = useSifchainClients();
  const { services } = useCore();

  return useMutation(
    "unlockLiquidity",
    async ({ units, externalAssetSymbol }: UnlockLiquidityParams) => {
      const queryClients = await sifchainClients.getOrInitQueryClients();
      const signingClient = await sifchainClients.getOrInitSigningClient();
      const signer = await services.wallet.keplrProvider.connect(
        services.chains.get(Network.SIFCHAIN),
      );

      const tokenEntries = await queryClients.tokenRegistryQueryClient.Entries(
        {},
      );
      const tokenEntry = tokenEntries.registry?.entries.find(
        (x) => x.baseDenom === externalAssetSymbol,
      );

      // TODO: remove manual multi-unlock prevention on FE
      const liquidityProvider =
        await queryClients.clpQueryClient.GetLiquidityProvider({
          lpAddress: signer,
          symbol: tokenEntry?.denom ?? "",
        });

      if ((liquidityProvider.liquidityProvider?.unlocks.length ?? 0) > 0) {
        throw new Error("Multiple unlocks not allowed");
      }

      const message: SifchainEncodeObjectRecord["MsgUnlockLiquidityRequest"] = {
        typeUrl: "/sifnode.clp.v1.MsgUnlockLiquidityRequest",
        value: {
          signer,
          units,
          externalAsset: { symbol: tokenEntry?.denom ?? "" },
        },
      };

      return signingClient.signAndBroadcast(signer, [message], DEFAULT_FEE);
    },
    {
      onSettled: (data, error) => {
        if (
          error !== undefined ||
          (data !== undefined && isDeliverTxFailure(data))
        ) {
          return services.bus.dispatch({
            type: "ErrorEvent",
            payload: { message: "Unlock liquidity request failed" },
          });
        }

        if (data !== undefined && isDeliverTxSuccess(data)) {
          return services.bus.dispatch({
            type: "ErrorEvent",
            payload: {
              message: "Successfully request liquidity unlock",
            },
          });
        }
      },
      onSuccess: (data) => {
        if (isDeliverTxFailure(data)) return;

        queryClient.invalidateQueries(LIQUIDITY_PROVIDER_KEY);
        queryClient.invalidateQueries(LIQUIDITY_PROVIDERS_KEY);
      },
    },
  );
};

export const useRemoveLiquidityMutation = () => {
  const queryClient = useQueryClient();
  const sifchainClients = useSifchainClients();
  const { services } = useCore();

  return useMutation(
    async ({
      units,
      externalAssetSymbol,
    }: UnlockLiquidityParams & { requestHeight: number }) => {
      const queryClients = await sifchainClients.getOrInitQueryClients();
      const signingClient = await sifchainClients.getOrInitSigningClient();
      const signer = await services.wallet.keplrProvider.connect(
        services.chains.nativeChain,
      );

      const tokenEntries = await queryClients.tokenRegistryQueryClient.Entries(
        {},
      );
      const tokenEntry = tokenEntries.registry?.entries.find(
        (x) => x.baseDenom === externalAssetSymbol,
      );

      const message: SifchainEncodeObjectRecord["MsgRemoveLiquidityUnits"] = {
        typeUrl: "/sifnode.clp.v1.MsgRemoveLiquidityUnits",
        value: {
          signer,
          externalAsset: { symbol: tokenEntry?.denom ?? "" },
          withdrawUnits: units,
        },
      };

      return signingClient.signAndBroadcast(signer, [message], DEFAULT_FEE);
    },
    {
      onSettled: (data, error) => {
        if (
          error !== undefined ||
          (data !== undefined && isDeliverTxFailure(data))
        ) {
          return services.bus.dispatch({
            type: "ErrorEvent",
            payload: { message: "Failed to remove liquidity" },
          });
        }

        if (data !== undefined && isDeliverTxSuccess(data)) {
          return services.bus.dispatch({
            type: "ErrorEvent",
            payload: { message: "Successfully remove unlocked liquidity" },
          });
        }
      },
      onSuccess: (data, { requestHeight, externalAssetSymbol }) => {
        if (isDeliverTxFailure(data)) return;

        const oldLiquidityProviders = queryClient.getQueryData<
          UseQueryDataType<typeof useLiquidityProvidersQuery>
        >(LIQUIDITY_PROVIDERS_KEY);

        if (oldLiquidityProviders !== undefined) {
          queryClient.setQueryData(
            LIQUIDITY_PROVIDERS_KEY,
            produce(oldLiquidityProviders, (x) => {
              x.liquidityProviderData.forEach((y) => {
                if (y.liquidityProvider !== undefined) {
                  y.liquidityProvider.unlocks =
                    y.liquidityProvider.unlocks.filter(
                      (x) => x.requestHeight !== requestHeight,
                    );
                }
              });
            }),
          );
        }

        const oldLiquidityProvider = queryClient.getQueryData<
          UseQueryDataType<typeof useLiquidityProviderQuery>
        >([LIQUIDITY_PROVIDER_KEY, externalAssetSymbol]);

        if (oldLiquidityProvider !== undefined) {
          queryClient.setQueriesData(
            LIQUIDITY_PROVIDER_KEY,
            produce(oldLiquidityProvider, (x) => {
              if (x.liquidityProvider !== undefined) {
                x.liquidityProvider.unlocks =
                  x.liquidityProvider.unlocks.filter(
                    (y) => y.requestHeight !== requestHeight,
                  );
              }
            }),
          );
        }
      },
    },
  );
};
