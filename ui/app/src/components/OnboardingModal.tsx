import { defineComponent, PropType, ref, computed, Ref } from "vue";
import { Form } from "@/components/Form";
import Modal from "@/components/Modal";
import TransactionDetailsModal from "@/components/TransactionDetailsModal";
import { TransactionStatus } from "@sifchain/sdk";
import {
  CryptoeconomicsRewardType,
  CryptoeconomicsUserData,
} from "@sifchain/sdk/src/services/CryptoeconomicsService";
import { TokenIcon } from "@/components/TokenIcon";
import { Amount, format, Asset } from "@sifchain/sdk";
import { Button } from "@/components/Button/Button";
import { useCore } from "@/hooks/useCore";
import { useTransactionDetails } from "@/hooks/useTransactionDetails";
import { accountStore } from "@/store/modules/accounts";
import { RouterLink, useRouter } from "vue-router";
import { getImportLocation } from "@/views/BalancePage/Import/useImportData";

const formatRowanNumber = (n?: number) => {
  if (n == null) return "0";
  return (
    format(Amount(String(n.toFixed(18))), {
      mantissa: 4,
      zeroFormat: "0",
    }) || "0"
  );
};

export default defineComponent({
  name: "OnboardingModal",
  props: {
    onClose: { type: Function as PropType<() => void>, required: true },
  },
  setup(props) {
    const core = useCore();
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
