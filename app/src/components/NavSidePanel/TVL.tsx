import { defineComponent } from "vue";

import { useTVL } from "~/hooks/useTVL";
import NavSidePanelItem from "./NavSidePanelItem";

export default defineComponent({
  name: "TVL",
  setup() {
    const tvl = useTVL();

    return () => (
      <NavSidePanelItem
        class={"mt-[0px] opacity-50"}
        displayName={
          <>{tvl.data.value ? `${tvl.data.value.formatted}` : "..."} TVL</>
        }
        icon="interactive/lock"
        nonInteractable
      />
    );
  },
});
