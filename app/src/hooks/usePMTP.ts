import { useQuery } from "vue-query";
import { PmtpParams } from "@sifchain/sdk/build/typescript/generated/sifnode/clp/v1/params";

import { flagsStore } from "@/store/modules/flags";
import { useCore } from "./useCore";

const MOCK_PMTP_RESPONSE: PmtpParams = {
  pmtpPeriodGovernanceRate: "100000000000000000",
  pmtpPeriodEpochLength: {
    low: 100,
    high: 0,
    unsigned: false,
  } as PmtpParams["pmtpPeriodEpochLength"],
  pmtpPeriodStartBlock: {
    low: 1721,
    high: 0,
    unsigned: false,
  } as PmtpParams["pmtpPeriodStartBlock"],
  pmtpPeriodEndBlock: {
    low: 2720,
    high: 0,
    unsigned: false,
  } as PmtpParams["pmtpPeriodEndBlock"],
};

export default function usePmtpParams() {
  const core = useCore();

  return useQuery(["pmtp-params"], async (): Promise<PmtpParams> => {
    if (!flagsStore.state.pmtp) {
      return MOCK_PMTP_RESPONSE;
    }
    try {
      const res = await core.services.clp.getPmtpParams();

      return res.params as PmtpParams;
    } catch (error) {
      return MOCK_PMTP_RESPONSE;
    }
  });
}
