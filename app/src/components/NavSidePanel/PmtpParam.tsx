import { defineComponent } from "vue";

import usePmtpParams from "@/hooks/usePMTP";
import { flagsStore } from "@/store/modules/flags";
import NavSidePanelItem from "./NavSidePanelItem";

export default defineComponent({
  name: "PmtpParam",
  setup() {
    const isPMTPEnabled = flagsStore.state.pmtp;
    const pmtp = usePmtpParams();

    return () =>
      isPMTPEnabled && (
        <NavSidePanelItem
          class={"mt-[0px] opacity-50"}
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
