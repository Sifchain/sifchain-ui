import { computed, defineComponent, PropType, ComputedRef } from "vue";
import clsx from "clsx";

import AssetIcon from "~/components/AssetIcon";
import { Tooltip } from "~/components/Tooltip";

export default defineComponent({
  name: "AddLiquidityWarning",
  props: {
    isSlippagePossible: {
      type: Boolean,
      required: true,
    },
    riskFactorStatus: {
      type: Object as PropType<ComputedRef<"" | "bad" | "danger" | "warning">>,
      required: true,
    },
    isMarginEnabledPool: {
      type: Boolean,
      required: true,
    },
  },
  setup(props) {
    const slippageRiskContent = computed(() => {
      if (!props.isSlippagePossible) return;

      switch (props.riskFactorStatus.value) {
        case "bad":
        case "warning":
          return `
            WARNING, this asymmetric liquidity add will induce a significant
            slip adjustment on your share of the pool. Consider adding
            liquidity in smaller chunks (alternating between Rowan and the
            other token) to reduce the slip adjustment impact.
        `;
        case "danger":
          return `
            ATTENTION! ARE YOU SURE?  This asymmetric liquidity add will induce a VERY significant slip adjustment on your share of the pool. 
            STRONGLY consider adding liquidity in smaller chunks (alternating between Rowan and the other token) to reduce the slip adjustment impact.
          `;
        default:
          return `
            Note, this asymmetric liquidity add will induce a slip adjustment on your share of the pool.
          `;
      }
    });

    const riskDisclaimer = computed(() => {
      const warningClasses = {
        "": {
          border: "border-gray-500",
          icon: "text-slate-300",
        },
        bad: {
          border: "border-danger-bad",
          icon: "text-danger-bad",
        },
        warning: {
          border: "border-danger-warning",
          icon: "text-danger-warning",
        },
        danger: {
          border: "border-danger-base",
          icon: "text-danger-base",
        },
      };

      if (
        !props.riskFactorStatus.value &&
        !props.isMarginEnabledPool &&
        !props.isSlippagePossible
      ) {
        return;
      }

      return (
        <div
          class={clsx(
            "relative my-2 rounded border p-4",
            warningClasses[props.riskFactorStatus.value].border,
          )}
        >
          <div class="absolute top-0 right-0 p-2">
            <Tooltip
              content={slippageRiskContent.value}
              placement="top"
              interactive
              appendTo={() =>
                document.querySelector("#portal-target") || document.body
              }
            >
              <div class="cursor-pointer">
                <AssetIcon
                  icon="interactive/warning"
                  class={[
                    "mr-[4px]",
                    warningClasses[props.riskFactorStatus.value].icon,
                  ]}
                  size={22}
                />
              </div>
            </Tooltip>
          </div>
          <p class={["pr-4 text-slate-300"]}>
            {props.isMarginEnabledPool && (
              <>
                Deposits are used to underwrite margin trading. Utilized capital
                may be locked.
                <br />
              </>
            )}
            {slippageRiskContent.value && (
              <>
                {slippageRiskContent.value} See documentation{" "}
                <a
                  href="https://docs.sifchain.network/sifchain/using-the-dex/web-ui-step-by-step/pool/sifchain-liquidity-pools#asymmetric-liquidity-pool"
                  target="_blank"
                  class="underline"
                >
                  here
                </a>
              </>
            )}
          </p>
        </div>
      );
    });
    return () => riskDisclaimer.value;
  },
});
