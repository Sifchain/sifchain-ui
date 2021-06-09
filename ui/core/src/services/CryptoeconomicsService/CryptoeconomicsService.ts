export type CryptoeconomicsUserData = null | {
  currentAPYOnTickets: Number;
  maturityDate: Date;
  totalClaimableCommissionsAndClaimableRewards: Number;
};

export type CryptoeconomicsServiceContext = {};

export type CryptoeconomicsRewardType = "vs" | "lm";

export interface FetchDataProps {
  rewardType: CryptoeconomicsRewardType;
  address: string;
  key: string;
  timestamp: string;
}

export default function createCryptoeconomicsService({}: CryptoeconomicsServiceContext) {
  async function fetchData(
    props: FetchDataProps,
  ): Promise<CryptoeconomicsUserData> {
    const params = new URLSearchParams();
    params.set("address", props.address);
    params.set("key", props.key || "userData");
    params.set("timestamp", props.timestamp || "now");
    const res = await fetch(
      `https://api-cryptoeconomics.sifchain.finance/api/${
        props.rewardType
      }?${params.toString()}`,
    );
    const json: any = res.json();
    json.maturityDate = new Date(json.maturityDate);
    return json;
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
