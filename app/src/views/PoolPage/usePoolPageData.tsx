import { AccountPool } from "@/business/store/pools";
import { useLiquidityProvidersQuery } from "@/domains/clp/queries/liquidityProvider";
import { useTokenRegistryEntriesQuery } from "@/domains/tokenRegistry/queries/tokenRegistry";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useChains } from "@/hooks/useChains";
import { useCore } from "@/hooks/useCore";
import {
  usePublicPoolsSubscriber,
  useUserPoolsSubscriber,
} from "@/hooks/usePoolsSubscriber";
import { usePoolStats } from "@/hooks/usePoolStats";
import { accountStore } from "@/store/modules/accounts";
import { createPoolKey, LiquidityProvider, Network, Pool } from "@sifchain/sdk";
import { computed } from "@vue/reactivity";
import { useQuery } from "vue-query";
import { RewardProgram } from "../RewardsPage/useRewardsPageData";

export type PoolPageAccountPool = { lp: LiquidityProvider; pool: Pool };

export type PoolPageData = ReturnType<typeof usePoolPageData>;

export type PoolPageColumnId =
  | "token"
  | "apy"
  | "gainLoss"
  | "rewardApy"
  | "userShare"
  | "userValue";

export type PoolRewardProgram = Pick<
  RewardProgram,
  | "isUniversal"
  | "summaryAPY"
  | "description"
  | "rewardProgramName"
  | "displayName"
  | "incentivizedPoolSymbols"
  | "startDateTimeISO"
  | "endDateTimeISO"
>;

export type PoolPageColumn = {
  id: PoolPageColumnId;
  name: string;
  class: string;
  help?: string | JSX.Element;
  sortable?: boolean;
};
export const COLUMNS: PoolPageColumn[] = [
  {
    id: "token",
    name: "Token Pair",
    class: "w-[260px] text-left justify-start",
    sortable: true,
  },
  {
    id: "apy",
    name: "Pool APY",
    class: "w-[128px] text-right justify-end",
    sortable: true,
    help: (
      <div>
        Pool APR is an estimate of trading fees generated from this pool, and is
        calculated as{" "}
        <span class="font-mono">24hour_trading_volume / pool_depth</span> for
        each pool.
      </div>
    ),
  },
  {
    id: "rewardApy",
    name: "Reward APR (APY)",
    class: "w-[150px] text-right justify-end",
    sortable: true,
    help: (
      <div>
        The Reward APY is calculated as the rate of return from the given reward
        APR, compounded weekly.
      </div>
    ),
  },
  {
    id: "userShare",
    name: "Your Pool Share",
    class: "w-[128px] text-right justify-end",
  },
  {
    id: "userValue",
    name: "Your Pool Value",
    help: "This is your estimated pool value in USD assuming you remove your liquidity equally across both tokens. This number does not take into consideration any projected or earned rewards.",
    class: "w-[168px] text-right justify-end",
  },
];

export const COLUMNS_LOOKUP = COLUMNS.reduce((acc, col) => {
  acc[col.id] = col;
  return acc;
}, {} as Record<PoolPageColumnId, PoolPageColumn>);

export const usePoolPageData = () => {
  const liquidityProvidersQuery = useLiquidityProvidersQuery();
  const tokenRegistryEntriesQuery = useTokenRegistryEntriesQuery();

  const statsRes = usePoolStats();
  const { services } = useCore();

  useUserPoolsSubscriber({});
  usePublicPoolsSubscriber({});

  const syncUserPoolQuery = useQuery(
    ["userPoolsData", accountStore.refs.sifchain.connected.computed()],
    () => {
      const address = accountStore.state.sifchain.address;
      if (!address) return;
      return useCore().usecases.clp.syncPools.syncUserPools(address);
    },
  );

  const rewardProgramsRes = useAsyncData(() =>
    services.data.getRewardsPrograms(),
  );

  const allPoolsData = computed(() => {
    const sifchainChain = useChains().get(Network.SIFCHAIN);
    return (statsRes.data?.value?.poolData?.pools || []).map((poolStat) => {
      const poolKey = createPoolKey(
        sifchainChain.lookupAssetOrThrow("rowan"),
        sifchainChain.lookupAssetOrThrow(poolStat.symbol),
      );
      let accountPool: AccountPool | undefined = undefined;
      if (accountStore.state.sifchain.address) {
        accountPool =
          useCore().store.accountpools[accountStore.state.sifchain.address][
            poolKey
          ];
      }

      const liquidityProvider =
        liquidityProvidersQuery.data.value?.liquidityProviderData.find((x) => {
          const tokenRegistryEntry =
            tokenRegistryEntriesQuery.data.value?.registry?.entries.find(
              (y) => y.denom === x.liquidityProvider?.asset?.symbol,
            );

          return tokenRegistryEntry?.baseDenom === poolStat.symbol;
        });

      const item = {
        poolStat,
        pool: useCore().store.pools[poolKey],
        accountPool,
        liquidityProvider,
      };
      return item;
    });
  });

  return {
    rewardProgramsRes,
    isLoaded: computed(() => {
      return (
        !statsRes.isLoading.value &&
        !syncUserPoolQuery.isLoading.value &&
        allPoolsData.value.length > 0 &&
        !accountStore.state.sifchain.connecting &&
        liquidityProvidersQuery.isFetched &&
        tokenRegistryEntriesQuery.isFetched
      );
    }),
    allPoolsData,
    reload: () => {
      // NOTE: intentionally left out liquidityProvidersQuery & tokenRegistryEntriesQuery
      // those cache are handled globally, need to refactor usePoolPageData and extract those query out if possible
      rewardProgramsRes.reload.value();
      syncUserPoolQuery.refetch.value();
    },
  };
};
