<template>
  <div class="main">
    <!-- <Header>
      <template v-slot:right>
        <WithWallet>
          <template v-slot:disconnected="{ requestDialog }">
            <Pill
              data-handle="button-connected"
              color="danger"
              @click="requestDialog"
            >
              Not connected
            </Pill>
          </template>
          <template v-slot:connected="{ requestDialog }">
            <Pill
              data-handle="button-connected"
              @click="requestDialog"
              color="success"
              class="connected-button"
              >CONNECTED</Pill
            >
          </template>
        </WithWallet>
      </template>
    </Header> -->
    <SideBar />
    <router-view />
    <Notifications />
    <EnvAlert />
  </div>
</template>

<script lang="ts">
import { defineComponent, watchEffect, ref, onMounted } from "vue";
import Notifications from "./componentsLegacy/Notifications/Notifications.vue";
import { useInitialize } from "./hooks/useInitialize";
import EnvAlert from "@/componentsLegacy/shared/EnvAlert.vue";
import SideBar from "@/componentsLegacy/NavSidePanel/NavSidePanel";
import Layout from "@/componentsLegacy/Layout/Layout";
import { useRoute, useRouter } from "vue-router";
import { accountStore } from "./store/modules/accounts";
import { Amount } from "@sifchain/sdk";
import OnboardingModal from "@/components/OnboardingModal";

const ROWAN_GAS_FEE = Amount("500000000000000000"); // 0.5 ROWAN

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
    Layout,
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
        hasHadValidChanceToLoadBalances.value;
      if (
        !hasSufficientRowanToTrade &&
        hasImportedAssets &&
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
        router.push({
          name: "Welcome",
        });
        hasShownOnboardingModal = true;
        localStorage.setItem("hasShownOnboardingModal", "true");
      }
    });
    /// Initialize app
    useInitialize();
    return { shouldShowOnboardingModal };
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
