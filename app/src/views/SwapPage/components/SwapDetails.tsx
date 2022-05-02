import { IAsset } from "@sifchain/sdk";
import { computed, defineComponent, PropType, Ref } from "vue";

import { Form } from "@/components/Form";
import Button from "@/components/Button";
import { TokenIcon } from "@/components/TokenIcon";

export const SwapDetails = defineComponent({
  props: {
    minimumReceived: String,
    priceImpact: String,
    liquidityProviderFee: String,
    priceRatio: Object as PropType<Ref<string>>,
    toAsset: Object as PropType<Ref<IAsset>>,
    fromAsset: Object as PropType<Ref<IAsset>>,
  },
  setup: (props) => {
    const priceRatios = computed(() => {
      if (!props.priceRatio?.value || !Number(props.priceRatio.value)) {
        const zero = "0.000000";
        return [zero, zero] as const;
      }

      const ratio = parseFloat(props.priceRatio.value || "0");

      return [ratio.toFixed(6), (1 / ratio).toFixed(6)] as const;
    });

    return () => (
      <Form.Details
        details={[
          [
            <>
              {props.toAsset?.value.displaySymbol.toUpperCase()} per{" "}
              {props.fromAsset?.value.displaySymbol.toUpperCase()}
            </>,
            <>{priceRatios.value[0]}</>,
          ],
          [
            <>
              {props.fromAsset?.value.displaySymbol.toUpperCase()} per{" "}
              {props.toAsset?.value.displaySymbol.toUpperCase()}
            </>,
            <>{priceRatios.value[1]}</>,
          ],
          [
            <>
              Minimum Received
              <Button.InlineHelp>
                This is the minimum amount of the to token you will receive,
                taking into consideration the acceptable slippage percentage you
                are willing to take on. This amount also already takes into
                consideration liquidity provider fees as well.
              </Button.InlineHelp>
            </>,
            <>{props.minimumReceived}</>,
          ],
          [
            <>
              Price Impact
              <Button.InlineHelp key={props.toAsset?.value.displaySymbol}>
                This is the percentage impact to the amount of{" "}
                {props.toAsset?.value.displaySymbol.toUpperCase()} in the
                liquidity pool based upon how much you are swapping for.
              </Button.InlineHelp>
            </>,
            <>{props.priceImpact}</>,
          ],
          [
            <>
              Liquidity Provider Fee
              <Button.InlineHelp>
                This is the amount of fees the liquidity provider will charge
                you for this swap.
              </Button.InlineHelp>
            </>,
            <>
              <span class="mr-[4px]">{props.liquidityProviderFee}</span>
              {props.toAsset ? (
                <TokenIcon asset={props.toAsset} size={18}></TokenIcon>
              ) : (
                ""
              )}
            </>,
          ],
        ]}
      />
    );
  },
});
