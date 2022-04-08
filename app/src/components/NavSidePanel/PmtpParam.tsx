import { computed, defineComponent } from "vue";
import { Amount, format } from "@sifchain/sdk";

import usePmtpParams from "@/hooks/usePMTP";
import { flagsStore } from "@/store/modules/flags";
import NavSidePanelItem from "./NavSidePanelItem";

const PMTP_ROADMAP_URL =
  "https://docs.sifchain.finance/project/about-sifchain/roadmap/pmtp";

export default defineComponent({
  name: "PmtpParam",
  setup() {
    const isPMTPEnabled = flagsStore.state.pmtp;
    const pmtp = usePmtpParams();

    const displayValue = computed(() => {
      if (!pmtp.data.value) {
        return "...";
      }

      const amount = Amount(pmtp.data.value?.pmtpPeriodGovernanceRate ?? "0")
        .divide("1".concat("0".repeat(18)))
        .multiply("100");

      return `${format(amount, {
        mantissa: 4,
      })}%`;
    });

    return () =>
      !isPMTPEnabled || !pmtp.data.value?.active ? null : (
        <NavSidePanelItem
          class="opacity-50"
          href={PMTP_ROADMAP_URL}
          displayName={<>PMTP {displayValue.value}</>}
          icon="interactive/policy"
        />
      );
  },
});
