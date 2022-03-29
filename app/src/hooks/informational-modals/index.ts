import { accountStore } from "@/store/modules/accounts";
import { Amount } from "@sifchain/sdk";
import { onMounted, ref } from "vue";
import { useCore } from "../useCore";

const ROWAN_GAS_FEE = Amount("500000000000000000"); // 0.5 ROWAN

let _hasHadBootDelay = false;

const VITE_APP_SHA = import.meta.env.VITE_APP_SHA || "develop";
type InfoModalState = {
  hasShown: boolean;
  isOpen: boolean;
  shownKey: string;
  shownDate: Date;
};
type InfoModalDefinition = {
  key: string;
  shouldShow: (
    state: InfoModalState,
  ) => { show: boolean; showKey?: string } | undefined;
};

let changelogData: undefined | { version: string; changelogHtml: string };
export const loadChangesData = async () => {
  const res = await fetch(
    `https://sifchain-changes-server.vercel.app/api/changes/${VITE_APP_SHA}`,
  );
  const json = (await res.json()) as { version: string; changelogHtml: string };
  changelogData = {
    version: json.version,
    changelogHtml: json.changelogHtml,
  };
  return changelogData;
};

export const useInformationalModals = () => {
  const balances = accountStore.state.sifchain.balances;

  const hasHadBootDelay = ref(_hasHadBootDelay);
  onMounted(() => {
    if (!hasHadBootDelay.value) {
      setTimeout(() => {
        _hasHadBootDelay = hasHadBootDelay.value = true;
      }, 3000);
    }
  });

  const sifWallet = accountStore.state.sifchain;
  const hasImportedAssets = sifWallet.balances.find((b) => {
    return (
      b.asset.symbol.toLowerCase() !== "rowan" && b.amount.greaterThan("0")
    );
  });
  const hasSufficientRowanToTrade = sifWallet.balances.find(
    (b) =>
      b.asset.symbol.toLowerCase() === "rowan" &&
      b.amount.greaterThan(ROWAN_GAS_FEE),
  );

  const informationalModals: InfoModalDefinition[] = [
    {
      key: "freeRowan",
      shouldShow: (state: InfoModalState) => {
        if (
          !state.hasShown &&
          !hasSufficientRowanToTrade &&
          hasImportedAssets
        ) {
          return { show: true };
        }
      },
    },
    {
      key: "onboarding",
      shouldShow: (state: InfoModalState) => {
        if (
          !state.hasShown &&
          hasHadBootDelay.value &&
          !sifWallet.connecting &&
          !hasImportedAssets
        ) {
          return { show: true };
        }
      },
    },
    {
      key: "changelog",
      shouldShow: (state: InfoModalState) => {
        if (!changelogData) return;
        const hasVersionChangedSinceLastShow =
          !state.hasShown || state.shownKey !== changelogData.version;

        if (hasVersionChangedSinceLastShow) {
          return {
            show: true,
            showKey: changelogData.version,
          };
        }
      },
    },
  ];
};
