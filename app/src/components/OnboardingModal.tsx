import { defineComponent, PropType } from "vue";
import { RouterLink, useRouter } from "vue-router";

import Modal from "~/components/Modal";
import { Button } from "~/components/Button/Button";
import { getImportLocation } from "~/views/BalancePage/Import/useImportData";

export default defineComponent({
  name: "OnboardingModal",
  props: {
    onClose: { type: Function as PropType<() => void>, required: true },
  },
  setup(props) {
    const router = useRouter();
    return () => {
      return (
        <Modal
          heading={"Welcome to Sifchain"}
          icon="navigation/rowan"
          showClose
          onClose={() => {
            router.push({
              name: "Swap",
            });
          }}
        >
          <p class="mt-[10px]">
            The Sifchain Community welcomes you to the world's first
            decentralized exchange to bridge the divide between Cosmos and
            Ethereum.
            <br />
            <br />
            Import your first tokens to get started.
            <br />
          </p>
          <RouterLink
            to={getImportLocation("select", {
              symbol: "ceth",
            })}
          >
            <Button.CallToAction
              onClick={() => props.onClose()}
              class="mt-[10px]"
            >
              Get Started
            </Button.CallToAction>
          </RouterLink>
        </Modal>
      );
    };
  },
});
