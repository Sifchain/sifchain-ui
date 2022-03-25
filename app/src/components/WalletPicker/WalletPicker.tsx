import { defineComponent } from "vue";
import { isChainFlaggedDisabled } from "@/store/modules/flags";

import WalletConnection from "./WalletConnection";
import { walletConnections } from "./constants";

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
              key={connection.getChain().network}
            />
          ))}
      </div>
    );
  },
});
