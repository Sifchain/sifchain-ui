import { flagsStore } from "@/store/modules/flags";
import { useAsyncData } from "./useAsyncData";
import { useCore } from "./useCore";

const MOCK_PMTP_RESPONSE = {
  params: {
    pmtpPeriodGovernanceRate: "100000000000000000",
    pmtpPeriodEpochLength: {
      low: 100,
      high: 0,
      unsigned: false,
    },
    pmtpPeriodStartBlock: {
      low: 1721,
      high: 0,
      unsigned: false,
    },
    pmtpPeriodEndBlock: {
      low: 2720,
      high: 0,
      unsigned: false,
    },
  },
  pmtpRateParams: {
    pmtpPeriodBlockRate: "953556143896472",
    pmtpCurrentRunningRate: "2489657071965120626989126444",
    pmtpInterPolicyRate: "2489657071965120626989126444",
  },
  pmtpEpoch: {
    epochCounter: {
      low: 0,
      high: 0,
      unsigned: false,
    },
    blockCounter: {
      low: 0,
      high: 0,
      unsigned: false,
    },
  },
  height: {
    low: 4988,
    high: 0,
    unsigned: false,
  },
};

export default function usePmtpParams() {
  const core = useCore();

  return useAsyncData(async () => {
    if (!flagsStore.state.pmtp) {
      return MOCK_PMTP_RESPONSE.params;
    }
    try {
      const res = await core.services.clp.getPmtpParams();

      return res.params;
    } catch (error) {
      return MOCK_PMTP_RESPONSE.params;
    }
  });
}
