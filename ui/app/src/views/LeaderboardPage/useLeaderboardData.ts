import { onMounted, onUnmounted, computed } from "vue";
import { useAsyncDataCached } from "@/hooks/useAsyncDataCached";
import { accountStore } from "@/store/modules/accounts";

export const TOTAL_REWARD_BUCKET = {
  vol: 2_000_000,
  txn: 2_000_000,
};
export const COMPETITION_END_DATE = new Date("2021-11-08T08:00:00.000Z");

export type LeaderboardCompetitionType = "vol" | "txn";

export type RawApiLeaderboardItem = {
  rank: number;
  addr: string;
  volume: string | null;
  txns: string | null;
  name: string;
  date_stated_trading: string;
  date_last_traded: string;
  last_traded_height: string;
  type: LeaderboardCompetitionType;
};

export type LeaderboardItem = {
  rank: number;
  address: string;
  value: number;
  type: LeaderboardCompetitionType;
  name: string;
  dateStartedTrading: Date;
  dateLastTraded: Date;
  lastTradedHeight: string;
  pendingReward: number;
};

async function fetchJsonWithError<T>(url: string) {
  const res = await fetch(url);
  if (!res.ok) {
    let message = "Fetch Error";
    try {
      message = await res.text();
    } catch (_) {}
    throw new Error(message);
  }
  return (await res.json()) as T;
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

export const getTransactionData = async () => {
  const items = await fetchJsonWithError<RawApiLeaderboardItem[]>(
    "https://data.sifchain.finance/beta/trade/tx_vol/txn",
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

export const getVolumeData = async () => {
  const items = await fetchJsonWithError<RawApiLeaderboardItem[]>(
    "https://data.sifchain.finance/beta/trade/tx_vol/vol",
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

export const getAccountData = async (address?: string) => {
  if (!address) return null;

  const items = await fetchJsonWithError<RawApiLeaderboardItem[]>(
    `https://data.sifchain.finance/beta/trade/tx_vol/${address}`,
  );
  console.log("items", items);
  return {
    vol: parseApiLeaderboardItem(items.find((i) => i.type === "vol")!),
    txn: parseApiLeaderboardItem(items.find((i) => i.type === "txn")!),
  };
};

export const useLeaderboardData = () => {
  const transactionRes = useAsyncDataCached(
    "leaderboardTxn",
    getTransactionData,
  );
  const volumeRes = useAsyncDataCached("leaderboardVol", getVolumeData);

  const accountRes = useAsyncDataCached(
    "leaderboardAccount",
    () => getAccountData(accountStore.state.sifchain.address),
    [accountStore.refs.sifchain.address.computed()],
  );

  let fetchTimeoutId: NodeJS.Timeout;
  async function fetchLoop() {
    // Re-fetch on a loop, and immediately if cached
    [transactionRes, volumeRes, accountRes].forEach((res) => {
      if (!res.isLoading.value) res.reload.value();
    });

    // If user has tab open in background, don't refetch until they come back.
    if (document.visibilityState !== "visible") {
      document.addEventListener("visibilitychange", onVisibilityChange);
    } else {
      fetchTimeoutId = setTimeout(fetchLoop, 1 * 60 * 1000);
    }
  }
  function onVisibilityChange() {
    document.removeEventListener("visibilitychange", onVisibilityChange);
    fetchLoop();
  }

  onMounted(() => {
    fetchLoop();
  });
  onUnmounted(() => {
    clearTimeout(fetchTimeoutId);
  });

  return {
    isLoading: computed(() => {
      return [transactionRes, volumeRes, accountRes].some((res) => {
        return res.isLoading.value && !res.data.value;
      });
    }),
    error: computed(() => transactionRes.error.value || volumeRes.error.value),
    volumeData: volumeRes.data,
    transactionData: transactionRes.data,
    accountData: computed(
      () => accountRes.data.value || { vol: null, txn: null },
    ),
  };
};
