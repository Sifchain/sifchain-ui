import { defineComponent, PropType } from "vue";

import { prettyNumber } from "~/utils/prettyNumber";
import { ElementOf } from "~/utils/types";
import { PoolDataArray } from "../usePoolPageData";

export default defineComponent({
  name: "PoolStats",
  props: {
    context: {
      type: Object as PropType<ElementOf<PoolDataArray>>,
      required: true,
    },
    class: {
      type: String,
      default: "",
    },
  },
  setup(props) {
    const { poolStat } = props.context;

    const details = [
      ["Total liquidity", `$${prettyNumber(poolStat.poolTVL)}`],
      ["Trading volume", `$${prettyNumber(poolStat.volume)}`],
      [
        "Pool APR",
        `${poolStat?.poolApr ? `${poolStat.poolApr.toFixed(2)}%` : "..."}%`,
      ],
      [
        "Arb opportunity",
        <span class={poolStat?.arb > 0 ? "text-green-sif400" : "text-red-500"}>
          {poolStat?.arb ? `${poolStat.arb.toFixed(2)}%` : "..."}
        </span>,
      ],
    ];

    return () => (
      <ul class={["flex w-full flex-col gap-1.5 px-4 py-2", props.class]}>
        {details.map(([label, value]) => (
          <li class="flex items-center justify-between text-sm">
            <div class="text-gray-sif300 text-left">{label}</div>
            <div class="text-gray-sif50 text-right font-semibold">{value}</div>
          </li>
        ))}
      </ul>
    );
  },
});
