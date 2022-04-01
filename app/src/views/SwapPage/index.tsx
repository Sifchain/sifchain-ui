import { flagsStore } from "@/store/modules/flags";
import { defineComponent } from "vue";
import SwapPage from "./SwapPage";
import SwapPageV2 from "./SwapPageV2";

export default defineComponent({
  setup() {
    const isPMTPEnabled = flagsStore.state.pmtp;

    return () => (isPMTPEnabled ? <SwapPageV2 /> : <SwapPage />);
  },
});
