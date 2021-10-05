import { defineComponent, PropType } from "vue";
import Modal from "@/components/Modal";
import { Button } from "@/components/Button/Button";
import router from "@/router";

export default defineComponent({
  name: "KeplrModal",
  setup(props) {
    const onClose = () => router.push({ name: "Balances" });
    return () => {
      return (
        <Modal
          heading={"Download Keplr Wallet"}
          icon="interactive/wallet"
          showClose
          onClose={onClose}
        >
          <p class="mt-[10px]">
            Sifchain uses the Keplr wallet extension to connect to the Cosmos
            ecosystem.
            <br />
            <br />
            Download and install it at{" "}
            <a
              target="_blank"
              href="https://keplr.app/"
              class="cursor-pointer underline"
            >
              https://keplr.app
            </a>
            .
            <br />
            <br />
            Once installed, refresh your browser and connect to Sifchain.
          </p>
          {/* A low-budget way to redirect user back to where they were.*/}
          <Button.CallToAction
            class="mt-[10px]"
            onClick={() => {
              window.location.href =
                (window as any).keplrModalReferrer || "/#/balances";
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
