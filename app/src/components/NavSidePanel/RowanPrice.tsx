import { defineComponent } from "vue";
import { useRowanPrice } from "~/hooks/useRowanPrice";

import NavSidePanelItem from "./NavSidePanelItem";

export default defineComponent({
  name: "RowanPrice",
  setup() {
    const { data: rowanPrice } = useRowanPrice();

    return () => (
      <NavSidePanelItem
        class="opacity-50"
        displayName={
          <>
            {rowanPrice.value ? `$${(+rowanPrice.value).toFixed(5)}` : "..."} /
            ROWAN
          </>
        }
        icon="navigation/rowan"
        nonInteractable
      />
    );
  },
});
