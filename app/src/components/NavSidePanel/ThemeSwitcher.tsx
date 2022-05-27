import { computed, defineComponent, ref } from "vue";
import Toggle from "~/components/Toggle";

import NavSidePanelItem from "./NavSidePanelItem";

export default defineComponent({
  name: "ThemeSwitcher",
  setup() {
    const theme = ref<"dark" | "light">("dark");

    const icon = computed(() =>
      theme.value === "dark" ? "interactive/moon" : "interactive/sun",
    );

    return () => {
      return (
        <NavSidePanelItem
          icon={icon.value}
          displayName="Dark mode"
          action={
            <Toggle
              active={theme.value === "dark"}
              onChange={() => {
                theme.value = theme.value === "dark" ? "light" : "dark";
              }}
            />
          }
        />
      );
    };
  },
});
