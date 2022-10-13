import { useSifchainClients } from "~/business/providers/SifchainClientsProvider";
import { useBlockTimeQuery } from "~/domains/statistics/queries/blockTime";
import { useTokenRegistryEntriesQuery } from "~/domains/tokenRegistry/queries/tokenRegistry";
import { useCore } from "~/hooks/useCore";
import { isNil } from "~/utils/assertion";
import { UseQueryDataType } from "~/utils/types";
import {
  DeliverTxResponse,
  isDeliverTxFailure,
  isDeliverTxSuccess,
} from "@cosmjs/stargate";
import { DEFAULT_FEE } from "@sifchain/sdk";
import { Network } from "@sifchain/sdk/src";
import {
  QueryClient,
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "vue-query";
import {
  LIQUIDITY_PROVIDERS_KEY,
  LIQUIDITY_PROVIDER_KEY,
  useLiquidityProviderQuery,
  useLiquidityProvidersQuery,
} from "../queries/liquidityProvider";
import { useRewardsParamsQuery } from "../queries/params";
import { addDetailToLiquidityProvider } from "../utils";
import { produce } from "immer";

export type UnlockLiquidityParams = {
  units: string;
  externalAssetSymbol: string;
};

export const useUnlockLiquidityMutation = () => {
  const queryClient = useQueryClient();
  const sifchainClients = useSifchainClients();
  const { services } = useCore();
  const tokenEntriesQuery = useTokenRegistryEntriesQuery({ enabled: false });
  const { data: rewardsParams } = useRewardsParamsQuery();
  const blockTimeQuery = useBlockTimeQuery();

  return useMutation(
    "unlockLiquidity",
    async ({ units, externalAssetSymbol }: UnlockLiquidityParams) => {
      const queryClients = await sifchainClients.getOrInitQueryClients();
      const signingClient = await sifchainClients.getOrInitSigningClient();
      const signer = await services.wallet.keplrProvider.connect(
        services.chains.get(Network.SIFCHAIN),
      );

      const tokenEntries = (await tokenEntriesQuery.refetch.value()).data;
      const externalTokenEntry = tokenEntries?.registry?.entries.find(
        (x) => x.baseDenom === externalAssetSymbol,
      );

      // TODO: remove manual multi-unlock prevention on FE
      const liquidityProvider = await queryClients.clp.GetLiquidityProvider({
        lpAddress: signer,
        symbol: externalTokenEntry?.denom ?? "",
      });

      if (
        liquidityProvider.liquidityProvider !== undefined &&
        rewardsParams.value?.params !== undefined
      ) {
        const lp = addDetailToLiquidityProvider(
          liquidityProvider.liquidityProvider,
          { value: "0", fractionalDigits: 0 },
          { value: "0", fractionalDigits: 0 },
          rewardsParams.value?.params,
          await signingClient.getHeight(),
          (await blockTimeQuery.refetch.value()).data ?? 0,
        );

        if (lp.unlocks.filter((x) => !x.expired).length > 0) {
          throw new Error("Multiple unlocks not allowed");
        }
      }

      return signingClient.signAndBroadcast(
        signer,
        [
          {
            typeUrl: "/sifnode.clp.v1.MsgUnlockLiquidityRequest",
            value: {
              signer,
              units,
              externalAsset: { symbol: externalTokenEntry?.denom ?? "" },
            },
          },
        ],
        DEFAULT_FEE,
      );
    },
    {
      onSettled: (data, error) => {
        if (!isNil(error) || (data !== undefined && isDeliverTxFailure(data))) {
          return services.bus.dispatch({
            type: "ErrorEvent",
            payload: { message: "Unbond liquidity request failed" },
          });
        }

        if (data !== undefined && isDeliverTxSuccess(data)) {
          return services.bus.dispatch({
            type: "SuccessEvent",
            payload: {
              message: "Successfully requested liquidity unbond",
            },
          });
        }
      },
      onSuccess: async (data) => {
        if (isDeliverTxFailure(data)) return;

        await Promise.all([
          queryClient.invalidateQueries(LIQUIDITY_PROVIDER_KEY),
          queryClient.invalidateQueries(LIQUIDITY_PROVIDERS_KEY),
        ]);
      },
    },
  );
};

export const useRemoveLiquidityMutation = (
  options?: UseMutationOptions<
    DeliverTxResponse,
    unknown,
    UnlockLiquidityParams & { requestHeight: number },
    unknown
  >,
) => {
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

      const tokenEntries = await queryClients.tokenRegistry.Entries({});
      const tokenEntry = tokenEntries.registry?.entries.find(
        (x) => x.baseDenom === externalAssetSymbol,
      );

      return signingClient.signAndBroadcast(
        signer,
        [
          {
            typeUrl: "/sifnode.clp.v1.MsgRemoveLiquidityUnits",
            value: {
              signer,
              externalAsset: { symbol: tokenEntry?.denom ?? "" },
              withdrawUnits: units,
            },
          },
        ],
        DEFAULT_FEE,
      );
    },
    {
      ...options,
      onSettled: (data, error, variables, context) => {
        options?.onSettled?.(data, error, variables, context);
        if (!isNil(error) || (data !== undefined && isDeliverTxFailure(data))) {
          return services.bus.dispatch({
            type: "ErrorEvent",
            payload: { message: "Failed to remove liquidity" },
          });
        }

        if (data !== undefined && isDeliverTxSuccess(data)) {
          return services.bus.dispatch({
            type: "SuccessEvent",
            payload: { message: "Successfully removed unlocked liquidity" },
          });
        }
      },
      onSuccess: async (data, variables, context) => {
        options?.onSuccess?.(data, variables, context);
        if (isDeliverTxFailure(data)) return;

        removeUnlockRequestFromCache(
          queryClient,
          variables.externalAssetSymbol,
          variables.requestHeight,
        );
        await Promise.all([
          queryClient.invalidateQueries(LIQUIDITY_PROVIDERS_KEY),
          queryClient.invalidateQueries(LIQUIDITY_PROVIDER_KEY),
        ]);
      },
    },
  );
};

