import { Button } from "@/components/Button/Button";
import { Form } from "@/components/Form";
import Modal from "@/components/Modal";
import { Slider } from "@/components/Slider/Slider";
import { TokenIcon } from "@/components/TokenIcon";
import AssetIcon from "@/components/AssetIcon";
import { useAppWalletPicker } from "@/hooks/useAppWalletPicker";
import { useAssetBySymbol } from "@/hooks/useAssetBySymbol";
import { useFormattedTokenBalance } from "@/hooks/useFormattedTokenBalance";
import { SwapDetails } from "@/views/SwapPage/components/SwapDetails";
import { TokenInputGroup } from "@/views/SwapPage/components/TokenInputGroup";
import {
  computed,
  defineComponent,
  ref,
  TransitionGroup,
  watch,
  Ref,
} from "vue";
import { useRouter } from "vue-router";
import { PoolState, TransactionStatus } from "@sifchain/sdk";
import { useAddLiquidityData } from "../AddLiquidity/useAddLiquidityData";
import { useRemoveLiquidityData } from "./useRemoveLiquidityData";
import { ConfirmState, ConfirmStateEnum } from "@/types";
import { useTransactionDetails } from "@/hooks/useTransactionDetails";
import { useCore } from "@/hooks/useCore";
import TransactionDetailsModal from "@/components/TransactionDetailsModal";
export default defineComponent({
  setup(props) {
    const data = useRemoveLiquidityData();
    const router = useRouter();
    const appWalletPicker = useAppWalletPicker();
    const { store } = useCore();

    const transactionDetails = useTransactionDetails({
      tx: data.transactionStatus,
    });

    const detailsRef = computed<[any, any][]>(() => [
      ["You will receive:", null],
      [
        <div class="uppercase">{data.nativeAsset?.value?.displaySymbol}</div>,
        <div class="flex gap-[4px] flex-row font-mono">
          <div>{data.withdrawNativeAssetAmount.value}</div>
          <TokenIcon asset={data.nativeAsset}></TokenIcon>
        </div>,
      ],
      [
        <div class="uppercase">{data.externalAsset?.value?.displaySymbol}</div>,
        <div class="flex gap-[4px] flex-row font-mono">
          <div>{data.withdrawExternalAssetAmount.value}</div>
          <TokenIcon asset={data.externalAsset}></TokenIcon>
        </div>,
      ],
    ]);
    const close = () => {
      router.push({
        name: "Pool",
      });
    };

    return () => {
      if (data.modalStatus.value === "processing") {
        return (
          <TransactionDetailsModal
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
                <Slider
                  message={""}
                  min="0"
                  max="10000"
                  value={data.wBasisPoints.value}
                  disabled={
                    !data.connected.value ||
                    data.state.value === PoolState.NO_LIQUIDITY
                  }
                  onUpdate={(value) => {
                    data.wBasisPoints.value = value;
                  }}
                  onLeftClicked={() => {
                    data.wBasisPoints.value = "0";
                  }}
                  onMiddleClicked={() => {
                    data.wBasisPoints.value = "5000";
                  }}
                  onRightClicked={() => {
                    data.wBasisPoints.value = "10000";
                  }}
                  leftLabel="0%"
                  middleLabel=""
                  rightLabel="100%"
                ></Slider>
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
                    data.wBasisPoints.value = (
                      (+(e.target as HTMLInputElement).value / 100) *
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
                <Slider
                  hideIndicatorBarAccent
                  message={""}
                  min="-10000"
                  step="1"
                  max="10000"
                  value={data.asymmetry.value}
                  disabled={
                    !data.connected.value ||
                    data.state.value === PoolState.NO_LIQUIDITY
                  }
                  onUpdate={(value) => {
                    data.asymmetry.value = value;
                  }}
                  onLeftClicked={() => {
                    data.asymmetry.value = "-10000";
                  }}
                  onMiddleClicked={() => {
                    data.asymmetry.value = "0";
                  }}
                  onRightClicked={() => {
                    data.asymmetry.value = "10000";
                  }}
                  leftLabel="All ROWAN"
                  middleLabel="Equal"
                  rightLabel={`All ${data.externalAsset.value?.displaySymbol?.toUpperCase()}`}
                ></Slider>
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
          {!store.wallet.sif.isConnected ? (
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
