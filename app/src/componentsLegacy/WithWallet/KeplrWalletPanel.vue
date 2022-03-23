<script lang="ts">
import { computed, defineComponent } from "vue";
import { useCore } from "@/hooks/useCore";
import SifButton from "@/componentsLegacy/SifButton/SifButton.vue";
import Icon from "@/componentsLegacy/Icon/Icon.vue";

export default defineComponent({
  name: "KeplrWalletController",
  components: { SifButton, Icon },
  setup() {
    const { store, usecases } = useCore();
    async function handleConnectClicked() {
      try {
        await usecases.wallet.sif.connectToSifWallet();
      } catch (error) {
        console.log("KeplrWalletController", error);
      }
    }
    const address = computed(() => store.wallet.get(Network.SIFCHAIN).address);
    const connected = computed(
      () => store.wallet.get(Network.SIFCHAIN).isConnected,
    );
    return {
      address,
      connected,
      handleConnectClicked,
    };
  },
});
</script>

<template>
  <div class="wrapper">
    <div v-if="connected">
      <p class="mb-2" v-if="address">{{ address }} <Icon icon="tick" /></p>
      <SifButton connect disabled data-handle="keplr-connect-button">
        <img class="image" src="../../assets/keplr.jpg" />
        Keplr Connected
      </SifButton>
    </div>
    <SifButton
      connect
      v-else
      @click="handleConnectClicked"
      data-handle="keplr-connect-button"
      >Connect Keplr</SifButton
    >
  </div>
</template>

<style lang="scss" scoped>
.image {
  height: 100%;
  width: 20px;
  margin-right: 16px;
  margin-top: 2px;
}
</style>
