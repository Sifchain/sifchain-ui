import OnboardingModal from "@/components/OnboardingModal";
import { modalsStore } from "@/store/modules/modals";
import { defineComponent } from "@vue/runtime-core";
import { computed } from "vue";
import KeplrModal from "./KeplrModal";

export const GlobalModals = defineComponent({
  name: "GlobalModals",
  setup() {
    const render = computed(
      () =>
        [
          {
            condition: modalsStore.refs.keplrTutorial.computed(),
            render: () => (
              <KeplrModal onClose={() => modalsStore.setKeplrTutorial(false)} />
            ),
          },
        ].find((item) => item.condition.value)?.render,
    );
    return {
      render,
    };
  },
  render() {
    if (this.render) return this.render();
  },
});
