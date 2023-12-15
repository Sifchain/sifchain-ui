import { computed, defineComponent, ref, Ref } from "vue";

import { Amount, format, Network } from "@sifchain/sdk";

import { accountStore } from "~/store/modules/accounts";
import { exportStore } from "~/store/modules/export";
import { useAppWalletPicker } from "~/hooks/useAppWalletPicker";
import { useChains } from "~/hooks/useChains";
import { useCore } from "~/hooks/useCore";
import { useManagedInputValueRef } from "~/hooks/useManagedInputValueRef";
import { getMaxAmount } from "~/views/utils/getMaxAmount";
import AssetIcon, { IconName } from "~/components/AssetIcon";
import Modal from "~/components/Modal";
import { formatAssetAmount } from "~/components/utils";
import { Button } from "~/components/Button/Button";
import { Form } from "~/components/Form";
import { Input } from "~/components/Input/Input";
import {
  SelectDropdown,
  SelectDropdownOption,
} from "~/components/SelectDropdown";
import router from "~/router";
import { getExportLocation, useExportData } from "./useExportData";

export default defineComponent({
  name: "ExportSelect",
  props: {},
  setup(props) {
    const { store, services } = useCore();
    const exportData = useExportData();
    const walletPicker = useAppWalletPicker();

    const {
      networksRef,
      exportTokenRef,
      computedExportAssetAmount,
      feeAmountRef,
      feeAssetBalanceRef,
    } = exportData;
    const exportParams = exportStore.refs.draft.computed();
    const networkRef = computed(() => exportParams.value.network);

    // If given amount is 0, show blank in input. Otherwise, show amount.
    const inputRef = useManagedInputValueRef(
      computed(() =>
        parseFloat(exportParams.value.amount) === 0
          ? ""
          : exportParams.value.amount,
      ),
    );

    const handleSetMax = () => {
      if (!exportTokenRef.value) return;
      let maxAmount = getMaxAmount(
        { value: exportTokenRef.value?.asset.symbol } as Ref,
        exportTokenRef.value?.amount,
      );
      if (
        feeAmountRef.value?.asset.symbol === exportTokenRef.value.asset.symbol
      ) {
        maxAmount = maxAmount.subtract(feeAmountRef.value?.amount.toString());
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
      const chain = useChains().get(exportStore.state.draft.network);
      if (chain.chainConfig.underMaintenance) {
        return `${chain.displayName} Connection Under Maintenance`;
      }

      if (!exportTokenRef.value) {
        return "Select Token";
      }

      if (
        feeAssetBalanceRef.value &&
        feeAmountRef.value &&
        computedExportAssetAmount.value &&
        feeAmountRef.value.asset.symbol === exportTokenRef.value?.asset.symbol
      ) {
        const totalAmount = computedExportAssetAmount.value.add(
          feeAmountRef.value,
        );
        if (totalAmount.greaterThan(feeAssetBalanceRef.value)) {
          return `Not enough ${feeAmountRef.value.displaySymbol.toUpperCase()} for Export Amount plus Fee`;
        }
      }

      if (
        feeAmountRef.value?.amount.greaterThan("0") &&
        (!feeAssetBalanceRef.value ||
          feeAssetBalanceRef.value?.amount.lessThan(feeAmountRef.value))
      ) {
        return `Not enough ${feeAmountRef.value.displaySymbol.toUpperCase()} for ${formatAssetAmount(
          feeAmountRef.value,
        )} ${feeAmountRef.value.symbol.toUpperCase()} fee`;
      }
      if (!computedExportAssetAmount.value) {
        return "Enter Amount";
      }
      if (computedExportAssetAmount.value?.lessThanOrEqual("0.0")) {
        return "Enter Amount";
      }

      if (
        exportTokenRef.value &&
        computedExportAssetAmount.value?.greaterThan(
          exportTokenRef.value.amount,
        )
      ) {
        return "Amount Too Large";
      }

      return null;
    });

    const buttonRef = computed(() => {
      const buttons = [
        {
          condition: !store.wallet.get(Network.SIFCHAIN).isConnected,
          name: "Connect Sifchain Wallet",
          icon: "interactive/arrows-in" as IconName,
          props: {
            disabled: false,
            onClick: () => {
              walletPicker.show();
              accountStore.load(Network.SIFCHAIN);
            },
          },
        },
        {
          condition: !accountStore.state[networkRef.value].connected,
          name: `Connect ${
            useChains().get(networkRef.value).displayName
          } Wallet`,
          icon: "interactive/arrows-in" as IconName,
          props: {
            onClick: () => {
              walletPicker.show();
              accountStore.load(networkRef.value);
            },
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

    const createChainSortParam = (network: Network) => {
      // sort by type, then by network, so types are grouped together
      // should probably have some grouping mechanism in the selection dropdown in the future
      return services.chains.get(network).chainConfig.chainType + network;
    };
    const optionsRef = computed<SelectDropdownOption[]>(
      () =>
        networksRef.value
          .map((network) => ({
            content: useChains().get(network).displayName,
            value: network,
          }))
          .sort((a, b) =>
            createChainSortParam(a.value).localeCompare(
              createChainSortParam(b.value),
            ),
          ) || [],
    );
    const networkOpenRef = ref(false);
    const targetAddressRef = accountStore.computed(
      (s) => s.state[exportParams.value.network].address,
    );

    const exportNetworkButton = (
      <Button.Select
        style={{
          pointerEvents: optionsRef.value.length === 1 ? "none" : "auto",
        }}
        class="relative mt-[10px] w-full pl-[16px] capitalize"
        active={networkOpenRef.value}
      >
        {useChains().get(exportParams.value.network).displayName}
      </Button.Select>
    );

    return () => (
      <Modal
        heading={exportData.headingRef.value}
        icon="interactive/arrow-up"
        onClose={exportData.exitExport}
        showClose
      >
        <section class="bg-gray-base rounded p-4">
          <label
            for="exportAmount"
            class={"relative flex items-center justify-between"}
          >
            <span>Amount</span>
            {Boolean(exportTokenRef.value) && (
              <span
                class="hover:text-accent-base cursor-pointer self-end text-base opacity-50"
                onClick={handleSetMax}
              >
                Balance:{" "}
                {exportTokenRef.value?.amount
                  ? formatAssetAmount(exportTokenRef.value?.amount)
                  : "0"}
              </span>
            )}
          </label>

          <Input.Base
            inputRef={inputRef}
            containerClass="mt-[10px]"
            startContent={
              exportTokenRef.value ? (
                <Button.Pill onClick={handleSetMax}>MAX</Button.Pill>
              ) : null
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
          />

          <div class="mt-[10px] block">
            Network
            <SelectDropdown
              key={optionsRef.value.map((o) => o.value).join("")}
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
              {exportNetworkButton}
            </SelectDropdown>
          </div>
        </section>

        <section class="bg-gray-base mt-[10px] rounded p-4">
          <Form.Details details={exportData.detailsRef.value} />
        </section>

        <section class="bg-gray-base mt-[10px] rounded p-4">
          <div class="capitalize text-white">
            {exportParams.value.network} Recipient Address
          </div>
          <div class="border-gray-input_outline bg-gray-input relative mt-[10px] h-[54px] rounded border border-solid focus-within:border-white">
            <input
              readonly
              value={targetAddressRef.value}
              class="text-md absolute top-0 left-0 h-full w-full bg-transparent p-[16px] font-mono outline-none"
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
              class="mr-[4px] h-[20px] w-[20px]"
            />
          )}{" "}
          {buttonRef.value.name}
        </Button.CallToAction>
      </Modal>
    );
  },
});
