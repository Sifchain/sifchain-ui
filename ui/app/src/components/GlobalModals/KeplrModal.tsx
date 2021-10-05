import { defineComponent, PropType } from "vue";
import Modal from "@/components/Modal";
import { Button } from "@/components/Button/Button";

export default defineComponent({
  name: "KeplrModal",
  props: {
    onClose: { type: Function as PropType<() => void>, required: true },
  },
  setup(props) {
    return () => {
      return (
        <Modal
          heading={"Download Keplr Wallet"}
          icon="interactive/wallet"
          showClose
          onClose={props.onClose}
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
          <Button.CallToAction
            onClick={() => window.location.reload()}
            class="mt-[10px]"
          >
            Refresh
          </Button.CallToAction>
        </Modal>
      );
    };
  },
});
