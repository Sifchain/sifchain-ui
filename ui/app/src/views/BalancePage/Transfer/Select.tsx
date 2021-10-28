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
import { getTransferLocation, useTransferData } from "./useTransferData";
import { Form } from "@/components/Form";
import { useAppWalletPicker } from "@/hooks/useAppWalletPicker";
import { rootStore } from "@/store";
import { transferStore } from "@/store/modules/transfer";
import { useManagedInputValueRef } from "@/hooks/useManagedInputValueRef";
import { effect } from "@vue/reactivity";
import { accountStore } from "@/store/modules/accounts";
import { useChains } from "@/hooks/useChains";

export default defineComponent({
  name: "TransferSelect",
  props: {},
  setup(props) {
    const { store, services } = useCore();
    const exportData = useTransferData();
    const walletPicker = useAppWalletPicker();

    const {
      exportTokenRef,
      computedTransferAssetAmount,
      feeAmountRef,
      feeAssetBalanceRef,
    } = exportData;
    const exportParams = transferStore.refs.draft.computed();
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
        maxAmount = maxAmount.subtract(feeAmountRef.value.amount.toString());
      }
      if (maxAmount.lessThan("0")) {
        maxAmount = Amount("0.0");
      }
      transferStore.setDraft({
        amount: format(maxAmount, exportTokenRef.value.asset, {
          mantissa: exportTokenRef.value.asset.decimals,
          trimMantissa: true,
        }),
      });
    };

    const validationErrorRef = computed(() => {
      if (!exportTokenRef.value) {
        ("Select Token");
      }
      if (
        feeAssetBalanceRef.value &&
        feeAmountRef.value &&
        computedTransferAssetAmount.value &&
        feeAmountRef.value.asset.symbol === exportTokenRef.value?.asset.symbol
      ) {
        const totalAmount = computedTransferAssetAmount.value.add(
          feeAmountRef.value,
        );
        if (totalAmount.greaterThan(feeAssetBalanceRef.value)) {
          return `Not enough ${feeAmountRef.value.displaySymbol.toUpperCase()} for Transfer Amount plus Fee`;
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
      if (!computedTransferAssetAmount.value) {
        return "Enter Amount";
      }
      if (computedTransferAssetAmount.value?.lessThanOrEqual("0.0")) {
        return "Enter Amount";
      }

      if (
        exportTokenRef.value &&
        computedTransferAssetAmount.value?.greaterThan(
          exportTokenRef.value.amount,
        )
      ) {
        return "Amount Too Large";
      }
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
          name: validationErrorRef.value || "Transfer",
          icon: null,
          props: {
            disabled: !!validationErrorRef.value,
            onClick: () => {
              const exportLocation = getTransferLocation(
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

    const networkOpenRef = ref(false);
    const targetAddressRef = transferStore.computed(
      (s) => s.state.draft.toAddress,
    );

    return () => (
      <Modal
        heading={exportData.headingRef.value}
        icon="interactive/arrow-up"
        onClose={exportData.exitTransfer}
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
            inputRef={inputRef}
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
                transferStore.setDraft({
                  amount: "",
                });
              } else {
                transferStore.setDraft({
                  amount: value,
                });
              }
            }}
          />
        </section>

        <section class="bg-gray-base p-4 rounded mt-[10px]">
          <Form.Details details={exportData.detailsRef.value} />
        </section>

        <section class="bg-gray-base p-4 rounded mt-[10px]">
          <div class="text-white capitalize">Recipient Address</div>
          <div class="relative border h-[54px] rounded border-solid border-gray-input_outline focus-within:border-white bg-gray-input mt-[10px]">
            <input
              required
              value={targetAddressRef.value}
              onChange={(e) => {
                transferStore.setDraft({
                  // @ts-ignore
                  toAddress: e.currentTarget.value,
                });
              }}
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
