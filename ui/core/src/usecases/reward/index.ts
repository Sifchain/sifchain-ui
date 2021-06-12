import { UsecaseContext } from "..";
import {
  CryptoeconomicsRewardType,
  CryptoeconomicsUserData,
} from "../../services/CryptoeconomicsService";

export const BLOCK_TIME_MS = 1000 * 60 * 200;

export const VS_STORAGE_KEY = "NOTIFIED_VS_STORAGE";
export const LM_STORAGE_KEY = "NOTIFIED_LM_STORAGE";

export default function rewardActions({
  services,
  store,
}: UsecaseContext<
  "bus" | "cryptoeconomics" | "dispensation" | "sif" | "storage",
  "wallet"
>) {
  function hasUserReachedMaturity(userData: CryptoeconomicsUserData) {
    if (!userData) return false;

    return (
      new Date() > userData.maturityDate &&
      userData.totalClaimableCommissionsAndClaimableRewards > 0
    );
  }

  return {
    subscribeToRewardData(rewardType: CryptoeconomicsRewardType) {
      const key = rewardType === "vs" ? "vsUserData" : "lmUserData";
      let intervalId: NodeJS.Timeout;

      if (store.wallet.sif.address) {
        const update = async () => {
          store.wallet.sif[key] = await services.cryptoeconomics.fetchData({
            rewardType,
            address: store.wallet.sif.address,
            key: "userData",
            timestamp: "now",
          });
        };
        update();
        intervalId = setInterval(update, BLOCK_TIME_MS);
      }
      return () => clearInterval(intervalId);
    },

    notifyLmMaturity() {
      if (
        hasUserReachedMaturity(store.wallet.sif.lmUserData) &&
        !services.storage.getItem(LM_STORAGE_KEY)
      ) {
        services.bus.dispatch({
          type: "SuccessEvent",
          payload: {
            message:
              "Your liquidity mining rewards have reached full maturity!",
            detail: {
              type: "info",
              message:
                "Please feel free to claim these rewards. If you have already submitted a claim, these will be processed at week end.",
            },
          },
        });
        services.storage.setItem(LM_STORAGE_KEY, "true");
      }
      return () => {};
    },

    notifyVsMaturity() {
      if (
        hasUserReachedMaturity(store.wallet.sif.vsUserData) &&
        !services.storage.getItem(VS_STORAGE_KEY)
      ) {
        services.bus.dispatch({
          type: "SuccessEvent",
          payload: {
            message:
              "Your validator staking rewards have reached full maturity!",
            detail: {
              type: "info",
              message:
                "Please feel free to claim these rewards. If you have already submitted a claim, these will be processed at week end.",
            },
          },
        });
        services.storage.setItem(VS_STORAGE_KEY, "true");
      }
      return () => {};
    },
    async claim(params: { claimType: "2" | "3"; fromAddress: string }) {
      if (!store.wallet.sif.address) throw "No from address provided for swap";
      const tx = await services.dispensation.claim(params);
      return await services.sif.signAndBroadcast(tx.value.msg);
    },
  };
}
