import { flagsStore } from "@/store/modules/flags";
import { useAsyncData } from "./useAsyncData";
import { useCore } from "./useCore";

const MOCK_PMTP_PARAMS = {
  min_create_pool_threshold: "100",
  pmtp_period_governance_rate: "0.000000000000000000",
  pmtp_period_epoch_length: "7",
};

export default function usePmtpParams() {
  const core = useCore();
  return useAsyncData(async () => {
    if (!flagsStore.state.pmtp) {
      return MOCK_PMTP_PARAMS;
    }
    try {
      return await core.services.clp.getPmtpParams();
    } catch (error) {
      return MOCK_PMTP_PARAMS;
    }
  });
}
