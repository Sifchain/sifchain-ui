import { AssetAmount, Network } from "@sifchain/sdk";
import { computed, defineComponent, PropType, ref } from "vue";

import AssetPair from "~/components/AssetPair";
import { Button } from "~/components/Button/Button";
import { useChains } from "~/hooks/useChains";
import { useRowanPrice } from "~/hooks/useRowanPrice";
import { prettyNumber } from "~/utils/prettyNumber";
import { ElementOf } from "~/utils/types";

import { PoolDataArray } from "../usePoolPageData";
import { useUserPoolData } from "../useUserPoolData";

export default defineComponent({
  props: {
    context: {
      type: Object as PropType<ElementOf<PoolDataArray>>,
      required: true,
    },
  },

  setup(props) {
    const userPoolData = useUserPoolData({
      externalAsset: computed(() => props.context.pool.externalAmount.symbol),
    });
    const rowanPrice = useRowanPrice();
    const { pool, accountPool, poolStat } = props.context;

    const myPoolValue = computed(() => {
      if (!accountPool || !poolStat || rowanPrice.isLoading.value) {
        return;
      }

      const externalAmount = AssetAmount(
        accountPool.lp.asset,
        accountPool.lp.externalAmount,
      ).toDerived();
      const nativeAmount = AssetAmount(
        useChains().get(Network.SIFCHAIN).nativeAsset,
        accountPool.lp.nativeAmount,
      ).toDerived();

      const nativeDollarAmount = nativeAmount.multiply(
        rowanPrice.data.value ?? 0,
      );
      const externalDollarAmount = externalAmount.multiply(
        poolStat.priceToken ?? 0,
      );

      return prettyNumber(
        nativeDollarAmount.add(externalDollarAmount).toNumber(),
      );
    });

    const details = [
      ["Your pool share %", `${userPoolData.myPoolShare.value ?? "0"}%`],
      ["Your pool value", `$${myPoolValue.value ?? "0"}`],
      [
        "APR",
        `${poolStat?.poolApr ? `${poolStat.poolApr.toFixed(2)}%` : "..."}%`,
      ],
      [
        "Arbitrage",
        <span class={poolStat?.arb > 0 ? "text-green-500" : "text-red-500"}>
          {poolStat?.arb ? `${poolStat.arb.toFixed(2)}%` : "..."}%
        </span>,
      ],
    ];
    return () => (
      <li
        role="article"
        class="flex h-[312px] flex-col gap-4 rounded-lg bg-gray-900 p-4"
      >
        <header class="flex items-center p-2">
          <AssetPair asset={ref(pool.externalAmount.asset)} invert />
        </header>
        <main class="flex-1">
          <ul class="grid w-full gap-2">
            {details.map(([label, value]) => (
              <li class="flex items-center justify-between">
                <div class="text-gray-sif_200 text-left">{label}</div>
                <div class="text-right">{value}</div>
              </li>
            ))}
          </ul>
        </main>
        <footer class="">
          {pool.externalAmount.displaySymbol.startsWith("a") && (
            <Button.CallToAction>Claim</Button.CallToAction>
          )}
        </footer>
      </li>
    );
  },
});
