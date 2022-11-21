import { defineComponent } from "vue";

import AssetIcon from "~/components/AssetIcon";
import { Button } from "~/components/Button/Button";
import { Form } from "~/components/Form";
import Modal from "~/components/Modal";
import { TokenIcon } from "~/components/TokenIcon";
import { Tooltip } from "~/components/Tooltip";
import { formatAssetAmount } from "~/components/utils";

import { SwapDetails } from "../components/SwapDetails";
import { useSwapPageData } from "../useSwapPageData";

export const ConfirmSwap = defineComponent({
  setup() {
    const data = useSwapPageData();
    return () => (
      <Modal
        heading="Confirm Swap"
        icon="navigation/swap"
        onClose={data.requestTransactionModalClose}
        showClose={true}
      >
        <Form.FieldSet>
          <div class="w-full px-[4px]">
            <div class="flex w-full flex-row justify-between">
              <div class="flex flex-row items-center">
                {data.toAsset.value && (
                  <TokenIcon asset={data.fromAsset} size={22} />
                )}
                <span class="text-md ml-[10px] font-medium">
                  {data.fromAsset?.value?.displaySymbol?.toUpperCase()}
                </span>
              </div>
              <div class="font-mono">
                {data.fromFieldAmount &&
                  formatAssetAmount(data.fromFieldAmount)}
              </div>
            </div>
            <div class="my-[10px] flex w-full justify-center">
              <AssetIcon
                class="text-accent-base"
                icon="interactive/chevron-down"
                size={20}
              />
            </div>
            <div class="flex w-full flex-row justify-between">
              <div class="flex items-center">
                {data.toAsset.value && (
                  <TokenIcon asset={data.toAsset} size={22} />
                )}
                <span class="text-md ml-[10px] font-medium">
                  {data.toAsset?.value?.displaySymbol?.toUpperCase()}
                </span>
              </div>

              <Tooltip
                content={
                  <>
                    This is the estimated amount you will receive after
                    subtracting the price impact and LP fee from the initial
                    swap result.
                  </>
                }
              >
                <div class="font-mono">
                  {data.effectiveToAmount.value && data.effectiveToAmount.value}
                </div>
              </Tooltip>
            </div>
          </div>
        </Form.FieldSet>
        <Form.FieldSet class="mt-[10px]">
          <Form.Label>Output is estimated</Form.Label>
          <SwapDetails
            fromAsset={data.fromAsset}
            toAsset={data.toAsset}
            priceRatio={data.priceRatio}
            priceImpact={`${data.priceImpact.value}%`}
            liquidityProviderFee={data.providerFee.value ?? ""}
            minimumReceived={data.minimumReceived.value}
            swapFeeRate={data.swapFeeRate.value}
          />
        </Form.FieldSet>
        <Button.CallToAction
          class="mt-[10px]"
          onClick={() => data.handleAskConfirmClicked()}
        >
          Confirm
        </Button.CallToAction>
      </Modal>
    );
  },
});
