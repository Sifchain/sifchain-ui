import Button from "~/components/Button";
import { Form, FormDetailsType } from "~/components/Form";
import Modal from "~/components/Modal";
import { TokenIcon } from "~/components/TokenIcon";
import TransactionDetailsModal from "~/components/TransactionDetailsModal";
import { useUnlockLiquidityMutation } from "~/domains/clp/mutation/liquidity";
import { useCurrentRewardPeriodStatistics } from "~/domains/clp/queries/params";
import { useUnlockLiquidityByPercentage } from "~/domains/clp/queries/unlockLiquidityByPercentage";
import { useAppWalletPicker } from "~/hooks/useAppWalletPicker";
import { useAssetBySymbol } from "~/hooks/useAssetBySymbol";
import { PoolStat, usePoolStats } from "~/hooks/usePoolStats";
import { useDeliverTxDetails } from "~/hooks/useTransactionDetails";
import { useWalletButton } from "~/hooks/useWalletButton";
import { accountStore } from "~/store/modules/accounts";
import { Amount, Network } from "@sifchain/sdk";
import { formatDistance } from "date-fns";
import { computed, defineComponent, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useMaxwithdrawData } from "./RemoveLiquidity/useRemoveLiquidityData";

/**
 * Near clone of RemoveLiquidity
 * @see [RemoveLiquidity](./RemoveLiquidity/RemoveLiquidity.tsx)
 */
