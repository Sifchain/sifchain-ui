import { useQuery } from "vue-query";
import { computed } from "vue";
import { createPoolKey, LiquidityProvider, Network, Pool } from "@sifchain/sdk";

import { AccountPool } from "~/business/store/pools";
import { useLiquidityProvidersQuery } from "~/domains/clp/queries/liquidityProvider";
import { useTokenRegistryEntriesQuery } from "~/domains/tokenRegistry/queries/tokenRegistry";
import { useChains } from "~/hooks/useChains";
import { useCore } from "~/hooks/useCore";
import {
  usePublicPoolsSubscriber,
  useUserPoolsSubscriber,
} from "~/hooks/usePoolsSubscriber";
import { usePoolStats } from "~/hooks/usePoolStats";
import { accountStore } from "~/store/modules/accounts";
import { RewardProgram } from "../RewardsPage/useRewardsPageData";
import {
  useLPUserRewards,
  useRewardsPrograms,
} from "~/business/services/DataService";

export type PoolPageAccountPool = {
  lp: LiquidityProvider;
  pool: Pool;
};

export type PoolPageData = ReturnType<typeof usePoolPageData>;

export type PoolPageColumnId =
  | "token"
  | "rowanApr"
  | "pairedApr"
  // | "marginapy"
  | "gainLoss"
  | "poolTvl"
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
    class: "w-[260px] text-left justify-start whitespace-nowrap",
    sortable: true,
  },
  {
    id: "poolTvl",
    name: "Pool TVL",
    sortable: true,
    class: "w-[128px] text-right justify-end whitespace-nowrap",
  },
  {
    id: "rowanApr",
    name: "Rowan APR",
    class: "w-[128px] text-right justify-end whitespace-nowrap",
    sortable: true,
    help: (
      <code class="text-xs">
        Annualized reward rate, paid in Rowan. Rowan APR = Total rewards
        distributed in current program / (Total blocks passed in current program
        * Current pool balance) * (Total blocks per year)
      </code>
    ),
  },
  {
    id: "pairedApr",
    name: "Paired APR",
    class: "w-[128px] text-right justify-end whitespace-nowrap",
    sortable: true,
    help: (
      <code class="text-xs">
        Annualized reward rate, paid in the paired token.
      </code>
    ),
  },
  // {
  //   id: "marginapy",
  //   name: "Margin APY",
  //   class: "w-[128px] text-right justify-end whitespace-nowrap",
  //   sortable: true,
  // },
  {
    id: "userShare",
    name: "Your Pool Share",
    class: "w-[128px] text-right justify-end whitespace-nowrap",
  },
  {
    id: "userValue",
    name: "Your Pool Value",
    help: "This is your estimated pool value in USD assuming you remove your liquidity equally across both tokens. This number does not take into consideration any projected or earned rewards.",
    class: "w-[168px] text-right justify-end whitespace-nowrap",
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

  useUserPoolsSubscriber({});
  usePublicPoolsSubscriber({});

  const sifAddress = accountStore.refs.sifchain.address.computed();

  const syncUserPoolQuery = useQuery(
    ["userPoolsData", accountStore.refs.sifchain.connected.computed()],
    () => {
      const address = accountStore.state.sifchain.address;
      if (!address) {
        return;
      }

      return useCore().usecases.clp.syncPools.syncUserPools(address);
    },
  );

  const rewardProgramsRes = useRewardsPrograms();

  const { data: lppdRewards } = useLPUserRewards(sifAddress);

  const allPoolsData = computed(() => {
    const sifchainChain = useChains().get(Network.SIFCHAIN);

    if (!statsRes.data.value) {
      return {
        poolStat: null,
        pool: null,
        accountPool: null,
        liquidityProvider: null,
        lppdRewards: null,
      };
    } else {
      const { poolData } = statsRes.data.value;
      const pools = poolData.pools as Record<string, PoolStat>;
      return Object.entries(pools).map(([key, poolStat]) => {
        const poolKey = createPoolKey(
          sifchainChain.lookupAssetOrThrow("rowan"),
          sifchainChain.lookupAssetOrThrow(poolStat.symbol),
        );
        let accountPool: AccountPool | undefined = undefined;
        if (sifAddress.value) {
          accountPool = useCore().store.accountpools[sifAddress.value][poolKey];
        }

        const liquidityProvider =
          liquidityProvidersQuery.data.value?.liquidityProviderData.find(
            (x) => {
              const tokenRegistryEntry =
                tokenRegistryEntriesQuery.data.value?.registry?.entries.find(
                  (y) => y.denom === x.liquidityProvider?.asset?.symbol,
                );

              return tokenRegistryEntry?.baseDenom === poolStat.symbol;
            },
          );

        const pool = useCore().store.pools[poolKey];
        const ibcDenom =
          tokenRegistryEntriesQuery.data.value?.registry?.entries.find(
            (y) => y.baseDenom === pool.externalAmount.symbol,
          )?.denom;
        const denomOrSymbol = ibcDenom ?? pool.externalAmount.symbol;

        const lppdPoolRewards = lppdRewards?.value?.hasRewards
          ? lppdRewards.value.rewards.byPool[denomOrSymbol]
          : undefined;

        return {
          poolStat,
          pool,
          accountPool,
          liquidityProvider,
          lppdRewards: lppdPoolRewards,
        };
      });
    }
  });

  return {
    rewardProgramsRes,
    isLoading: computed(() => {
      return (
        allPoolsData.value.length === 0 ||
        statsRes.isLoading.value ||
        syncUserPoolQuery.isLoading.value ||
        accountStore.state.sifchain.connecting ||
        liquidityProvidersQuery.isLoading.value ||
        tokenRegistryEntriesQuery.isLoading.value
      );
    }),
    allPoolsData,
    lppdRewards,
    reload: () => {
      // NOTE: intentionally left out liquidityProvidersQuery & tokenRegistryEntriesQuery
      // those cache are handled globally, need to refactor usePoolPageData and extract those query out if possible
      rewardProgramsRes.refetch.value();
      syncUserPoolQuery.refetch.value();
    },
  };
};
