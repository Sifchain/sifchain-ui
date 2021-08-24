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
import { useRouter } from "vue-router";

const formatRowanNumber = (n?: number) => {
  if (n == null) return "0";
  return (
    format(Amount(String(n)), {
      mantissa: 4,
      zeroFormat: "0",
    }) || "0"
  );
};

export default defineComponent({
  name: "GetRowanModal",
  props: {
    onClose: { type: Function as PropType<() => void>, required: true },
  },
  setup(props) {
    const router = useRouter();
    return () => {
      return (
        <Modal
          heading={"Get Rowan"}
          icon="navigation/rowan"
          showClose
          onClose={() => {
            router.back();
          }}
        >
          <p class="text-[22px]">Begin your journey with Sifchain</p>
          <p class="mt-[10px]">
            Rowan is the functional token of Sifchain used for settlement,
            staking, and transaction fees. So you'll need some before you go any
            further.
            <br />
            <br />
            To help you get started, The Sifchain Community will gladly send you
            a small amount of rowan.
            <br />
            <br />
            To receive your rowan, tag{" "}
            <a
              href="https://twitter.com/sifchain"
              rel="noopener noreferrer"
              target="_blank"
              class="underline"
            >
              @sifchain
            </a>{" "}
            and <b>#getrowan</b> in a public tweet with your sif address&nbsp; (
            <small>{accountStore.state.sifchain.address}</small>)<br></br>
          </p>
          <a
            rel="noreferrer"
            target="_blank"
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
              `${
                accountStore.state.sifchain.address
                  ? `Getting started on @sifchain DEX ${accountStore.state.sifchain.address}`
                  : ""
              }`,
            )}&hashtags=getrowan,CosmosMeetsEthereum`}
          >
            <Button.CallToAction class="mt-[10px]">
              Tweet It
            </Button.CallToAction>
          </a>
        </Modal>
      );
    };
  },
});
