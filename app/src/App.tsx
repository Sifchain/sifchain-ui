import { Amount } from "@sifchain/sdk";
import { defineComponent, onMounted, ref, watchEffect } from "vue";
import { useRouter } from "vue-router";

import { useInitialize } from "~/hooks/useInitialize";
import EnvSwitcher from "~/components/EnvSwitcher";
import Flags from "~/components/Flags";
import SideBar from "~/components/NavSidePanel";
import Notifications from "~/components/Notifications";
import OnboardingModal from "~/components/OnboardingModal";
import { shouldAllowFaucetFunding } from "~/hooks/useFaucet";
import { accountStore } from "~/store/modules/accounts";

import "./App.scss";
import { SifchainClientsProvider } from "./business/providers/SifchainClientsProvider";

// not currently working? - McCall
const hideRedundantUselessMetamaskErrors = () => {
  let hiddenCount = 0;

  const originalError = console.error.bind(console);
  console.error = (...args: any[]) => {
    if (++hiddenCount === 1) {
      console.warn("Hiding redundant Metamask 'header not found' errors.");
    }
    if (
      args[0] &&
      typeof args[0] === "string" &&
      args[0].includes("MetaMask - RPC Error: header not found")
    ) {
      return;
    }
    return originalError(...args);
  };
};
hideRedundantUselessMetamaskErrors();

const ROWAN_GAS_FEE = Amount("400000000000000000"); // 0.4 ROWAN

let hasShownGetRowanModal = (() => {
  try {
    const val = !!localStorage.getItem("hasShownGetRowanModal");
    return val;
  } catch (e) {
    return true;
  }
})();
let hasShownOnboardingModal = (() => {
  try {
    const val = !!localStorage.getItem("hasShownOnboardingModal");
    return val;
  } catch (e) {
    return true;
  }
})();

export default defineComponent({
  name: "App",
  computed: {
    key() {
      return this.$route.path;
    },
  },
  setup() {
    const shouldShowOnboardingModal = ref(false);
    const router = useRouter();
    const hasHadValidChanceToLoadBalances = ref(false);
    onMounted(() => {
      setTimeout(() => {
        hasHadValidChanceToLoadBalances.value = true;
      }, 3000);
    });
    watchEffect(() => {
      const balances = accountStore.state.sifchain.balances;
      const hasSufficientRowanToTrade = balances.find(
        (b) =>
          b.asset.symbol.toLowerCase() === "rowan" &&
          b.amount.greaterThan(ROWAN_GAS_FEE),
      );
      const hasImportedAssets = balances.find(
        (b) =>
          b.asset.symbol.toLowerCase() !== "rowan" && b.amount.greaterThan("0"),
      );
      const shouldPossiblyShowOnboardingModal =
        hasHadValidChanceToLoadBalances.value &&
        accountStore.state.sifchain.hasLoadedBalancesOnce;
      if (
        !hasSufficientRowanToTrade &&
        hasImportedAssets &&
        shouldAllowFaucetFunding() &&
        !hasShownGetRowanModal
      ) {
        hasShownGetRowanModal = true;
        router.push({ name: "GetRowan" });
        localStorage.setItem("hasShownGetRowanModal", "true");
      } else if (
        shouldPossiblyShowOnboardingModal &&
        !hasImportedAssets &&
        !hasShownOnboardingModal
      ) {
        shouldShowOnboardingModal.value = true;
        hasShownOnboardingModal = true;
        localStorage.setItem("hasShownOnboardingModal", "true");
      }
    });
    /// Initialize app
    useInitialize();

    const onCloseOnboardingModal = () => {
      shouldShowOnboardingModal.value = false;
    };

    return () => (
      <div class="min-h-screen">
        <SifchainClientsProvider>
          <SideBar />
          <router-view />
          {shouldShowOnboardingModal.value && (
            <OnboardingModal onClose={onCloseOnboardingModal} />
          )}
          <Notifications />
          <EnvSwitcher />
          <Flags />
        </SifchainClientsProvider>
      </div>
    );
  },
});
