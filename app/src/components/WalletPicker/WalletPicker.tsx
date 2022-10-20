import { defineComponent } from "vue";
import { isChainFlaggedDisabled } from "~/store/modules/flags";

import WalletConnection from "./WalletConnection";
import { walletConnections } from "./constants";

export default defineComponent({
  name: "WalletPicker",
  setup() {
    return () => (
      <div class="max-h-[85vh] w-[304px] overflow-y-scroll">
        {walletConnections
          .filter(
            (connection) => !isChainFlaggedDisabled(connection.getChain()),
          )
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
