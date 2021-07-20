import { defineComponent, ref, computed, PropType, Ref } from "vue";
import Modal from "@/components/Modal";
import AssetIcon, { IconName } from "@/components/AssetIcon";
import { formatAssetAmount } from "@/componentsLegacy/shared/utils";
import { Network } from "@sifchain/sdk";
import { useCore } from "@/hooks/useCore";
import { useTokenIconUrl } from "@/hooks/useTokenIconUrl";
import { format } from "@sifchain/sdk/src/utils/format";
import { getMaxAmount } from "@/views/utils/getMaxAmount";
import { Input } from "@/components/Input/Input";
import { Button } from "@/components/Button/Button";
import router from "@/router";
import { ExportData, getExportLocation } from "./useExportData";
import { Form } from "@/components/Form";

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

    const {
      exportParams,
      networksRef,
      exportTokenRef,
      targetTokenRef,
      exportAmountRef,
      feeAmountRef,
    } = props.exportData;

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

    const symbolIconRef = computed(
      () =>
        useTokenIconUrl({
          symbol: ref(exportParams.symbol || ""),
        })?.value,
    );

    const validationErrorRef = computed(() => {
      if (!exportTokenRef.value) {
        return "Please provide a valid token to import.";
      }
      if (!exportAmountRef.value) {
        return "Please select an amount.";
      }
      if (exportAmountRef.value?.lessThanOrEqual("0.0")) {
        return "Please enter an amount greater than 0 to import.";
      }
      if (exportTokenRef.value.amount.lessThan(exportParams.amount || "0")) {
        return (
          "You do not have that much " +
          exportTokenRef.value.asset.symbol.toUpperCase() +
          " available."
        );
      }
    });

    const buttonRef = computed(() => {
      const buttons = [
        {
          condition: false && !store.wallet.sif.isConnected,
          name: "Connect Sifchain Wallet",
          icon: "interactive/arrows-in" as IconName,
          props: {
            disabled: false,
            onClick: () => window.alert("Open Wallet Window Sif"),
          },
        },
        {
          condition:
            false &&
            exportParams.network === Network.ETHEREUM &&
            !store.wallet.eth.isConnected,
          name: "Connect Ethereum Wallet",
          icon: "interactive/arrows-in" as IconName,
          props: {
            onClick: () => window.alert("Open Wallet Window Eth"),
          },
        },
        {
          condition: true,
          name: "Export",
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
            <Button.Select class="capitalize relative w-full mt-[10px] pl-[16px]">
              <div class="flex flex-1 justify-end text-right">
                {exportParams.network}
              </div>
              <select
                class={
                  "absolute left-0 top-0 w-full h-full opacity-0 text-right"
                }
                value={exportParams.network}
                onChange={(e) => {
                  const select = e.target as HTMLSelectElement;
                  exportParams.network = select.value as Network;
                }}
              >
                {networksRef.value.map((network: string) => (
                  <option value={network}>
                    {network[0].toUpperCase() + network.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </Button.Select>
          </div>
        </section>

        <section class="bg-gray-base p-4 rounded mt-[10px]">
          <Form.Details details={props.exportData.detailsRef.value} />
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
