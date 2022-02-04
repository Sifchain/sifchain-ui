import { flagsStore } from "@/store/modules/flags";
import { default as Select } from "./Select";
import { default as SelectV2 } from "./SelectV2";

export default flagsStore.state.importBalancesV2 ? SelectV2 : Select;
