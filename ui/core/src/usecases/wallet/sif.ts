import { Address, TxParams } from "../../entities";
import { validateMnemonic } from "bip39";
import { Mnemonic } from "../../entities/Wallet";
import { UsecaseContext } from "..";
import { effect } from "@vue/reactivity";

const BLOCK_TIME_MS = 1000 * 60 * 200;

export default ({
  services,
  store,
}: UsecaseContext<"sif" | "clp" | "bus", "wallet">) => {
  const state = services.sif.getState();

  const actions = {
    async getCosmosBalances(address: Address) {
      // TODO: validate sif prefix
      return await services.sif.getBalance(address);
    },

    async connect(mnemonic: Mnemonic): Promise<string> {
      if (!mnemonic) throw "Mnemonic must be defined";
      if (!validateMnemonic(mnemonic)) throw "Invalid Mnemonic. Not sent.";
      return await services.sif.setPhrase(mnemonic);
    },

    async sendCosmosTransaction(params: TxParams) {
      return await services.sif.transfer(params);
    },

    async disconnect() {
      services.sif.purgeClient();
    },

    async connectToWallet() {
      try {
        // TODO type
        await services.sif.connect();
        store.wallet.sif.isConnected = true;
      } catch (error) {
        services.bus.dispatch({
          type: "WalletConnectionErrorEvent",
          payload: {
            walletType: "sif",
            message: "Failed to connect to Keplr.",
          },
        });
      }
    },

    getUserLmData() {
      return pollUserData("lm", (lmData) => {
        store.wallet.sif.lmUserData = lmData;
      });
    },
    getUserVsData() {
      return pollUserData("vs", (vsData) => {
        store.wallet.sif.vsUserData = vsData;
      });
    },

    notifyLmMaturity() {
      const key = "NOTIFIED_LM_MATURITY";
      if (
        hasUserReachedMaturity(store.wallet.sif.lmUserData) &&
        !window.localStorage.getItem(key)
      ) {
        services.bus.dispatch({
          type: "SuccessEvent",
          payload: {
            message: "Your liquidity mining has reached full maturity!",
            detail: {
              type: "info",
              message:
                "Please feel free to claim these rewards. If you have already submitted a claim, these will be processed at week end.",
            },
          },
        });
        try {
          window.localStorage.setItem(key, true);
        } catch (error) {
          // localStorage error. Private browser likely. ignore it!
        }
      }
      return () => {};
    },

    notifyVsMaturity() {
      const key = "NOTIFIED_VS_MATURITY";
      if (
        hasUserReachedMaturity(store.wallet.sif.vsUserData) &&
        !window.localStorage.getItem(key)
      ) {
        services.bus.dispatch({
          type: "SuccessEvent",
          payload: {
            message: "Your validator staking has reached full maturity!",
            detail: {
              type: "info",
              message:
                "Please feel free to claim these rewards. If you have already submitted a claim, these will be processed at week end.",
            },
          },
        });
        try {
          window.localStorage.setItem(key, true);
        } catch (error) {
          // localStorage error. Private browser likely. ignore it!
        }
      }
      return () => {};
    },
  };

  effect(() => {
    if (store.wallet.sif.isConnected !== state.connected) {
      store.wallet.sif.isConnected = state.connected;
      if (store.wallet.sif.isConnected) {
        services.bus.dispatch({
          type: "WalletConnectedEvent",
          payload: {
            walletType: "sif",
            address: store.wallet.sif.address,
          },
        });
      }
    }
  });

  effect(() => {
    store.wallet.sif.address = state.address;
  });

  effect(() => {
    store.wallet.sif.balances = state.balances;
  });

  function pollUserData(type: any, onChange: (Object) => void) {
    let intervalId: any;
    if (store.wallet.sif.address) {
      fetchData();
      intervalId = setInterval(fetchData, BLOCK_TIME_MS);
    }
    return () => {
      clearInterval(intervalId);
    };
    async function fetchData() {
      const params = new URLSearchParams();
      params.set("address", store.wallet.sif.address);
      params.set("key", "userData");
      params.set("timestamp", "now");
      const res = await fetch(
        `https://api-cryptoeconomics.sifchain.finance/api/${type}?${params.toString()}`,
      );
      onChange(await res.json());
    }
  }

  function hasUserReachedMaturity(userData: any) {
    if (!userData) return false;

    const hasMatured = new Date() > new Date(userData.maturityDateISO);
    const shouldNotify =
      hasMatured && userData.totalClaimableCommissionsAndClaimableRewards > 0;
    return shouldNotify;
  }

  return actions;
};
