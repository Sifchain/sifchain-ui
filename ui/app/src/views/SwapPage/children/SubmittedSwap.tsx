import { Form } from "@/components/Form";
import Modal from "@/components/Modal";
import { TokenIcon } from "@/components/TokenIcon";
import { defineComponent } from "vue";
import { useSwapPageData } from "../useSwapPageData";

export const SubmittedSwap = defineComponent({
  setup() {
    const data = useSwapPageData();
    return () => {
      return (
        <Modal
          heading="Transaction Submitted"
          icon="navigation/swap"
          onClose={data.requestTransactionModalClose}
        >
          <Form.Details
            class="mt-[10px]"
            details={[
              ["Swapped", null],
              [
                <div class="flex items-center">
                  {data.fromAsset.value && (
                    <TokenIcon asset={data.fromAsset} size={18}></TokenIcon>
                  )}
                  <span class="ml-[4px]">
                    {data.fromSymbol.value.toUpperCase()}
                  </span>
                </div>,
                null,
              ],
              [
                <div class="flex items-center">
                  {data.toAsset.value && (
                    <TokenIcon asset={data.toAsset} size={18}></TokenIcon>
                  )}
                  <span class="ml-[4px]">
                    {data.toAsset?.value?.displaySymbol?.toUpperCase()}
                  </span>
                </div>,
                null,
              ],
            ]}
          ></Form.Details>
          {/* <Button.CallToAction
              class="mt-[10px]"
              onClick={() => data.handleAskConfirmClicked()}
            >
              Confirm
            </Button.CallToAction> */}
        </Modal>
      );
    };
  },
});
