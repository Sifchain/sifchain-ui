import { defineComponent, ref, computed, PropType, Ref } from "vue";
import Modal from "@/components/Modal";
import AssetIcon, { IconName } from "@/components/AssetIcon";
import { formatAssetAmount } from "@/componentsLegacy/shared/utils";
import { Amount, AssetAmount, Network, toBaseUnits } from "@sifchain/sdk";
import { useCore } from "@/hooks/useCore";
import { format } from "@sifchain/sdk/src/utils/format";
import { getMaxAmount } from "@/views/utils/getMaxAmount";
import {
  SelectDropdown,
  SelectDropdownOption,
} from "@/components/SelectDropdown";
import { Input } from "@/components/Input/Input";
import { Button } from "@/components/Button/Button";
import router from "@/router";
import { getExportLocation, useExportData } from "./useExportData";
import { Form } from "@/components/Form";
import { useAppWalletPicker } from "@/hooks/useAppWalletPicker";
import { rootStore } from "@/store";
import { exportStore } from "@/store/modules/export";

export default defineComponent({
  name: "ExportSelect",
  props: {},
  setup(props) {
    const { store } = useCore();
    const exportData = useExportData();
    const walletPicker = useAppWalletPicker();

    const {
      networksRef,
      exportTokenRef,
      computedExportAssetAmount,
      feeAmountRef,
    } = exportData;
    const exportParams = exportStore.refs.draft.computed();
    const networkRef = computed(() => exportParams.value.network);

    const handleSetMax = () => {
      if (!exportTokenRef.value) return;
      let maxAmount = getMaxAmount(
        { value: exportTokenRef.value?.asset.symbol } as Ref,
        exportTokenRef.value?.amount,
      );
      if (
        feeAmountRef.value?.asset.symbol === exportTokenRef.value.asset.symbol
      ) {
        maxAmount = maxAmount.subtract(feeAmountRef.value.amount.toString());
      }
      if (maxAmount.lessThan("0")) {
        maxAmount = Amount("0.0");
      }
      exportStore.setDraft({
        amount: format(maxAmount, exportTokenRef.value.asset, {
          mantissa: exportTokenRef.value.asset.decimals,
          trimMantissa: true,
        }),
      });
    };

    const validationErrorRef = computed(() => {
      if (!exportTokenRef.value) {
        return "Select Token";
      }
      if (
        feeAmountRef.value &&
        feeAmountRef.value?.asset.symbol ===
          exportTokenRef.value?.asset.symbol &&
        exportTokenRef.value.amount.lessThanOrEqual(feeAmountRef.value?.amount)
      ) {
        return "Not Enough Balance To Pay Fee";
      }
      if (!computedExportAssetAmount.value) {
        return "Enter Amount";
      }
      if (computedExportAssetAmount.value?.lessThanOrEqual("0.0")) {
        return "Enter Amount";
      }

      if (
        computedExportAssetAmount.value?.greaterThan(
          exportTokenRef.value.amount,
        )
      ) {
        return "Amount Too Large";
      }
    });

    const buttonRef = computed(() => {
      const buttons = [
        {
          condition: !store.wallet.sif.isConnected,
          name: "Connect Sifchain Wallet",
          icon: "interactive/arrows-in" as IconName,
          props: {
            disabled: false,
            onClick: () => walletPicker.show(),
          },
        },
        {
          condition:
            exportParams.value.network === Network.ETHEREUM &&
            !store.wallet.eth.isConnected,
          name: "Connect Ethereum Wallet",
          icon: "interactive/arrows-in" as IconName,
          props: {
            onClick: () => walletPicker.show(),
          },
        },
        {
          condition: true,
          name: validationErrorRef.value || "Export",
          icon: null,
          props: {
            disabled: !!validationErrorRef.value,
            onClick: () => {
              const exportLocation = getExportLocation(
                "confirm",
                exportParams.value,
              );
              router.push(exportLocation);
            },
          },
        },
      ];
      return buttons.find((item) => item.condition) || buttons[0];
    });

    const optionsRef = computed<SelectDropdownOption[]>(() =>
      networksRef.value.map((network) => ({
        content: <div class="capitalize">{network}</div>,
        value: network,
      })),
    );
    const networkOpenRef = ref(false);

    return () => (
      <Modal
        heading={exportData.headingRef.value}
        icon="interactive/arrow-up"
        onClose={exportData.exitExport}
        showClose
      >
        <section class="bg-gray-base p-4 rounded">
          <label
            for="exportAmount"
            class={"flex relative items-center justify-between"}
          >
            <span>Amount</span>
            {!!exportTokenRef.value && (
              <span
                class="text-base opacity-50 hover:text-accent-base cursor-pointer self-end"
                onClick={handleSetMax}
              >
                Balance: {formatAssetAmount(exportTokenRef.value?.amount)}
              </span>
            )}
          </label>

          <Input.Base
            containerClass="mt-[10px]"
            startContent={
              !!exportTokenRef.value && (
                <Button.Pill onClick={handleSetMax}>MAX</Button.Pill>
              )
            }
            id="exportAmount"
            type="number"
            min="0"
            style={{
              textAlign: "right",
            }}
            onInput={(e: Event) => {
              const value = (e.target as HTMLInputElement).value;
              if (isNaN(parseFloat(value))) {
                exportStore.setDraft({
                  amount: "",
                });
              } else {
                exportStore.setDraft({
                  amount: value,
                });
              }
            }}
            value={exportParams.value.amount}
          />

          <div class="block mt-[10px]">
            Network
            <SelectDropdown
              options={optionsRef}
              value={networkRef}
              onChangeValue={(value) => {
                exportStore.setDraft({
                  network: value as Network,
                });
              }}
              tooltipProps={{
                onShow: () => {
                  networkOpenRef.value = true;
                },
                onHide: () => {
                  networkOpenRef.value = false;
                },
              }}
            >
              <Button.Select
                class="w-full relative capitalize pl-[16px] mt-[10px]"
                active={networkOpenRef.value}
              >
                {exportParams.value.network}
              </Button.Select>
            </SelectDropdown>
          </div>
        </section>

        <section class="bg-gray-base p-4 rounded mt-[10px]">
          <Form.Details details={exportData.detailsRef.value} />
        </section>

        <section class="bg-gray-base p-4 rounded mt-[10px]">
          <div class="text-white capitalize">
            {exportParams.value.network} Recipient Address
          </div>
          <div class="relative border h-[54px] rounded border-solid border-gray-input_outline focus-within:border-white bg-gray-input mt-[10px]">
            <input
              readonly
              value={
                exportParams.value.network === Network.ETHEREUM
                  ? store.wallet.eth.address
                  : rootStore.accounts.state.cosmoshub.address
              }
              class="absolute top-0 left-0 w-full h-full bg-transparent p-[16px] font-mono outline-none text-md"
              onClick={(e) => {
                (e.target as HTMLInputElement).setSelectionRange(0, 99999999);
              }}
            />
          </div>
        </section>

        <Button.CallToAction {...buttonRef.value.props} class="mt-[10px]">
          {!!buttonRef.value.icon && (
            <AssetIcon
              icon={buttonRef.value.icon}
              class="w-[20px] h-[20px] mr-[4px]"
            />
          )}{" "}
          {buttonRef.value.name}
        </Button.CallToAction>
      </Modal>
    );
  },
});
