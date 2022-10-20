import { useQuery } from "vue-query";

import { flagsStore } from "~/store/modules/flags";
import { useCore } from "./useCore";

const MOCK_PMTP_RESPONSE = {
  pmtpPeriodGovernanceRate: "000000000000000000",
  active: false,
};

type PmtpParamsResponse = {
  pmtpPeriodGovernanceRate?: string;
  active: boolean;
};

export default function usePmtpParams() {
  const core = useCore();

  return useQuery(
    ["pmtp-params"],
    async (): Promise<PmtpParamsResponse> => {
      if (!flagsStore.state.pmtp) {
        return MOCK_PMTP_RESPONSE;
      }
      try {
        const res = await core.services.clp.getPmtpParams();

        return {
          active: Boolean(
            res.params && res.params.pmtpPeriodEndBlock.gt(res.height),
          ),
          pmtpPeriodGovernanceRate: res.params?.pmtpPeriodGovernanceRate,
        };
      } catch (error) {
        return MOCK_PMTP_RESPONSE;
      }
    },
    {
      refetchInterval: 60000,
    },
  );
}
