import { defineComponent, PropType } from "vue";
import Modal from "~/components/Modal";
import { Button } from "~/components/Button/Button";
import router from "~/router";
import { WalletConfig, walletConfigLookup } from "../WalletPicker/constants";

export const WalletInstallModal = defineComponent({
  name: "WalletInstallModal",
  setup(props) {
    const walletId = router.currentRoute.value.params
      .walletId as WalletConfig["id"];
    const redirectTo = router.currentRoute.value.params.redirectTo as string;
    const onClose = () => router.push({ name: "Balances" });

    const walletConfig = walletConfigLookup[walletId];
    return () => {
      return (
        <Modal
          heading={`Install ${walletConfig.walletName}`}
          icon="interactive/wallet"
          showClose
          onClose={onClose}
        >
          <p class="mt-[10px]">{walletConfig.instructions}</p>
          {/* A low-budget way to redirect user back to where they were.*/}
          <Button.CallToAction
            class="mt-[10px]"
            onClick={() => {
              window.location.href = redirectTo || "/#/balances";
              window.location.reload();
            }}
          >
            Refresh
          </Button.CallToAction>
        </Modal>
      );
    };
  },
});
