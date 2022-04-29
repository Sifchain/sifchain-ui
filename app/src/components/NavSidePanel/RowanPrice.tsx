import { computed, defineComponent } from "vue";
import { usePoolStats } from "@/hooks/usePoolStats";
import NavSidePanelItem from "./NavSidePanelItem";

export default defineComponent({
  name: "RowanPrice",
  setup() {
    const poolStats = usePoolStats();
    const rowanPrice = computed(() => {
      return poolStats.data.value?.rowanUsd;
    });

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
