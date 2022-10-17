import { computed, defineComponent, ref } from "vue";
import { useRouter } from "vue-router";
import { Network } from "@sifchain/sdk";

import Button from "~/components/Button";
import { Form, FormDetailsType } from "~/components/Form";
import Modal from "~/components/Modal";
import { TokenIcon } from "~/components/TokenIcon";
import { useAppWalletPicker } from "~/hooks/useAppWalletPicker";
import { useRemoveLiquidityData } from "./useRemoveLiquidityData";
import { useTransactionDetails } from "~/hooks/useTransactionDetails";
import TransactionDetailsModal from "~/components/TransactionDetailsModal";
import { accountStore } from "~/store/modules/accounts";
import { PoolState } from "~/business/calculators";
import { flagsStore } from "~/store/modules/flags";

export default defineComponent({
  setup() {
    const data = useRemoveLiquidityData();
    const router = useRouter();
    const appWalletPicker = useAppWalletPicker();

    const sifAccountRef = accountStore.refs.sifchain.computed();
    const amountRangeRef = ref();

    const transactionDetails = useTransactionDetails({
      tx: data.transactionStatus,
    });

    console.log("data", { data });

    const detailsRef = computed<FormDetailsType>(() => ({
      label: "You will receive:",
      details: [
        [
          <div class="uppercase">{data.nativeAsset?.value?.displaySymbol}</div>,
          <div class="flex flex-row gap-[4px] font-mono">
            <div>{data.withdrawNativeAssetAmount.value}</div>
            <TokenIcon asset={data.nativeAsset}></TokenIcon>
          </div>,
        ],
        [
          <div class="uppercase">
            {data.externalAsset?.value?.displaySymbol}
          </div>,
          <div class="flex flex-row gap-[4px] font-mono">
            <div>{data.withdrawExternalAssetAmount.value}</div>
            <TokenIcon asset={data.externalAsset}></TokenIcon>
          </div>,
        ],
      ],
    }));

    const close = () => {
      router.push({
        name: "Pool",
      });
    };

    const isAsymetricPoolingEnabled = computed(
      () => flagsStore.state.remoteFlags.ASYMMETRIC_POOLING,
    );

    return () => {
      if (data.modalStatus.value === "processing") {
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

      if (data.modalStatus.value === "confirm") {
        return (
          <Modal
            heading="Remove Liquidity"
            icon="interactive/minus"
            showClose
            onClose={close}
          >
            <div class="bg-gray-base rounded-lg p-4">
              <Form.Details details={detailsRef.value} />
            </div>
            <Button.CallToAction
              class="mt-[10px]"
              onClick={() => {
                data.handleAskConfirmClicked();
              }}
            >
              Confirm
            </Button.CallToAction>
          </Modal>
        );
      }

      return (
        <Modal
          heading="Remove Liquidity"
          icon="interactive/minus"
          showClose
          onClose={close}
        >
          <Form.FieldSet>
            <Form.Label class="w-full">Withdraw Amount</Form.Label>
            <div class="flex w-full flex-row">
              <div class="mt-[18px] w-full">
                <div class="relative w-full">
                  <input
                    type="range"
                    ref={amountRangeRef}
                    disabled={
                      !data.connected.value ||
                      data.state.value === PoolState.NO_LIQUIDITY
                    }
                    min="0"
                    max="10000"
                    value={data.wBasisPoints.value}
                    step="10"
                    onInput={(e) => {
                      const { value } = e.target as HTMLInputElement;
                      data.wBasisPoints.value = value;
                    }}
                  />
                  <div
                    class="bg-accent-base pointer-events-none absolute left-0 top-1/2 rounded-lg rounded-r-none"
                    style={{
                      height: amountRangeRef.value?.offsetHeight + "px",
                      transform: "translateY(-50%)",
                      width: `calc(${Math.min(
                        +data.wBasisPoints.value / 100,
                        99,
                      )}%`,
                    }}
                  />
                </div>
                <div class="flex justify-between">
                  <div
                    class="cursor-pointer text-left text-white text-opacity-50 hover:text-opacity-70"
                    onClick={() => (data.wBasisPoints.value = "0")}
                  >
                    0%
                  </div>
                  <div
                    class="cursor-pointer text-left text-white text-opacity-50 hover:text-opacity-70"
                    onClick={() => (data.wBasisPoints.value = "10000")}
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
                  class="h-[31px] w-full bg-transparent px-[10px] pr-0 text-right align-middle  outline-none"
                  value={((+data.wBasisPoints.value / 10000) * 100).toFixed(0)}
                  onInput={(e) => {
                    const input = e.target as HTMLInputElement;
                    let value = +input.value;
                    if (value > 100) {
                      value = 100;
                      input.value = "100";
                    }
                    if (value < 0) {
                      value = 0;
                      input.value = "0";
                    }
                    data.wBasisPoints.value = (
                      (value / 100) *
                      10000
                    ).toString();
                  }}
                />
                <div class="pointer-events-none select-none pr-[10px]">%</div>
              </div>
            </div>
          </Form.FieldSet>
          {isAsymetricPoolingEnabled.value && (
            <Form.FieldSet class="mt-[10px]">
              <Form.Label class="w-full">Withdraw Ratio</Form.Label>
              <div class="flex w-full flex-row">
                <div class="mt-[18px] w-full">
                  <div class="w-full">
                    <input
                      type="range"
                      disabled={
                        !data.connected.value ||
                        data.state.value === PoolState.NO_LIQUIDITY
                      }
                      step="50"
                      min="-10000"
                      max="10000"
                      value={data.asymmetry.value}
                      onInput={(e) => {
                        const { value } = e.target as HTMLInputElement;
                        data.asymmetry.value = value;
                      }}
                    />
                  </div>
                  <div class="flex">
                    <div
                      class="flex-1 cursor-pointer text-left text-white text-opacity-50 hover:text-opacity-70"
                      onClick={() => (data.asymmetry.value = "-10000")}
                    >
                      All ROWAN
                    </div>
                    <div
                      class="flex-1 cursor-pointer text-center text-white text-opacity-50 hover:text-opacity-70"
                      onClick={() => (data.asymmetry.value = "0")}
                    >
                      Equal
                    </div>
                    <div
                      class="flex-1 cursor-pointer text-right text-white text-opacity-50 hover:text-opacity-70"
                      onClick={() => (data.asymmetry.value = "10000")}
                    >
                      All{" "}
                      {(
                        data.externalAsset.value?.displaySymbol ||
                        data.externalAsset.value?.symbol ||
                        ""
                      ).toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
            </Form.FieldSet>
          )}
          <Form.Details class="mt-[10px]" details={detailsRef.value} />
          {!sifAccountRef.value.connected ? (
            <Button.CallToAction
              onClick={() => appWalletPicker.show()}
              class="mt-[10px]"
              disabled={!data.nextStepAllowed.value}
            >
              Connect Wallet
            </Button.CallToAction>
          ) : (
            <Button.CallToAction
              disabled={!data.nextStepAllowed.value}
              onClick={() => data.handleNextStepClicked()}
              class="mt-[10px]"
            >
              {data.nextStepMessage.value}
            </Button.CallToAction>
          )}
        </Modal>
      );
    };
  },
});
