import { Network } from "@sifchain/sdk";
import { useCore } from "@/hooks/useCore";
import { getBlockExplorerUrl } from "@/componentsLegacy/shared/utils";
import { defineComponent } from "vue";
import WalletConnection from "./WalletConnection";
import { walletConnections } from "./constants";

export default defineComponent({
  name: "WalletPicker",
  props: {},
  setup() {
    return () => (
      <div class="w-[304px]">
        {walletConnections.map((connection) => (
          <WalletConnection connection={connection} key={connection.name} />
        ))}
      </div>
    );
  },
});