const UnbondLiquidity = defineComponent({
  setup() {
    const router = useRouter();
    const route = useRoute();
    const externalAssetBaseDenom = computed(() =>
      route.params.externalAsset?.toString(),
    );

    const nativeAsset = useAssetBySymbol(ref("rowan"));
    const externalAsset = useAssetBySymbol(externalAssetBaseDenom);

    const withdrawalPercentage = ref(0);

    const unlockLiquidityData = useUnlockLiquidityByPercentage(
      externalAssetBaseDenom,
      withdrawalPercentage,
    );

    const unlockLiquidityMutation = useUnlockLiquidityMutation();

    const { data: currentRewardPeriod } = useCurrentRewardPeriodStatistics();

    const poolStats = usePoolStats();
    const { connected } = useWalletButton();

    const appWalletPicker = useAppWalletPicker();
    const sifAccountRef = accountStore.refs.sifchain.computed();

    const amountRangeRef = ref();
    const buttonErrorMsg = computed(() => {
      if (withdrawalPercentage.value === 0) return "Please enter an amount";
      return undefined;
    });

    const withdrawData = useMaxwithdrawData({
      externalAssetSymbol: externalAssetBaseDenom,
      wBasisPoints: computed(() => withdrawalPercentage.value * 100),
    });

    const nativeAssetWithDrawalUsd = computed(() =>
      Amount(withdrawData.withdrawNativeAssetAmount.value)
        ?.multiply(poolStats.data.value?.rowanUSD ?? 0)
        .toNumber(),
    );

    const externalAssetPriceUsd = computed(() => {
      const poolData = poolStats.data?.value?.poolData;
      const pools = poolData?.pools as Record<string, PoolStat>;
      return Object.values(pools).find(
        (x) => x.symbol === externalAssetBaseDenom.value,
      )?.priceToken;
    });

    const externalAssetWithdrawalUsd = computed(() => {
      return Amount(withdrawData.withdrawExternalAssetAmount.value)
        ?.multiply(externalAssetPriceUsd.value ?? 0)
        .toNumber();
    });

    const detailsRef = computed<FormDetailsType>(() => ({
      label: "Est. amount you will receive:",
      details: [
        [
          <div class="uppercase">{nativeAsset.value?.displaySymbol}</div>,
          <div class="flex flex-row gap-[4px] align-middle font-mono">
            <div>
              {withdrawData.withdrawNativeAssetAmount.value} (~
              {nativeAssetWithDrawalUsd.value?.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
              )
            </div>
            <TokenIcon asset={nativeAsset} />
          </div>,
        ],
        [
          <div class="uppercase">{externalAsset.value?.displaySymbol}</div>,
          <div class="flex flex-row gap-[4px] align-middle font-mono">
            <div>
              {withdrawData.withdrawExternalAssetAmount.value} (~
              {externalAssetWithdrawalUsd.value?.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
              )
            </div>
            <TokenIcon asset={externalAsset} />
          </div>,
        ],
      ],
    }));

    const transactionDetails = useDeliverTxDetails(
      unlockLiquidityMutation.data,
      unlockLiquidityMutation.isLoading,
      unlockLiquidityMutation.isError,
    );

    const close = () =>
      router.push({
        name: "Pool",
      });

    return () => {
      if (!unlockLiquidityMutation.isIdle.value) {
        return (
          <TransactionDetailsModal
            network={Network.SIFCHAIN}
            icon="interactive/minus"
            onClose={close}
            details={detailsRef}
            transactionDetails={transactionDetails}
          />
        );
      }

      return (
        <Modal
          heading="Unbond Liquidity"
          icon="interactive/minus"
          showClose
          onClose={close}
        >
          <Form.FieldSet>
            <Form.Label class="w-full">Unbond Amount</Form.Label>
            <div class="flex w-full flex-row">
              <div class="mt-[18px] w-full">
                <div class="relative w-full">
                  <input
                    type="range"
                    ref={amountRangeRef}
                    disabled={
                      !connected.value ||
                      unlockLiquidityData.value.status !== "fulfilled"
                    }
                    value={withdrawalPercentage.value}
                    onInput={(e) => {
                      withdrawalPercentage.value = parseInt(
                        (e.target as HTMLInputElement).value,
                      );
                    }}
                  />
                  <div
                    class="bg-accent-base pointer-events-none absolute left-0 top-1/2 rounded-lg rounded-r-none"
                    style={{
                      height: amountRangeRef.value?.offsetHeight + "px",
                      transform: "translateY(-50%)",
                      width: `calc(${Math.min(
                        withdrawalPercentage.value,
                        99,
                      )}%`,
                    }}
                  />
                </div>
                <div class="flex justify-between">
                  <div
                    class="cursor-pointer text-left text-white text-opacity-50 hover:text-opacity-70"
                    onClick={() => (withdrawalPercentage.value = 0)}
                  >
                    0%
                  </div>
                  <div
                    class="cursor-pointer text-left text-white text-opacity-50 hover:text-opacity-70"
                    onClick={() => (withdrawalPercentage.value = 100)}
                  >
                    100%
                  </div>
                </div>
              </div>
              <div class="bg-gray-input border-gray-input_outline relative ml-[20px] flex h-[54px] w-[100px] items-center rounded-[4px] border-[1px] border-solid p-[8px] pl-0 text-[20px]">
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  class="h-[31px] w-full bg-transparent px-[10px] pr-0 text-right align-middle outline-none"
                  value={withdrawalPercentage.value}
                  onInput={(e) => {
                    const input = e.target as HTMLInputElement;
                    const rawValue = input.value;

                    if (!/^\d+$/.test(rawValue)) return;

                    const value = parseInt(rawValue, 10);
                    const clampedValue =
                      value > 100 ? 100 : value < 0 ? 0 : value;

                    if (clampedValue !== value) {
                      input.value = clampedValue.toString();
                    }

                    withdrawalPercentage.value = clampedValue;
                  }}
                />
                <div class="pointer-events-none select-none pr-[10px]">%</div>
              </div>
            </div>
          </Form.FieldSet>
          <Form.Details class="my-[10px]" details={detailsRef.value} />
          <p
            class="text-justify text-sm text-white text-opacity-50"
            style="text-align-last: center"
          >
            Liquidity will be equally removed from all pooled assets. Unbonding
            requests take{" "}
            {currentRewardPeriod.value?.estimatedLockMs === undefined
              ? "..."
              : formatDistance(
                  0,
                  currentRewardPeriod.value?.estimatedLockMs,
                )}{" "}
            to process. Once your funds are ready, you will have{" "}
            {currentRewardPeriod.value?.estimatedCancelMs === undefined
              ? "..."
              : formatDistance(
                  0,
                  currentRewardPeriod.value?.estimatedCancelMs,
                )}{" "}
            to remove them before the request is canceled. Please check back
            periodically to ensure you don't miss your window!
          </p>
          {!sifAccountRef.value.connected ? (
            <Button.CallToAction
              onClick={() => appWalletPicker.show()}
              class="mt-[10px]"
            >
              Connect Wallet
            </Button.CallToAction>
          ) : (
            <Button.CallToAction
              class="mt-[10px]"
              disabled={buttonErrorMsg.value !== undefined}
              onClick={() =>
                unlockLiquidityMutation.mutate({
                  externalAssetSymbol: externalAssetBaseDenom.value,
                  units: unlockLiquidityData.value.units?.toFixed() ?? "0",
                })
              }
            >
              {buttonErrorMsg.value ?? "Unbond Liquidity"}
            </Button.CallToAction>
          )}
        </Modal>
      );
    };
  },
});

export default UnbondLiquidity;
