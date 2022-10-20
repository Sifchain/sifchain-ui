import { Network } from "@sifchain/sdk";
import { defineComponent, PropType, Ref } from "vue";

import { useChains } from "~/hooks/useChains";
import { useCore } from "~/hooks/useCore";
import { TransactionDetails } from "~/hooks/useTransactionDetails";
import AssetIcon, { IconName } from "./AssetIcon";
import Button from "./Button";
import { Form, FormDetailsType } from "./Form";
import Modal from "./Modal";

export default defineComponent({
  name: "TransactionDetailsModal",
  props: {
    transactionDetails: {
      type: Object as PropType<Ref<TransactionDetails>>,
      required: true,
    },
    details: {
      type: Object as PropType<Ref<FormDetailsType>>,
      required: true,
    },
    icon: {
      type: String as PropType<IconName>,
      required: true,
    },
    onClose: {
      type: Function as PropType<() => void>,
      required: true,
    },
    completedCta: {
      type: Object as PropType<Ref<JSX.Element>>,
    },
    network: {
      type: String as PropType<Network>,
      required: true,
    },
  },
  setup(props) {
    const { config } = useCore();

    return () => {
      const isLoading =
        !props.transactionDetails.value?.tx?.hash &&
        !props.transactionDetails.value?.isError &&
        !props.transactionDetails.value?.isComplete;
      return (
        <Modal
          heading={props.transactionDetails.value?.heading}
          icon={props.icon}
          onClose={() => props.onClose?.()}
          showClose
        >
          <div class="bg-gray-base rounded-lg p-4">
            <Form.Details
              details={props.details.value}
              isError={props.transactionDetails.value?.isError}
            />
            {props.transactionDetails.value?.tx?.hash && (
              <a
                class="mt-[10px] block cursor-pointer text-center text-base text-white underline"
                target="_blank"
                rel="noopener noreferrer"
                href={useChains()
                  .get(props.network)
                  .getBlockExplorerUrlForTxHash(
                    props.transactionDetails.value.tx.hash,
                  )}
              >
                View Transaction on the Block Explorer
              </a>
            )}
          </div>
          <p class="mt-[10px] flex items-center justify-center text-center text-base">
            {isLoading && (
              <AssetIcon
                icon="interactive/anim-racetrack-spinner"
                class="mr-[2px]"
                size={20}
              />
            )}
            {props.transactionDetails.value?.description ===
            "ledger_smart_contracts_not_approved" ? (
              <div class="white-space-pre-wrap css-unreset my-[16px] text-left">
                It looks like you may have a MetaMask + Ledger configuration
                issue. If you are using a new version of Ledger, you must select
                the Ethereum app and enable contract data.
                <br />
                <br />
                To enable contract data:
                <br />
                <ul>
                  <li>Connect and unlock your Ledger device. </li>
                  <li>Open the Ethereum application. </li>
                  <li>Press the right button to navigate to Settings. </li>
                  <li>Then press both buttons to validate. </li>
                  <li>
                    In the Contract data settings, press both buttons to allow
                    contract data in transactions.{" "}
                  </li>
                  <li>The device displays Allowed.</li>
                </ul>
                <a
                  class="underline"
                  href="https://teckers.co/uniswap-ledger/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Here is a visual guide.
                </a>
                <br />
                <br />
                Once you've done this, try again.
              </div>
            ) : (
              props.transactionDetails.value?.description
            )}
          </p>
          {!isLoading &&
            (props.completedCta?.value != null ? (
              props.completedCta.value
            ) : (
              <>
                <Button.CallToAction class="mt-[10px]" onClick={props.onClose}>
                  Close
                </Button.CallToAction>
                {/* <Button.CallToActionSecondary class="mt-[10px]">
                  Retry
                </Button.CallToActionSecondary> */}
              </>
            ))}
        </Modal>
      );
    };
  },
});
