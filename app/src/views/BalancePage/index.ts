import { flagsStore } from "@/store/modules/flags";
import { default as BalancePage } from "./BalancePage";
import { default as BalancePageV2 } from "./BalancePageV2";

export default flagsStore.state.balancePageV2 ? BalancePageV2 : BalancePage;
