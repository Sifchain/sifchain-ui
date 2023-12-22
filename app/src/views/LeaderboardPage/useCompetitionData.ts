import { Asset, IAsset } from "@sifchain/sdk";
import { computed, Ref, ref, watch } from "vue";

import { IconName } from "~/components/AssetIcon";
import { useAsyncData } from "~/hooks/useAsyncData";
import { useAsyncDataCached } from "~/hooks/useAsyncDataCached";
import { useNativeChain } from "~/hooks/useChains";
import { useCore } from "~/hooks/useCore";
import { accountStore } from "~/store/modules/accounts";
import { flagsStore } from "~/store/modules/flags";
import { prettyNumber } from "~/utils/prettyNumber";

import { BASE_URL_DATA_SERVICES } from "../../business/services/DataService/DataService";

export const COMPETITIONS: Record<
  string,
  {
    displayName: string;
    description: string;
    icon:
      | {
          type: "TokenIcon";
          icon: IAsset;
        }
      | {
          type: "AssetIcon";
          icon: IconName;
        };
  }
> = {
  ALL: {
    displayName: "Sif's Fields of Gold",
    description:
      "Get ready to swap! The Fields of Gold competition awards the top swappers across all pairs, in both swap dollar volume and swap transaction count.",
    icon: {
      type: "AssetIcon",
      icon: "interactive/wreath",
    },
  },
  cdino: {
    description:
      "The Dino Battle of the Trade Winds competition awards the top Dino swappers in swap dollar volume.",
    displayName: "Dino: Battle of the Tradewinds",
    icon: {
      type: "TokenIcon",
      icon: Asset("cdino"),
    },
  },
  uakt: {
    description:
      "The Akash Battle of the Trade Winds competition awards the top Akash swappers in both swap dollar volume.",
    displayName: "Akash: Battle of the Tradewinds",
    icon: {
      type: "TokenIcon",
      icon: Asset("uakt"),
    },
  },
};

export const COMPETITION_TYPE_DISPLAY_DATA = {
  txn: {
    renderValue: (value: number) => `Tx ${prettyNumber(value, 0)}`,
    title: (competition: Competition) => "Swap Tx Count",
    description: (competition: Competition) => {
      return `This leaderboard is based on who has swapped the most transactions to present day. The total reward pool for this leaderboard is ${prettyNumber(
        competition.rewardBucket,
        0,
      )} ${competition.rewardAsset.displaySymbol.toUpperCase()}. Your payout amount is pre-determined by placement in the top ${
        competition.winners
      }. Click to learn more.`;
    },
    link: (competition: Competition) =>
      "https://docs.sifchain.network/sifchain/using-the-dex/web-ui-step-by-step/rewards/liquidity-mining-rewards-programs#sifs-fields-of-gold-trading-competition",
  },
  vol: {
    renderValue: (value: number) => `Volume $${prettyNumber(value, 0)}`,
    title: (competition: Competition) => "Swap Volume",
    description: (competition: Competition) => {
      return `This leaderboard is based on who has swapped the most volume to present day. The total reward pool for this leaderboard is ${prettyNumber(
        competition.rewardBucket,
        0,
      )} ${competition.rewardAsset.displaySymbol.toUpperCase()}. Your payout amount is determined by how much of the top ${
        competition.winners
      } swap volume you have. Click to learn more.`;
    },
    link: (competition: Competition) =>
      "https://docs.sifchain.network/sifchain/using-the-dex/web-ui-step-by-step/rewards/liquidity-mining-rewards-programs#sifs-fields-of-gold-trading-competition",
  },
};

export const TOTAL_REWARD_BUCKET = {
  vol: 2_000_000,
  txn: 2_000_000,
};
export const COMPETITION_END_DATE = new Date("2021-11-08T08:00:00.000Z");

export const COMPETITION_UNIVERSAL_SYMBOL = "ALL";

export type CompetitionType = "vol" | "txn";

export type RawApiLeaderboardItem = {
  rank: number;
  addr: string;
  volume: string | null;
  txns: string | null;
  name: string;
  date_stated_trading: string;
  date_last_traded: string;
  last_traded_height: string;
  type: CompetitionType;
};

export type LeaderboardItem = {
  rank: number;
  address: string;
  value: number;
  type: CompetitionType;
  name: string;
  dateStartedTrading: Date;
  dateLastTraded: Date;
  lastTradedHeight: string;
};

export type Competition = {
  asset?: IAsset;
  symbol: string;
  isUniversal: boolean;
  type: CompetitionType;
  participants: number;
  startDateTime: Date;
  endDateTime: Date;
  displayName: string;
  winners: number;
  iconType: "AssetIcon" | "TokenIcon";
  icon: IAsset | IconName;
  description: string;
  rewardBucket: number;
  rewardAsset: IAsset;
};
export type CompetitionsLookup = Record<CompetitionType, Competition | null>;
export type CompetitionsBySymbolLookup = Record<string, CompetitionsLookup>;

async function fetchJsonWithError<T>(url: string) {
  const res = await fetch(url);
  if (!res.ok) {
    let message = "Fetch Error";
    try {
      message = await res.text();
    } catch (_) {
      // ignore
    }
    throw new Error(message);
  }
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json as T;
}

const parseApiLeaderboardItem = (
  item: RawApiLeaderboardItem,
): LeaderboardItem => ({
  ...item,
  address: item.addr,
  value: parseFloat(item.txns || item.volume || "0"),
  dateStartedTrading: new Date(item.date_stated_trading),
  dateLastTraded: new Date(item.date_last_traded),
  lastTradedHeight: item.last_traded_height,
});

