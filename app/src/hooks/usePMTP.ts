import { useAsyncData } from "./useAsyncData";
import { useCore } from "./useCore";

const MOCK_PMTP_PARAMS = {
  min_create_pool_threshold: "100",
  pmtp_period_governance_rate: "0.000000000000000000",
  pmtp_period_epoch_length: "7",
};

export default function usePMTP() {
  const core = useCore();
  return useAsyncData(async () => {
    try {
      return await core.services.clp.getPmtpParams();
    } catch (error) {
      return MOCK_PMTP_PARAMS;
    }
  });
}
