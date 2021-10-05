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
import { tryFundingAccount } from "@/hooks/useFaucet";

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
  name: "GetRowanModal",
  props: {
    onClose: { type: Function as PropType<() => void>, required: true },
  },
  setup(props) {
    const router = useRouter();
    const isLoading = ref(false);
    const error = ref<Error | undefined>(undefined);
    const success = ref(false);

    const handleTryFunding = async () => {
      isLoading.value = true;
      error.value = undefined;
      try {
        await tryFundingAccount();
        success.value = true;
      } catch (e) {
        error.value = e;
      } finally {
        isLoading.value = false;
      }
    };

    return () => {
      return (
        <Modal
          backdropClickToClose={false}
          heading={"Get Rowan"}
          icon="navigation/rowan"
          showClose
          onClose={() => {
            router.push({ name: "Balances" });
          }}
        >
          {success.value ? (
            <>
              <p class="text-[22px]">Rowan has been sent to your wallet!</p>
              <Button.CallToAction
                class="mt-[10px]"
                onClick={() => router.push({ name: "Balances" })}
              >
                Continue
              </Button.CallToAction>
            </>
          ) : (
            <>
              {" "}
              <p class="text-[22px]">Begin your journey with Sifchain</p>{" "}
              <p class="mt-[10px]">
                Rowan is the functional token of Sifchain used for settlement,
                staking, and transaction fees. So you'll need some before you go
                any further.
                <br />
                <br />
                To help you get started, The Sifchain Community will gladly send
                you a small amount of rowan.
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
                and <b>#getrowan</b> in a public tweet with your sif
                address&nbsp; (
                <small>{accountStore.state.sifchain.address}</small>)<br></br>
              </p>
              <a
                rel="noreferrer"
                class="block"
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
              {!!error.value && (
                <p class="mt-[10px] text-danger-base">{error.value.message}</p>
              )}
              <Button.CallToActionSecondary
                disabled={isLoading.value}
                class="mt-[6px]"
                onClick={handleTryFunding}
              >
                {isLoading.value
                  ? "Checking Account..."
                  : "I've Tweeted It, Send Rowan"}
              </Button.CallToActionSecondary>
            </>
          )}
        </Modal>
      );
    };
  },
});
