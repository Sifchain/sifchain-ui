import { defineComponent } from "vue";
import { Network } from "@sifchain/sdk";

import { useChains, useNativeChain } from "~/hooks/useChains";
import { useCore } from "~/hooks/useCore";
import { flagsStore } from "~/store/modules/flags";
import Button from "~/components/Button";

const isProduction =
  import.meta.env.VITE_APP_DEPLOYMENT === "production" ||
  location.hostname === "dex.sifchain.finance" ||
  /sifchain-dex\.((redstarling|forbole)\.com)/.test(location.hostname);

import { createGui } from "./flagsGui";
const loadGui = () => createGui;

export const Flags = defineComponent({
  name: "FlagsGui",
  data(): {
    gui: null | ReturnType<typeof createGui>;
  } {
    return {
      gui: null,
    };
  },
  methods: {
    async toggleGui() {
      if (!this.gui) {
        const createGui = await loadGui();
        this.gui = createGui();
        document.body.appendChild(this.gui.domElement);
        this.gui.domElement.className = this.gui.domElement.className.replace(
          "main",
          "",
        );
      } else {
        this.gui.domElement.remove();
        this.gui.destroy();
        this.gui = null;
      }
    },
  },
  computed: {
    flagsState() {
      return flagsStore.state;
    },
    timeoutMinutes() {
      return flagsStore.state.ibcTransferTimeoutMinutes;
    },
    enableTestChains() {
      return Object.values(flagsStore.state.enableTestChains);
    },
  },
  watch: {
    flagsState: {
      handler(
        value: typeof flagsStore.state,
        oldValue: typeof flagsStore.state,
      ) {
        flagsStore.persist();
        window.location.reload();
      },
      deep: true,
    },
    timeoutMinutes: {
      handler(timeout) {
        useCore().services.ibc.transferTimeoutMinutes = timeout;
      },
      immediate: true,
    },
    enableTestChains: {
      handler() {
        Object.entries(flagsStore.state.enableTestChains).forEach(
          ([n, enabled]) => {
            const network = n as unknown as Network;
            const chain = useChains().get(network);

            chain.chainConfig.hidden = !enabled;
            chain.nativeAsset.decommissioned = enabled ? undefined : true;

            useNativeChain().assets.forEach((asset) => {
              if (asset.homeNetwork === network) {
                asset.decommissioned = enabled ? undefined : true;
              }
            });
          },
        );
      },
      deep: true,
      immediate: true,
    },
  },
  render() {
    if (isProduction) return null;
    return (
      <Button.Inline
        icon="interactive/settings"
        class="fixed top-[8px] right-[8px]"
        onClick={() => this.toggleGui()}
      />
    );
  },
});