export const getTransactionData = async (symbol: string) => {
  const items = await fetchJsonWithError<RawApiLeaderboardItem[]>(
    [`${BASE_URL_DATA_SERVICES}/trade/tx_vol/txn`, symbol || ""]
      .filter(Boolean)
      .join("/"),
  );
  const parsed: LeaderboardItem[] = items.map(parseApiLeaderboardItem);
  return parsed;
};

export const getVolumeData = async (symbol: string) => {
  const items = await fetchJsonWithError<RawApiLeaderboardItem[]>(
    [`${BASE_URL_DATA_SERVICES}/trade/tx_vol/vol`, symbol || ""]
      .filter(Boolean)
      .join("/"),
  );
  const parsed: LeaderboardItem[] = items.map(parseApiLeaderboardItem);
  return parsed;
};

export const getAccountData = async (symbol: string, address?: string) => {
  if (!address) return null;

  const items = await fetchJsonWithError<RawApiLeaderboardItem[]>(
    `${BASE_URL_DATA_SERVICES}/trade/tx_vol/${[address, symbol]
      .filter(Boolean)
      .join("/")}`,
  );

  const volItem = items?.find((i) => i.type === "vol");
  const txnItem = items?.find((i) => i.type === "txn");
  return {
    vol: volItem ? parseApiLeaderboardItem(volItem) : null,
    txn: txnItem ? parseApiLeaderboardItem(txnItem) : null,
  };
};

export const useHasUniversalCompetition = () => {
  // Store in localStorage so UI can react on refresh
  // without a flicker while it waits for response
  const key = "has_universal_comp";
  const hasUniversalRef = ref(
    useCore().services.storage.getJSONItem<boolean>(key) ?? false,
  );

  const competitionsRes = useLeaderboardCompetitions();

  watch(
    competitionsRes.data,
    () => {
      const hasUniversal =
        Object.values(competitionsRes.data.value?.ALL || {}).filter(Boolean)
          .length > 0;
      hasUniversalRef.value = hasUniversal;
      useCore().services.storage.setJSONItem<boolean>(key, hasUniversal);
    },
    { deep: true },
  );

  return hasUniversalRef;
};

export const useLeaderboardCompetitions = () => {
  return useAsyncDataCached(
    "leaderboardCompetitions",
    async (): Promise<CompetitionsBySymbolLookup> => {
      if (!flagsStore.state.tradingCompetitionsEnabled) return {};

      const json = await fetchJsonWithError<
        [
          {
            program: string;
            type: CompetitionType;
            participants: string;
            prize_pool: string;
            start_trading: string;
            end_trading: string;
            last_updated: string;
            last_traded_height: string;
            program_start: string;
            program_end: string;
            winners: number;
          },
        ]
      >(`${BASE_URL_DATA_SERVICES}/trade/tx_vol/type`);

      const lookup: CompetitionsBySymbolLookup = {};

      json.forEach((item) => {
        const competitionData =
          COMPETITIONS[item.program as keyof typeof COMPETITIONS];
        if (!competitionData)
          return console.log("Unrecognized competition program", item.program);

        if (!lookup[item.program]) {
          lookup[item.program] = { vol: null, txn: null };
        }
        const startDateTime = new Date(item.program_start);
        const endDateTime = new Date(item.program_end);

        const hasNotStarted = new Date() < startDateTime;
        if (hasNotStarted) {
          return;
        }

        const asset = useNativeChain().lookupAsset(item.program);
        lookup[item.program][item.type] = {
          asset,
          isUniversal: item.program === "ALL",
          type: item.type as CompetitionType,
          participants: parseInt(item.participants),
          startDateTime,
          endDateTime,
          symbol: item.program,
          winners: item.winners,
          displayName: competitionData.displayName,
          rewardBucket: parseFloat(item.prize_pool),
          rewardAsset: asset || useNativeChain().nativeAsset,
          description: competitionData.description,
          iconType: competitionData.icon.type,
          icon: competitionData.icon.icon,
        };
      });
      return lookup;
    },
  );
};

export const useLeaderboardData = (params: { symbol: Ref<string> }) => {
  const transactionRes = useAsyncData(() =>
    getTransactionData(params.symbol.value),
  );
  const volumeRes = useAsyncData(() => getVolumeData(params.symbol.value));

  const accountRes = useAsyncData(
    () =>
      getAccountData(params.symbol.value, accountStore.state.sifchain.address),
    [params.symbol.value, accountStore.refs.sifchain.address.computed()],
  );

  const competitionsRes = useLeaderboardCompetitions();

  const isReloading = ref(false);
  const delayReloadRef = ref<NodeJS.Timeout | undefined>();
  watch(params.symbol, async () => {
    isReloading.value = true;
    if (delayReloadRef.value != null) clearTimeout(delayReloadRef.value);
    await Promise.all(
      [transactionRes, volumeRes, accountRes].map((res) => {
        return res.reload.value();
      }),
    );
    delayReloadRef.value = setTimeout(() => {
      isReloading.value = false;
    }, 1000);
  });

  return {
    isReloading,
    isLoading: computed(() => {
      return [transactionRes, volumeRes, accountRes, competitionsRes].some(
        (res) => {
          return res.isLoading.value && !res.data.value;
        },
      );
    }),
    error: computed(() => transactionRes.error.value || volumeRes.error.value),
    volumeData: volumeRes.data,
    transactionData: transactionRes.data,
    accountData: computed(
      () => accountRes.data.value || { vol: null, txn: null },
    ),

    accountRes,
    transactionRes,
    volumeRes,
    competitionsRes,
  };
};
