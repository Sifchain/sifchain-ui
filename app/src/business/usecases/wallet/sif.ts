import { Address, IAmount, IAsset, Network } from "@sifchain/sdk";
import { effect, ReactiveEffectRunner, stop } from "vue";

import { UsecaseContext } from "..";

export default ({
  services,
  store,
}: UsecaseContext<"sif" | "clp" | "bus", "wallet">) => {
  const actions = {
    initSifWallet() {
      const effects: ReactiveEffectRunner[] = [];
      const state = services.sif.getState();
      effects.push(
        effect(() => {
          console.log("state.connected:", state.connected);
          if (
            store.wallet.get(Network.SIFCHAIN).isConnected !== state.connected
          ) {
            store.wallet.get(Network.SIFCHAIN).isConnected = state.connected;
            if (store.wallet.get(Network.SIFCHAIN).isConnected) {
              services.bus.dispatch({
                type: "WalletConnectedEvent",
                payload: {
                  walletType: "sif",
                  address: store.wallet.get(Network.SIFCHAIN).address,
                },
              });
            }
          }
        }),
      );

      effects.push(
        effect(() => {
          store.wallet.get(Network.SIFCHAIN).address = state.address;
        }),
      );

      effects.push(
        effect(() => {
          store.wallet.get(Network.SIFCHAIN).balances = state.balances;
        }),
      );

      return () => {
        for (const ef of effects) {
          stop(ef);
        }
      };
    },

    async getCosmosBalances(address: Address) {
      // TODO: validate sif prefix
      return await services.sif.getBalance(address);
    },

    async sendCosmosTransaction(params: { amount: IAmount; asset: IAsset }) {
      return await services.sif.transfer(params);
    },

    async connectToSifWallet() {
      try {
        // TODO type
        await services.sif.connect();

        store.wallet.get(Network.SIFCHAIN).isConnected = true;
      } catch (error) {
        console.error(error);
        services.bus.dispatch({
          type: "WalletConnectionErrorEvent",
          payload: {
            walletType: "sif",
            message: "Failed to connect to Keplr.",
          },
        });
      }
    },
  };

  return actions;
};
