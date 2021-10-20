import { Button } from "@/components/Button/Button";
import { Form, FormDetailsType } from "@/components/Form";
import Modal from "@/components/Modal";
import { TokenIcon } from "@/components/TokenIcon";
import { useAppWalletPicker } from "@/hooks/useAppWalletPicker";
import { computed, defineComponent, ref } from "vue";
import { useRouter } from "vue-router";
import { Network, PoolState } from "@sifchain/sdk";
import { useRemoveLiquidityData } from "./useRemoveLiquidityData";
import { useTransactionDetails } from "@/hooks/useTransactionDetails";
import { useCore } from "@/hooks/useCore";
import TransactionDetailsModal from "@/components/TransactionDetailsModal";
import { accountStore } from "@/store/modules/accounts";

export default defineComponent({
  setup(props) {
    const data = useRemoveLiquidityData();
    const router = useRouter();
    const appWalletPicker = useAppWalletPicker();

    const sifAccountRef = accountStore.refs.sifchain.computed();
    const amountRangeRef = ref();

    const transactionDetails = useTransactionDetails({
      tx: data.transactionStatus,
    });

    const detailsRef = computed<FormDetailsType>(() => ({
      label: "You will receive:",
      details: [
        [
          <div class="uppercase">{data.nativeAsset?.value?.displaySymbol}</div>,
          <div class="flex gap-[4px] flex-row font-mono">
            <div>{data.withdrawNativeAssetAmount.value}</div>
            <TokenIcon asset={data.nativeAsset}></TokenIcon>
          </div>,
        ],
        [
          <div class="uppercase">
            {data.externalAsset?.value?.displaySymbol}
          </div>,
          <div class="flex gap-[4px] flex-row font-mono">
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
            <div class="p-4 bg-gray-base rounded-lg">
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
            <div class="w-full flex flex-row">
              <div class="w-full mt-[18px]">
                <div class="w-full relative">
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
                    onInput={(e) => {
                      data.wBasisPoints.value = (
                        e.target as HTMLInputElement
                      ).value;
                    }}
                  />
                  <div
                    class="absolute left-0 top-1/2 bg-accent-base rounded-lg rounded-r-none pointer-events-none"
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
                    class="text-white text-left text-opacity-50 cursor-pointer hover:text-opacity-70"
                    onClick={() => (data.wBasisPoints.value = "0")}
                  >
                    0%
                  </div>
                  <div
                    class="text-white text-left text-opacity-50 cursor-pointer hover:text-opacity-70"
                    onClick={() => (data.wBasisPoints.value = "10000")}
                  >
                    100%
                  </div>
                </div>
              </div>
              <div class="relative text-[20px] flex items-center w-[100px] ml-[20px] h-[54px] p-[8px] pl-0 rounded-[4px] bg-gray-input border-solid border-gray-input_outline border-[1px]">
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  class="px-[10px] pr-0 h-[31px] w-full align-middle bg-transparent outline-none  text-right"
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
                <div class="pr-[10px] pointer-events-none select-none">%</div>
              </div>
            </div>
          </Form.FieldSet>
          <Form.FieldSet class="mt-[10px]">
            <Form.Label class="w-full">Withdraw Ratio</Form.Label>
            <div class="w-full flex flex-row">
              <div class="w-full mt-[18px]">
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
                      data.asymmetry.value = (
                        e.target as HTMLInputElement
                      ).value;
                    }}
                  />
                </div>
                <div class="flex">
                  <div
                    class="text-white text-opacity-50 cursor-pointer hover:text-opacity-70 flex-1 text-left"
                    onClick={() => (data.asymmetry.value = "-10000")}
                  >
                    All ROWAN
                  </div>
                  <div
                    class="text-white text-opacity-50 cursor-pointer hover:text-opacity-70 flex-1 text-center"
                    onClick={() => (data.asymmetry.value = "0")}
                  >
                    Equal
                  </div>
                  <div
                    class="text-white text-opacity-50 cursor-pointer hover:text-opacity-70 flex-1 text-right"
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
              {/* <div class="relative text-[20px] flex items-center w-[100px] ml-[20px] h-[54px] p-[8px] pl-0 rounded-[4px] bg-gray-input border-solid border-gray-input_outline border-[1px]">
              <input
                type="number"
                step="1"
                min="0"
                max="100"
                class="px-[10px] pr-0 h-[31px] w-full align-middle bg-transparent outline-none  text-right"
                value={(
                  ((+data.asymmetry.value + 10000) / (10000 * 2)) *
                  100
                ).toFixed(0)}
                onInput={(e) => {
                  data.wBasisPoints.value = (
                    (+(e.target as HTMLInputElement).value / 100) *
                    10000
                  ).toString();
                }}
              />
              <div class="pr-[10px] pointer-events-none select-none">%</div>
            </div> */}
            </div>
          </Form.FieldSet>
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
