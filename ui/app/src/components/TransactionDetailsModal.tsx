import { defineComponent, PropType, Ref } from "vue";
import { TransactionDetails } from "@/hooks/useTransactionDetails";
import AssetIcon, { IconName } from "./AssetIcon";
import { Form } from "./Form";
import Modal from "./Modal";
import { useCore } from "@/hooks/useCore";
import { Button } from "./Button/Button";
import { getBlockExplorerUrl } from "@/componentsLegacy/shared/utils";

export default defineComponent({
  name: "TransactionDetailsModal",
  props: {
    transactionDetails: {
      type: Object as PropType<Ref<TransactionDetails>>,
      required: true,
    },
    details: {
      type: Object as PropType<Ref<[any, any][]>>,
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
  },
  setup(props) {
    const { config } = useCore();

    return () => {
      const isLoading = !props.transactionDetails.value?.tx?.hash;
      return (
        <Modal
          heading={props.transactionDetails.value?.heading}
          icon={props.icon}
          onClose={props.onClose}
          showClose
        >
          <div class="p-4 bg-gray-base">
            <Form.Details
              details={props.details.value}
              isError={props.transactionDetails.value?.isError}
            />
            {props.transactionDetails.value?.tx?.hash && (
              <a
                class="text-white block text-center cursor-pointer mt-[10px] text-sm"
                target="_blank"
                rel="noopener noreferrer"
                href={getBlockExplorerUrl(
                  config.sifChainId,
                  props.transactionDetails.value.tx.hash,
                )}
              >
                View Transaction on the Block Explorer
              </a>
            )}
          </div>
          <p class="mt-[10px] text-sm text-center flex items-center justify-center">
            {isLoading && (
              <AssetIcon
                icon="interactive/anim-racetrack-spinner"
                class="mr-[2px]"
                size={20}
              />
            )}
            {props.transactionDetails.value?.description}
          </p>
          {!isLoading && (
            <Button.CallToAction class="mt-[10px]" onClick={props.onClose}>
              Close
            </Button.CallToAction>
          )}
        </Modal>
      );
    };
  },
});
