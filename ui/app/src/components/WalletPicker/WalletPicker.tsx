import { defineComponent } from "vue";
import WalletConnection from "./WalletConnection";
import { walletConnections } from "./constants";
import { rootStore } from "@/store";

export default defineComponent({
  name: "WalletPicker",
  props: {},
  setup() {
    return () => (
      <div class="w-[304px]">
        {walletConnections.map((connection) => (
          <WalletConnection
            connection={connection}
            key={connection.walletName}
          />
        ))}
      </div>
    );
  },
});