export const useCancelLiquidityUnlockMutation = () => {
  const sifchainClients = useSifchainClients();
  const tokenEntriesQuery = useTokenRegistryEntriesQuery({ enabled: false });
  const queryClient = useQueryClient();
  const { services } = useCore();

  return useMutation(
    async ({
      units,
      externalAssetSymbol,
    }: UnlockLiquidityParams & { requestHeight: number }) => {
      const client = await sifchainClients.getOrInitSigningClient();
      const signer = await services.wallet.keplrProvider.connect(
        services.chains.nativeChain,
      );
      const externalAsset = await tokenEntriesQuery.refetch
        .value()
        .then((x) =>
          x.data?.registry?.entries.find(
            (x) => x.baseDenom === externalAssetSymbol,
          ),
        );

      return client.signAndBroadcast(
        signer,
        [
          {
            typeUrl: "/sifnode.clp.v1.MsgCancelUnlock",
            value: {
              signer,
              externalAsset: { symbol: externalAsset?.denom ?? "" },
              units,
            },
          },
        ],
        DEFAULT_FEE,
      );
    },
    {
      onSettled: (data, error) => {
        if (!isNil(error) || (data !== undefined && isDeliverTxFailure(data))) {
          return services.bus.dispatch({
            type: "ErrorEvent",
            payload: { message: "Failed to cancel liquidity unbond request" },
          });
        }

        if (data !== undefined && isDeliverTxSuccess(data)) {
          return services.bus.dispatch({
            type: "SuccessEvent",
            payload: {
              message: "Successfully cancel liquidity unbond request",
            },
          });
        }
      },
      onSuccess: async (data, variables) => {
        if (isDeliverTxFailure(data)) return;

        removeUnlockRequestFromCache(
          queryClient,
          variables.externalAssetSymbol,
          variables.requestHeight,
        );
        await Promise.all([
          queryClient.invalidateQueries(LIQUIDITY_PROVIDER_KEY),
          queryClient.invalidateQueries(LIQUIDITY_PROVIDERS_KEY),
        ]);
      },
    },
  );
};

const removeUnlockRequestFromCache = (
  queryClient: QueryClient,
  externalAssetSymbol: string,
  requestHeight: number,
) => {
  const oldLiquidityProviders = queryClient.getQueryData<
    UseQueryDataType<typeof useLiquidityProvidersQuery>
  >(LIQUIDITY_PROVIDERS_KEY);

  if (oldLiquidityProviders !== undefined) {
    queryClient.setQueryData(
      LIQUIDITY_PROVIDERS_KEY,
      produce(oldLiquidityProviders, (x) => {
        x.liquidityProviderData.forEach((y) => {
          if (y.liquidityProvider !== undefined) {
            y.liquidityProvider.unlocks = y.liquidityProvider.unlocks.filter(
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
          x.liquidityProvider.unlocks = x.liquidityProvider.unlocks.filter(
            (y) => y.requestHeight !== requestHeight,
          );
        }
      }),
    );
  }
};
