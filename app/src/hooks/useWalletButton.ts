import { useCore } from "~/hooks/useCore";
import { Network } from "@sifchain/sdk";
import { computed } from "vue";

export function useWalletButton(props?: {
  connectType?: "connectToAny" | "connectToAll" | "connectToSif";
}) {
  const connectType = props?.connectType || "connectToAny";
  const { store } = useCore();

  const connectedToEth = computed(
    () => store.wallet.get(Network.ETHEREUM).isConnected,
  );

  const connectedToSif = computed(
    () => store.wallet.get(Network.SIFCHAIN).isConnected,
  );

  const connected = computed(() => {
    if (connectType === "connectToAny") {
      return connectedToSif.value || connectedToEth.value;
    }

    if (connectType === "connectToAll") {
      return connectedToSif.value && connectedToEth.value;
    }

    if (connectType === "connectToSif") {
      return connectedToSif.value;
    }
  });

  const connectCta = computed(() => {
    if (
      !(
        store.wallet.get(Network.ETHEREUM).isConnected ||
        store.wallet.get(Network.SIFCHAIN).isConnected
      )
    ) {
      return "Connect Wallet";
    }
    if (!store.wallet.get(Network.SIFCHAIN).isConnected) {
      return "Connect Sifchain Wallet";
    }
    if (!store.wallet.get(Network.ETHEREUM).isConnected) {
      return "Connect Ethereum Wallet";
    }
  });

  return {
    connected,
    connectedToEth,
    connectedToSif,
    connectCta,
  };
}
