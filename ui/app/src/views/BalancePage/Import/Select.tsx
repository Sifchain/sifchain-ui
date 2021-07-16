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
import { formatAssetAmount } from "@/componentsLegacy/shared/utils";
import { AssetAmount, Network } from "@sifchain/sdk";
import { useCore } from "@/hooks/useCore";
import { TokenIcon } from "@/components/TokenIcon";
import { useSelectClasses } from "@/hooks/elements/useSelectClasses";
import { useButtonClasses } from "@/hooks/elements/useButtonClasses";
import { format } from "@sifchain/sdk/src/utils/format";
import { getMaxAmount } from "@/views/utils/getMaxAmount";
import { Input } from "@/components/Input/Input";
import { Button } from "@/components/Button/Button";
import router from "@/router";
import { ImportData, getImportLocation } from "./useImportData";
import { TokenSelectDropdown } from "@/components/TokenSelectDropdown";

export default defineComponent({
  name: "ImportSelect",
  props: {
    importData: {
      type: Object as PropType<ImportData>,
      required: true,
    },
  },
  setup(props) {
    const { store } = useCore();
    const selectClasses = useSelectClasses();
    const buttonClasses = useButtonClasses();
    const route = useRoute();

    const selectIsOpen = ref(false);

    const {
      importParams,
      networksRef,
      pickableTokensRef,
      tokenRef,
      importAmountRef,
    } = props.importData;

    const assetRef = ref(tokenRef.value.asset);

    const handleSetMax = () => {
      const maxAmount = getMaxAmount(
        { value: tokenRef.value.asset.symbol } as Ref,
        tokenRef.value.amount,
      );
      importParams.amount = format(maxAmount, tokenRef.value.asset, {
        mantissa: tokenRef.value.asset.decimals,
        trimMantissa: true,
      });
    };

    const validationErrorRef = computed(() => {
      if (!tokenRef.value) {
        return "Please provide a valid token to import.";
      }
      if (!importAmountRef.value) {
        return "Please select an amount.";
      }
      if (importAmountRef.value?.lessThanOrEqual("0.0")) {
        return "Please enter an amount greater than 0 to import.";
      }
      if (tokenRef.value.amount.lessThan(importParams.amount || "0")) {
        return (
          "You do not have that much " +
          tokenRef.value.asset.symbol.toUpperCase() +
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
            importParams.network === Network.ETHEREUM &&
            !store.wallet.eth.isConnected,
          name: "Connect Ethereum Wallet",
          icon: "interactive/arrows-in" as IconName,
          props: {
            onClick: () => window.alert("Open Wallet Window Eth"),
          },
        },
        {
          condition: true,
          name: "Import",
          icon: null,
          props: {
            disabled: !!validationErrorRef.value,
            onClick: () => {
              router.replace(getImportLocation("confirm", importParams));
            },
          },
        },
      ];
      return buttons.find((item) => item.condition) || buttons[0];
    });

    return () => (
      <>
        <section class="bg-gray-base p-4 rounded">
          <div class="flex">
            <label class={cx(selectClasses.label, "flex-1")}>
              Network
              <div class={selectClasses.container}>
                <span class="capitalize">{importParams.network}</span>
                <AssetIcon icon="interactive/chevron-down" class="w-5 h-5" />
                <select
                  class={selectClasses.select}
                  value={importParams.network}
                  onChange={(e) => {
                    const select = e.target as HTMLSelectElement;
                    importParams.network = select.value as Network;
                  }}
                >
                  {networksRef.value.map((network: string) => (
                    <option value={network}>
                      {network[0].toUpperCase() +
                        network.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
            </label>
            <label class={cx(selectClasses.label, "flex-1 ml-[10px]")}>
              Token
              <div class={selectClasses.container}>
                <TokenIcon asset={assetRef} size={38} />
                <div class="flex items-center">
                  <div class="mr-2 uppercase">{importParams.symbol}</div>
                  <AssetIcon icon="interactive/chevron-down" class="w-5 h-5" />
                </div>
                <select
                  class={selectClasses.select}
                  value={importParams.symbol}
                  onChange={(e) =>
                    (importParams.symbol = (e.target as HTMLSelectElement)?.value)
                  }
                >
                  {pickableTokensRef.value.map((token) => (
                    <option value={token.asset.symbol}>
                      {token.asset.symbol.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </label>
            <TokenSelectDropdown
              onCloseIntent={() => {
                selectIsOpen.value = false;
              }}
              onSelectAsset={(asset) => {
                selectIsOpen.value = false;
                importParams.symbol = asset.symbol;
              }}
              active={selectIsOpen}
            />
          </div>

          <div class="h-[40px] flex items-end justify-end">
            {!!tokenRef.value && (
              <span
                class="text-sm opacity-50 hover:text-accent-base cursor-pointer"
                onClick={handleSetMax}
              >
                Balance: {formatAssetAmount(tokenRef.value?.amount)}
              </span>
            )}
          </div>

          <Input.Base
            type="number"
            min="0"
            style={{
              textAlign: "right",
            }}
            startContent={
              !!tokenRef.value && (
                <Button.Pill class="z-[1]" onClick={handleSetMax}>
                  MAX
                </Button.Pill>
              )
            }
            onInput={(e) => {
              const value = (e.target as HTMLInputElement).value;
              if (isNaN(parseFloat(value))) {
                importParams.amount = "";
              } else {
                importParams.amount = value;
              }
            }}
            value={importParams.amount}
          />
        </section>

        <section class="bg-gray-base p-4 rounded mt-[10px]">
          <div class="text-white">Sifchain Recipient Address</div>
          <div class="relative border h-[54px] border-solid border-white bg-gray-input">
            <input
              readonly
              value={store.wallet.sif.address}
              class="absolute top-0 left-0 w-full h-full bg-transparent p-[16px] font-mono outline-none"
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
      </>
    );
  },
});
