<template>
  <div class="main">
    <SideBar />
    <router-view />
    <OnboardingModal
      v-if="shouldShowOnboardingModal"
      :onClose="onCloseOnboardingModal"
    />
    <Notifications />
    <EnvAlert />
    <Flags />
  </div>
</template>

<script lang="ts">
import { defineComponent, watchEffect, ref, onMounted } from "vue";
import Notifications from "./componentsLegacy/Notifications/Notifications.vue";
import { useInitialize } from "./hooks/useInitialize";
import EnvAlert from "@/componentsLegacy/shared/EnvAlert.vue";
import SideBar from "@/componentsLegacy/NavSidePanel/NavSidePanel";
import Layout from "@/componentsLegacy/Layout/Layout";
import { Flags } from "@/components/Flags/Flags";
import { useRoute, useRouter } from "vue-router";
import { accountStore } from "./store/modules/accounts";
import { Amount } from "@sifchain/sdk";
import { shouldAllowFaucetFunding } from "@/hooks/useFaucet";
import OnboardingModal from "@/components/OnboardingModal";

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
  components: {
    Notifications,
    EnvAlert,
    SideBar,
    Flags,
    OnboardingModal,
  },
  computed: {
    key() {
      console.log(this.$route.path);
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
    return {
      shouldShowOnboardingModal,
      onCloseOnboardingModal: () => {
        shouldShowOnboardingModal.value = false;
      },
    };
  },
});
</script>

<style lang="scss">
// @import "normalize-scss";

// Import fonts:
// @import url("https://fonts.googleapis.com/css2?family=PT+Serif:ital,wght@0,400;0,700;1,400;1,700&family=Rouge+Script&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap");
@import url("https://fonts.googleapis.com/css?family=Roboto+Mono|Source+Sans+Pro:300,400,600");

@import "@/scss/utilities.scss";
@import "@/scss/reset.scss";

#app,
#portal-target,
#tooltip-target {
  // font: normal bold 14px/22px $f_default;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type="number"] {
  -moz-appearance: textfield;
}

.main {
  min-height: 100vh;
}

.connected-button {
  cursor: pointer;
}
</style>
