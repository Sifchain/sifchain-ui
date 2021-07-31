import { Network } from "@sifchain/sdk";
import { useCore } from "@/hooks/useCore";
import { getBlockExplorerUrl } from "@/componentsLegacy/shared/utils";
import { defineComponent } from "vue";
import WalletConnection from "./WalletConnection";
import { walletConnections } from "./constants";
import { rootStore } from "../../store";

export default defineComponent({
  name: "WalletPicker",
  props: {},
  setup() {
    // const walletCount = walletStore.computed(
    //   (store) => store?.getters?.connectedNetworkCount,
    // );
    const walletCount = rootStore.accounts.computed(
      (s) => s.connectedNetworkCount,
    );
    return () => (
      <div class="w-[304px]">
        <h1>{walletCount.value}</h1>
        {walletConnections.map((connection) => (
          <WalletConnection connection={connection} key={connection.name} />
        ))}
      </div>
    );
  },
});
