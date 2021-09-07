import { effect, ReactiveEffect, stop } from "@vue/reactivity";
import { UsecaseContext, Network } from "../..";
import { Asset } from "../../entities";
import B from "../../entities/utils/B";
import { isSupportedEVMChain } from "../utils";

export default ({
  services,
  store,
}: UsecaseContext<"eth" | "bus", "wallet" | "asset">) => {
  const actions = {
    initEthWallet() {
      const effects: ReactiveEffect<any>[] = [];
      const unsubscribeProvider = services.eth.onProviderNotFound(() => {
        services.bus.dispatch({
          type: "WalletConnectionErrorEvent",
          payload: {
            walletType: "eth",
            message: "Metamask not found.",
          },
        });
      });

      const etheriumState = services.eth.getState();

      const unsubscribeChainId = services.eth.onChainIdDetected((chainId) => {
        store.wallet.set(Network.ETHEREUM, {
          ...store.wallet.get(Network.ETHEREUM),
          chainId,
        });
      });

      effects.push(
        effect(() => {
          // Only show connected when we have an address
          if (
            store.wallet.get(Network.ETHEREUM).isConnected !==
            etheriumState.connected
          ) {
            store.wallet.get(Network.ETHEREUM).isConnected =
              etheriumState.connected && !!etheriumState.address;

            if (store.wallet.get(Network.ETHEREUM).isConnected) {
              services.bus.dispatch({
                type: "WalletConnectedEvent",
                payload: {
                  walletType: "eth",
                  address: store.wallet.get(Network.ETHEREUM).address,
                },
              });
            }
          }
        }),
      );

      effects.push(
        effect(() => {
          store.wallet.get(Network.ETHEREUM).address = etheriumState.address;
        }),
      );

      effects.push(
        effect(() => {
          store.wallet.get(Network.ETHEREUM).balances = etheriumState.balances;
        }),
      );

      effects.push(
        effect(async () => {
          etheriumState.log; // trigger on log change
          await services.eth.getBalance();
        }),
      );

      return () => {
        unsubscribeProvider();
        unsubscribeChainId();
        for (let ef of effects) {
          stop(ef);
        }
      };
    },

    isSupportedNetwork() {
      return isSupportedEVMChain(store.wallet.get(Network.ETHEREUM).chainId);
    },

    async disconnectEthWallet() {
      await services.eth.disconnect();
    },

    async connectToEthWallet() {
      try {
        await services.eth.connect();
      } catch (err) {
        services.bus.dispatch({
          type: "WalletConnectionErrorEvent",
          payload: {
            walletType: "eth",
            message: "Failed to connect to Metamask.",
          },
        });
      }
    },

    async transferEthWallet(amount: number, recipient: string, asset: Asset) {
      const hash = await services.eth.transfer({
        amount: B(amount, asset.decimals),
        recipient,
        asset,
      });
      return hash;
    },
  };

  return actions;
};
