import { defineComponent } from "vue";
import WalletConnection from "./WalletConnection";
import { walletConnections } from "./constants";
import { rootStore } from "@/store";

export default defineComponent({
  name: "WalletPicker",
  props: {},
  setup() {
    const walletCount = rootStore.accounts.computed(
      (s) => s.connectedNetworkCount,
    );
    return () => (
      <div class="w-[304px]">
        {walletConnections.map((connection) => (
          <WalletConnection connection={connection} key={connection.name} />
        ))}
      </div>
    );
  },
});
