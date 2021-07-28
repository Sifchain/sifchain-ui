import { Address, Asset, AssetAmount, Network, TxParams } from "../../entities";
import { UsecaseContext } from "..";
import { effect, reactive, ReactiveEffect, stop } from "@vue/reactivity";
import { IWalletServiceState } from "../../services/IWalletService";

export default ({
  services,
  store,
}: UsecaseContext<"clp" | "bus" | "ibc", "wallet">) => {
  const actions = {
    initcosmoshubWallet() {
      const effects: ReactiveEffect[] = [];
      const state = reactive<IWalletServiceState>({
        connected: false,
        address: "",
        accounts: [],
        balances: [],
        log: "",
      });

      services.ibc.createWalletByNetwork(Network.SIFCHAIN).then((w) => {
        console.log("sifchain", w, w.addresses, w.balances);
      });
      services.ibc.createWalletByNetwork(Network.COSMOSHUB).then((w) => {
        console.log("cosmoshub", w, w.addresses, w.balances);
        state.connected = true;
        state.accounts = w.addresses;
        state.balances = w?.balances;
      });

      effects.push(
        effect(() => {
          console.log("state.connected:", state.connected);
          if (store.wallet.cosmoshub.isConnected !== state.connected) {
            store.wallet.cosmoshub.isConnected = state.connected;
            if (store.wallet.cosmoshub.isConnected) {
              services.bus.dispatch({
                type: "WalletConnectedEvent",
                payload: {
                  walletType: "cosmoshub",
                  address: store.wallet.cosmoshub.address,
                },
              });
            }
          }
        }),
      );

      effects.push(
        effect(() => {
          store.wallet.cosmoshub.address = state.address;
        }),
      );

      effects.push(
        effect(() => {
          store.wallet.cosmoshub.balances = state.balances;
        }),
      );

      return () => {
        for (let ef of effects) {
          stop(ef);
        }
      };
    },

    async getCosmosBalances(address: Address) {
      // TODO: validate cosmoshub prefix
      // return await services.ibc.getBalance(address);
    },

    async sendCosmosTransaction(params: TxParams) {
      // return await services.cosmoshub.transfer(params);
    },

    async connectTocosmoshubWallet() {
      try {
        // TODO type
        // await services.cosmoshub.connect();
        store.wallet.cosmoshub.isConnected = true;
      } catch (error) {
        services.bus.dispatch({
          type: "WalletConnectionErrorEvent",
          payload: {
            walletType: "cosmoshub",
            message: "Failed to connect to Keplr.",
          },
        });
      }
    },
  };

  return actions;
};
