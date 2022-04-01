import { flagsStore } from "@/store/modules/flags";
import { default as SwapPage } from "./SwapPage";
import { default as SwapPageV2 } from "./SwapPageV2";

export default flagsStore.state.pmtp ? SwapPageV2 : SwapPage;
