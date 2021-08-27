export type CryptoeconomicsUserData = null | {
  user?: {
    maturityDate: Date;
    dispensed: number;
    claimedCommissionsAndRewardsAwaitingDispensation: number;
    currentTotalCommissionsOnClaimableDelegatorRewards: number;
    nextRewardProjectedAPYOnTickets: number;
    totalClaimableCommissionsAndClaimableRewards: number;
    totalCommissionsAndRewardsAtMaturity: number;
    claimableReward: number;
    totalRewardAtMaturity: number;
    currentAPYOnTickets: number;
  };
};

export type CryptoeconomicsServiceContext = {
  cryptoeconomicsUrl: string;
};

export type CryptoeconomicsRewardType = "vs" | "lm";

export interface FetchDataProps {
  rewardType?: CryptoeconomicsRewardType;
  address: string;
  key?: string;
  timestamp?: string;
  snapShotSource?: string;
}

export default function createCryptoeconomicsService(
  config: CryptoeconomicsServiceContext,
) {
  async function fetchData(
    props: FetchDataProps,
  ): Promise<CryptoeconomicsUserData> {
    const params = new URLSearchParams();
    params.set("address", props.address);
    params.set("key", props.key || "userData");
    params.set("timestamp", props.timestamp || "now");
    props.snapShotSource
      ? params.set("snapshot-source", props.snapShotSource)
      : null;
    const res = await fetch(
      `${config.cryptoeconomicsUrl}/${props.rewardType}?${params.toString()}`,
    );
    if (!res.ok) {
      return null;
    } else {
      const json = await res.json();
      if (json.user?.maturityDateISO) {
        json.user.maturityDate = new Date(json.user.maturityDateISO);
      }
      return json;
    }
  }

  return {
    fetchData,
    getAddressLink: (
      address: string,
      rewardType: CryptoeconomicsRewardType,
    ) => {
      return `https://cryptoeconomics.sifchain.finance/#${address}&type=${rewardType}`;
    },
    async fetchSummaryAPY() {
      const summaryAPY: number = await fetch(
        `https://api-cryptoeconomics.sifchain.finance/api/lm?key=apy-summary`,
      )
        .then((r) => r.json())
        .then((r) => r.summaryAPY);
      return summaryAPY;
    },
    fetchVsData: (options: FetchDataProps) =>
      fetchData({
        ...options,
        rewardType: "vs",
      }),
    fetchLmData: (options: FetchDataProps) =>
      fetchData({
        ...options,
        rewardType: "lm",
      }),
  };
}
