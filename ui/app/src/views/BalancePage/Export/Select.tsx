import { defineComponent, ref, computed, PropType, Ref } from "vue";
import Modal from "@/components/Modal";
import AssetIcon, { IconName } from "@/components/AssetIcon";
import { formatAssetAmount } from "@/componentsLegacy/shared/utils";
import { Network } from "@sifchain/sdk";
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
import { ExportData, getExportLocation } from "./useExportData";
import { Form } from "@/components/Form";
import { useAppWalletPicker } from "@/hooks/useAppWalletPicker";
import { rootStore } from "@/store";

export default defineComponent({
  name: "ExportSelect",
  props: {
    exportData: {
      type: Object as PropType<ExportData>,
      required: true,
    },
  },
  setup(props) {
    const { store } = useCore();

    const walletPicker = useAppWalletPicker();

    const {
      exportParams,
      networksRef,
      exportTokenRef,
      exportAmountRef,
    } = props.exportData;

    const networkRef = computed(() => exportParams.network);

    const handleSetMax = () => {
      const maxAmount = getMaxAmount(
        { value: exportTokenRef.value.asset.symbol } as Ref,
        exportTokenRef.value.amount,
      );
      exportParams.amount = format(maxAmount, exportTokenRef.value.asset, {
        mantissa: exportTokenRef.value.asset.decimals,
        trimMantissa: true,
      });
    };

    const validationErrorRef = computed(() => {
      if (!exportTokenRef.value) {
        return "Select Token";
      }
      if (!exportAmountRef.value) {
        return "Enter Amount";
      }
      if (exportAmountRef.value?.lessThanOrEqual("0.0")) {
        return "Enter Amount";
      }
      if (exportAmountRef.value?.greaterThan(exportTokenRef.value.amount)) {
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
            exportParams.network === Network.ETHEREUM &&
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
              router.replace(getExportLocation("confirm", exportParams));
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
        heading={props.exportData.headingRef.value}
        icon="interactive/arrow-up"
        onClose={props.exportData.exitExport}
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
            onInput={(e) => {
              const value = (e.target as HTMLInputElement).value;
              if (isNaN(parseFloat(value))) {
                exportParams.amount = "";
              } else {
                exportParams.amount = value;
              }
            }}
            value={exportParams.amount}
          />

          <div class="block mt-[10px]">
            Network
            <SelectDropdown
              options={optionsRef}
              value={networkRef}
              onChangeValue={(value) => {
                exportParams.network = value as Network;
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
                {exportParams.network}
              </Button.Select>
            </SelectDropdown>
          </div>
        </section>

        <section class="bg-gray-base p-4 rounded mt-[10px]">
          <Form.Details details={props.exportData.detailsRef.value} />
        </section>

        <section class="bg-gray-base p-4 rounded mt-[10px]">
          <div class="text-white capitalize">
            {props.exportData.exportParams.network} Recipient Address
          </div>
          <div class="relative border h-[54px] rounded border-solid border-gray-input_outline focus-within:border-white bg-gray-input mt-[10px]">
            <input
              readonly
              value={
                props.exportData.exportParams.network === Network.ETHEREUM
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
