import { onMounted, onUnmounted, computed, Ref, watch, ref } from "vue";
import { useAsyncDataCached } from "@/hooks/useAsyncDataCached";
import { accountStore } from "@/store/modules/accounts";
import { Asset, IAsset } from "@sifchain/sdk";
import { useNativeChain } from "@/hooks/useChains";
import { prettyNumber } from "@/utils/prettyNumber";
import { isAssetFlaggedDisabled } from "@/store/modules/flags";
import { IconName } from "@/components/AssetIcon";

export const COMPETITIONS: Record<
  string,
  {
    bucket: Record<CompetitionType, number | null>;
    displayName: string;
    description: string;
    icon: {
      type: "AssetIcon" | "TokenIcon";
      icon: IconName | IAsset;
    };
  }
> = {
  ALL: {
    bucket: {
      txn: 1_000_000,
      vol: 3_000_000,
    },
    displayName: "Sif's Fields of Gold",
    description:
      "Get ready to swap! The Fields of Gold competition awards the top 30 swappers across all pairs, in both swap dollar volume and swap transaction count.",
    icon: {
      type: "AssetIcon",
      icon: "interactive/wreath",
    },
  },
  cdino: {
    bucket: {
      txn: 50_000,
      vol: 50_000,
    },
    description:
      "The Dino Battle of the Trade Winds competition awards the top 30 Dino swappers in both swap dollar volume and swap transaction count!",
    displayName: "Dino: Battle of the Tradewinds",
    icon: {
      type: "TokenIcon",
      icon: Asset("cdino"),
    },
  },
  uakt: {
    bucket: {
      txn: 50_000,
      vol: 50_000,
    },
    description:
      "The Akash Battle of the Trade Winds competition awards the top 30 Akash swappers in both swap dollar volume and swap transaction count!",
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
    title: "Swap Tx Count",
    description:
      "In a Swap Tx Count competition, winners have the highest swap count. This competition is best for bot developers. Click to learn more.",
    link: "https://docs.sifchain.finance",
  },
  vol: {
    renderValue: (value: number) => `Volume $${prettyNumber(value, 0)}`,
    title: "Swap Tx Volume",
    description:
      "In a Swap Tx Volume competition, winners have the most swap volume. This competition is best for those with large amounts of capital. Click to learn more.",
    link: "https://docs.sifchain.finance",
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
  pendingReward: number;
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
  iconType: "AssetIcon" | "TokenIcon";
  icon: IAsset | IconName;
  description: string;
  rewardBucket: number;
};
export type CompetitionsLookup = Record<CompetitionType, Competition | null>;
export type CompetitionsBySymbolLookup = Record<string, CompetitionsLookup>;

async function fetchJsonWithError<T>(url: string) {
  const res = await fetch(url);
  if (!res.ok) {
    let message = "Fetch Error";
    try {
      message = await res.text();
    } catch (_) {}
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
  pendingReward: 0,
});

export const getTransactionData = async (symbol: string) => {
  const items = await fetchJsonWithError<RawApiLeaderboardItem[]>(
    "https://data.sifchain.finance/beta/trade/tx_vol/txn/" + symbol,
  );
  const parsed: LeaderboardItem[] = items.map(parseApiLeaderboardItem);
  const total = parsed.reduce((acc, item) => {
    return acc + item.value;
  }, 0);
  return parsed.map((item) => ({
    ...item,
    pendingReward: (item.value / total) * TOTAL_REWARD_BUCKET.txn,
  }));
};

export const getVolumeData = async (symbol: string) => {
  const items = await fetchJsonWithError<RawApiLeaderboardItem[]>(
    "https://data.sifchain.finance/beta/trade/tx_vol/vol/" + symbol,
  );
  const parsed: LeaderboardItem[] = items.map(parseApiLeaderboardItem);
  const total = parsed.reduce((acc, item) => {
    return acc + item.value;
  }, 0);
  return parsed.map((item) => ({
    ...item,
    pendingReward: (item.value / total) * TOTAL_REWARD_BUCKET.txn,
  }));
};

export const getAccountData = async (symbol: string, address?: string) => {
  if (!address) return null;

  const items = await fetchJsonWithError<RawApiLeaderboardItem[]>(
    `https://data.sifchain.finance/beta/trade/tx_vol/${[address, symbol]
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

export const useLeaderboardCompetitions = () => {
  return useAsyncDataCached(
    "leaderboardCompetitions",
    async (): Promise<CompetitionsBySymbolLookup> => {
      const json = await fetchJsonWithError<
        [
          {
            program: string;
            type: CompetitionType;
            participants: string;
            program_start: string;
            program_end: string;
            last_updated: string;
            last_traded_height: string;
          },
        ]
      >("https://data.sifchain.finance/beta/trade/tx_vol/type");

      const lookup: CompetitionsBySymbolLookup = {};

      json.forEach((item) => {
        const competitionData =
          COMPETITIONS[item.program as keyof typeof COMPETITIONS];
        if (!competitionData)
          return console.log("Unrecognized competition program", item.program);

        if (!lookup[item.program]) {
          lookup[item.program] = { vol: null, txn: null };
        }
        if (!competitionData.bucket[item.type]) {
          return console.log(
            `Unrecognized competition type within program ${item.program}: ${item.type}`,
          );
        }

        lookup[item.program][item.type] = {
          asset: useNativeChain().lookupAsset(item.program),
          isUniversal: item.program === "ALL",
          type: item.type as CompetitionType,
          participants: parseInt(item.participants),
          startDateTime: new Date(item.program_start),
          endDateTime: new Date(item.program_end),
          symbol: item.program,
          displayName: competitionData.displayName,
          rewardBucket: competitionData.bucket[item.type] as number,
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
  const transactionRes = useAsyncDataCached("leaderboardTxn", () =>
    getTransactionData(params.symbol.value),
  );
  const volumeRes = useAsyncDataCached("leaderboardVol", () =>
    getVolumeData(params.symbol.value),
  );

  const accountRes = useAsyncDataCached(
    "leaderboardAccount",
    () =>
      getAccountData(params.symbol.value, accountStore.state.sifchain.address),
    [accountStore.refs.sifchain.address.computed()],
  );

  const isReloading = ref(false);
  watch(params.symbol, async () => {
    isReloading.value = true;
    try {
      await Promise.all([
        accountRes.reload.value(),
        volumeRes.reload.value(),
        transactionRes.reload.value(),
      ]);
    } finally {
      isReloading.value = false;
    }
  });

  const competitionsRes = useLeaderboardCompetitions();

  return {
    isLoadingFirstTime: computed(() => {
      return [transactionRes, volumeRes, accountRes, competitionsRes].some(
        (res) => {
          return res.isLoading.value && !res.data.value;
        },
      );
    }),
    isReloading,
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
