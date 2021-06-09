export type CryptoeconomicsUserData = null | {
  maturityDate: Date;
  totalClaimableCommissionsAndClaimableRewards: number;
  user: {
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
  rewardType: CryptoeconomicsRewardType;
  address: string;
  key: string;
  timestamp: string;
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
    const res = await fetch(
      `${config.cryptoeconomicsUrl}/${props.rewardType}?${params.toString()}`,
    );
    if (!res.ok) {
      return null;
    } else {
      const json = await res.json();
      json.maturityDate = new Date(json.maturityDate);
      return json;
    }
  }

  return {
    fetchData,
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
