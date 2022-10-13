import { defineComponent, PropType, ref } from "vue";
import { useRouter } from "vue-router";

import { accountStore } from "~/store/modules/accounts";
import { tryFundingAccount } from "~/hooks/useFaucet";
import Modal from "~/components/Modal";
import { Button } from "~/components/Button/Button";

export default defineComponent({
  name: "GetRowanModal",
  props: {
    onClose: { type: Function as PropType<() => void>, required: true },
  },
  setup() {
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
        error.value = e as Error;
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
                <p class="text-danger-base mt-[10px]">{error.value.message}</p>
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
