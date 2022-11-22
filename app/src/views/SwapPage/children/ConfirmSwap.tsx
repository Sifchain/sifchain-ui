import { AssetAmount, IAssetAmount } from "@sifchain/sdk";
import { computed, defineComponent, PropType, ref, Ref } from "vue";
import { TippyContent } from "vue-tippy";

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
        <AssetPairFieldSet
          fromAssetAmount={ref(
            data.fromFieldAmount ?? AssetAmount("rowan", "0"),
          )}
          toAssetAmount={computed(
            () =>
              data.effectiveMinimumReceived.value ?? AssetAmount("rowan", "0"),
          )}
          toTooltip={
            <>
              This is the estimated amount you will receive after subtracting
              the price impact and LP fee from the initial swap result.
            </>
          }
        />

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

export const AssetPairFieldSet = defineComponent({
  props: {
    fromAssetAmount: {
      type: Object as PropType<Ref<IAssetAmount>>,
      required: true,
    },
    fromTooltip: {
      type: Object as PropType<TippyContent>,
    },
    toAssetAmount: {
      type: Object as PropType<Ref<IAssetAmount>>,
      required: true,
    },
    toTooltip: {
      type: Object as PropType<TippyContent>,
    },
  },
  setup(props) {
    return () => (
      <Form.FieldSet>
        <div class="w-full px-[4px]">
          <AssetPairRow
            assetAmount={props.fromAssetAmount}
            tooltip={props.fromTooltip}
          />
          <div class="my-[10px] flex w-full justify-center">
            <AssetIcon
              class="text-accent-base"
              icon="interactive/chevron-down"
              size={20}
            />
          </div>
          <AssetPairRow
            assetAmount={props.toAssetAmount}
            tooltip={props.toTooltip}
          />
        </div>
      </Form.FieldSet>
    );
  },
});

export const AssetPairRow = (props: {
  assetAmount: Ref<IAssetAmount>;
  assetPrice?: Ref<number>;
  tooltip?: TippyContent;
}) => {
  const displayAssetAmount = (
    <div class="relative font-mono tabular-nums">
      {formatAssetAmount(props.assetAmount.value)}
      {props.assetPrice && (
        <small class="absolute -bottom-3 right-0 whitespace-nowrap text-sm text-gray-500">
          {"≈ "}
          {props.assetPrice.value.toLocaleString(undefined, {
            style: "currency",
            currency: "USD",
          })}
        </small>
      )}
    </div>
  );
  return (
    <div class="flex items-center justify-between">
      <div class="flex items-center">
        {props.assetAmount.value && (
          <TokenIcon asset={props.assetAmount} size={22} />
        )}
        <span class="text-md ml-[10px] font-medium">
          {props.assetAmount?.value?.displaySymbol?.toUpperCase()}
        </span>
      </div>
      {props.tooltip ? (
        <Tooltip content={props.tooltip}>{displayAssetAmount}</Tooltip>
      ) : (
        displayAssetAmount
      )}
    </div>
  );
};
