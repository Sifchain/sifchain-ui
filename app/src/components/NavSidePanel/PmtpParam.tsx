import { defineComponent } from "vue";

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

    return () =>
      isPMTPEnabled && (
        <NavSidePanelItem
          class="opacity-50"
          href={PMTP_ROADMAP_URL}
          displayName={
            <>
              PMTP{" "}
              {pmtp.isLoading.value
                ? "..."
                : `${(
                    Number(pmtp.data.value?.pmtp_period_governance_rate) * 100
                  ).toFixed(4)}%`}
            </>
          }
          icon="interactive/policy"
        />
      );
  },
});
