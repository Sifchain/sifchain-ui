import {
  defineComponent,
  ref,
  computed,
  watch,
  reactive,
  PropType,
  Ref,
} from "vue";
import { useRoute } from "vue-router";
import cx from "clsx";
import AssetIcon, { IconName } from "@/componentsLegacy/utilities/AssetIcon";
import Tooltip from "@/components/Tooltip";
import { formatAssetAmount } from "@/componentsLegacy/shared/utils";
import { AssetAmount, Network } from "@sifchain/sdk";
import { useCore } from "@/hooks/useCore";
import { useTokenIconUrl } from "@/hooks/useTokenIconUrl";
import { useSelectClasses } from "@/hooks/elements/useSelectClasses";
import { useDetailListClasses } from "@/hooks/elements/useDetailListClasses";
import { useButtonClasses } from "@/hooks/elements/useButtonClasses";
import { format } from "@sifchain/sdk/src/utils/format";
import { getMaxAmount } from "@/views/utils/getMaxAmount";
import router from "@/router";
import { ExportData, getExportLocation } from "./useExportData";
import ExportDetailsDisplay from "./ExportDetailsDisplay";

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
    const selectClasses = useSelectClasses();
    const buttonClasses = useButtonClasses();
    const listClasses = useDetailListClasses();
    const route = useRoute();

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
      <>
        <section class="bg-gray-base p-4 rounded">
          <label
            for="exportAmount"
            class={"flex relative items-center justify-between"}
          >
            <span>Amount</span>
            {!!exportTokenRef.value && (
              <span
                class="text-sm opacity-50 hover:text-accent-base cursor-pointer self-end"
                onClick={handleSetMax}
              >
                Balance: {formatAssetAmount(exportTokenRef.value?.amount)}
              </span>
            )}
          </label>

          <div class="relative flex items-center h-[54px] px-3 rounded bg-gray-input border-solid border-gray-input_outline border mt-[10px]">
            {!!exportTokenRef.value && (
              <button
                class="z-10 box-content text-[10px] p-[1px] font-semibold bg-accent-gradient rounded-full font-sans"
                onClick={handleSetMax}
              >
                <div class="flex items-center px-[9px] h-[18px] bg-gray-input rounded-full text-accent-base">
                  <span style="letter-spacing: -1%; line-height: 10px;">
                    MAX
                  </span>
                </div>
              </button>
            )}
            <input
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
              class="box-border w-full absolute top-0 bottom-0 left-0 right-0 pr-[16px] pl-[68px] h-full bg-transparent outline-none text-[20px] text-white font-sans font-medium"
            />
          </div>

          <label class={[selectClasses.label, "block mt-[10px]"]}>
            Network
            <div class={selectClasses.container}>
              <span class="capitalize">{exportParams.network}</span>
              <AssetIcon icon="interactive/chevron-down" class="w-5 h-5" />
              <select
                class={[selectClasses.select, "text-right"]}
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
            </div>
          </label>
        </section>

        <section class="bg-gray-base p-4 rounded mt-[10px]">
          <ExportDetailsDisplay exportData={props.exportData} />
        </section>

        <button
          {...buttonRef.value.props}
          class={[
            "w-full mt-[10px]",
            buttonClasses.button,
            buttonRef.value.props.disabled && buttonClasses.disabled,
          ]}
        >
          {!!buttonRef.value.icon && (
            <AssetIcon
              icon={buttonRef.value.icon}
              class="w-[20px] h-[20px] mr-[4px]"
            />
          )}{" "}
          {buttonRef.value.name}
        </button>
      </>
    );
  },
});
