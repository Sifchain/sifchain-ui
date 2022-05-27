import { AssetAmount, Network } from "@sifchain/sdk";
import { differenceInDays } from "date-fns";
import { computed, defineComponent, PropType, ref } from "vue";

import AssetIcon from "~/components/AssetIcon";
import AssetPair from "~/components/AssetPair";
import { Button } from "~/components/Button/Button";
import { useChains } from "~/hooks/useChains";
import { useRowanPrice } from "~/hooks/useRowanPrice";
import { prettyNumber } from "~/utils/prettyNumber";
import { ElementOf } from "~/utils/types";
import { PoolDataArray } from "../usePoolPageData";
import { useUserPoolData } from "../useUserPoolData";
import PoolStats from "./PoolStats";

export default defineComponent({
  name: "MyPoolStats",
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
    const { pool, accountPool, poolStat, liquidityProvider } = props.context;

    const unbondingState = computed(() => {
      const filteredUnlock =
        liquidityProvider?.liquidityProvider?.unlocks.filter((x) => !x.expired);

      const unlock = filteredUnlock?.[0];

      if (!unlock) return;

      return {
        ...unlock,
        isCancelDisabled: true,
        isCancelInProgress: false,
        onCancelRequest: () => {},
      };
    });

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

    const details = computed(() => [
      ["Your pool share %", `${userPoolData.myPoolShare.value ?? "0"}%`],
      ["Your pool value", `$${myPoolValue.value ?? "0"}`],
    ]);

    return () => (
      <>
        <header class="flex items-center justify-between p-4">
          <AssetPair asset={ref(pool.externalAmount.asset)} invert />
          {unbondingState.value?.expiration && (
            <div>
              <span class="text-sm text-gray-600">
                Unbonding in{" "}
                {differenceInDays(unbondingState.value.expiration, new Date())}
              </span>
            </div>
          )}
        </header>
        <main class="flex flex-1 flex-col gap-2">
          <ul class="grid w-full gap-1.5 px-4 py-2">
            {details.value.map(([label, value]) => (
              <li class="flex items-center justify-between text-sm">
                <div class="text-gray-sif200 text-left">{label}</div>
                <div class="text-gray-sif50 text-right font-semibold">
                  {value}
                </div>
              </li>
            ))}
          </ul>
          <PoolStats context={props.context} class="bg-gray-sif850 flex-1" />
        </main>
        {unbondingState.value && (
          <footer class="grid gap-1.5 px-4 py-2">
            {unbondingState.value.isCancelDisabled && (
              <Button.CallToAction>Claim Liquidity</Button.CallToAction>
            )}
            {!unbondingState.value.expired && (
              <Button.CallToActionSecondary
                class="text-danger-base h-[36px] text-[14px] uppercase disabled:bg-inherit"
                disabled={unbondingState.value.isCancelDisabled}
                onClick={unbondingState.value.onCancelRequest}
              >
                {unbondingState.value.isCancelInProgress ? (
                  <AssetIcon
                    size={36}
                    icon="interactive/anim-racetrack-spinner"
                  />
                ) : (
                  "Cancel"
                )}
              </Button.CallToActionSecondary>
            )}
          </footer>
        )}
      </>
    );
  },
});
