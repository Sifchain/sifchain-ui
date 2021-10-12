import { defineComponent } from "vue";
import WalletConnection from "./WalletConnection";
import { walletConnections } from "./constants";
import { rootStore } from "@/store";
import { flagsStore, isChainFlaggedDisabled } from "@/store/modules/flags";

export default defineComponent({
  name: "WalletPicker",
  props: {},
  setup() {
    return () => (
      <div class="w-[304px]">
        {walletConnections
          .filter((connection) => {
            return !isChainFlaggedDisabled(connection.getChain());
          })
          .map((connection) => (
            <WalletConnection
              connection={connection}
              key={connection.walletName}
            />
          ))}
      </div>
    );
  },
});
