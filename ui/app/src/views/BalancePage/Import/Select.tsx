import {
  defineComponent,
  ref,
  computed,
  PropType,
  Ref,
  watch,
  proxyRefs,
  toRefs,
  readonly,
} from "vue";
import Modal from "@/components/Modal";
import AssetIcon, { IconName } from "@/components/AssetIcon";
import { formatAssetAmount } from "@/componentsLegacy/shared/utils";
import { Network } from "@sifchain/sdk";
import {
  SelectDropdown,
  SelectDropdownOption,
} from "@/components/SelectDropdown";
import { useCore } from "@/hooks/useCore";
import { TokenIcon } from "@/components/TokenIcon";
import { format } from "@sifchain/sdk/src/utils/format";
import { getMaxAmount } from "@/views/utils/getMaxAmount";
import { Input } from "@/components/Input/Input";
import { Button } from "@/components/Button/Button";
import router from "@/router";
import { getImportLocation, useImportData } from "./useImportData";
import { TokenSelectDropdown } from "@/components/TokenSelectDropdown";
import { useAppWalletPicker } from "@/hooks/useAppWalletPicker";
import { useRouter } from "vue-router";
import { rootStore } from "../../../store";
import { importStore } from "@/store/modules/import";

export default defineComponent({
  name: "ImportSelect",

  setup(props) {
    // return <div></div>;

    const { store } = useCore();
    const appWalletPicker = useAppWalletPicker();

    const selectIsOpen = ref(false);

    const {
      tokenRef,
      computedImportAssetAmount,
      networksRef,
      importDraft,
      exitImport,
    } = useImportData();
    const router = useRouter();

    const validationErrorRef = computed(() => {
      if (!tokenRef.value) {
        return "Select Token";
      }

      if (!computedImportAssetAmount.value) {
        return "Enter Amount";
      }
      if (computedImportAssetAmount.value?.lessThanOrEqual("0.0")) {
        return "Enter Amount";
      }
      if (
        computedImportAssetAmount.value?.amount.greaterThan(
          tokenRef.value?.amount,
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
            onClick: () => appWalletPicker.show(),
          },
        },
        {
          condition:
            importDraft.value.network === Network.ETHEREUM &&
            !store.wallet.eth.isConnected,
          name: "Connect Ethereum Wallet",
          icon: "interactive/arrows-in" as IconName,
          props: {
            onClick: () => appWalletPicker.show(),
          },
        },
        {
          condition: true,
          name: validationErrorRef.value || "Import",
          icon: null,
          props: {
            disabled: !!validationErrorRef.value,
            onClick: () => {
              router.replace(
                getImportLocation("confirm", rootStore.import.state.draft),
              );
            },
          },
        },
      ];
      return buttons.find((item) => item.condition) || buttons[0];
    });

    const optionsRef = computed<SelectDropdownOption[]>(
      () =>
        networksRef.value?.map((network) => ({
          content: <div class="capitalize">{network}</div>,
          value: network,
        })) || [],
    );
    const networkOpenRef = ref(false);

    const networkValue = rootStore.import.refs.draft.network.computed();
    const draftVal = importStore.refs.draft.computed();
    const selectedTokenBalance = rootStore.accounts.computed((s) =>
      s.state[networkValue.value].balances.find(
        (bal) => bal.asset.displaySymbol === draftVal.value.displaySymbol,
      ),
    );

    const amountValue = rootStore.import.refs.draft.amount.computed();

    const handleSetMax = () => {
      if (tokenRef.value && selectedTokenBalance.value?.amount) {
        rootStore.import.setDraft({
          amount: format(
            selectedTokenBalance.value?.amount,
            selectedTokenBalance.value?.asset,
            {
              mantissa: selectedTokenBalance.value?.decimals,
              trimMantissa: true,
            },
          ),
        });
      }
    };
    return () => (
      <Modal
        heading="Import Token to Sifchain"
        icon="interactive/arrow-down"
        onClose={exitImport}
        showClose
      >
        <section class="bg-gray-base p-4 rounded">
          <div class="w-full">
            <div class="flex w-full">
              <div class="block flex-1 mr-[5px]">
                Network
                <SelectDropdown
                  options={optionsRef}
                  value={networkValue}
                  onChangeValue={(value) => {
                    if (importDraft.value.network)
                      importStore.setDraft({
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
                    {networkValue.value}
                  </Button.Select>
                </SelectDropdown>
              </div>
              <div class="block flex-1 ml-[5px]">
                Token
                <Button.Select
                  class="w-full mt-[10px]"
                  active={selectIsOpen.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectIsOpen.value = !selectIsOpen.value;
                  }}
                >
                  <div class="flex justify-between items-center">
                    <TokenIcon
                      size={38}
                      assetValue={tokenRef.value?.asset}
                    ></TokenIcon>
                    <div class="font-sans ml-[8px] text-[18px] font-medium text-white uppercase">
                      {tokenRef.value?.asset?.displaySymbol ||
                        tokenRef.value?.asset?.symbol}
                    </div>
                  </div>
                </Button.Select>
              </div>
            </div>

            <TokenSelectDropdown
              sortBy="balance"
              network={networkValue}
              onCloseIntent={() => {
                selectIsOpen.value = false;
              }}
              onSelectAsset={(asset) => {
                selectIsOpen.value = false;
                importStore.setDraft({
                  displaySymbol: asset.displaySymbol || asset.symbol,
                });
              }}
              active={selectIsOpen}
            />
          </div>

          <div class="h-[40px] flex items-end justify-end">
            {!!tokenRef.value && (
              <span
                class="text-base opacity-50 hover:text-accent-base cursor-pointer"
                onClick={handleSetMax}
              >
                Balance:{" "}
                {(selectedTokenBalance.value &&
                  formatAssetAmount(selectedTokenBalance.value)) ??
                  "0"}
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
                importStore.setDraft({
                  amount: "",
                });
              } else {
                importStore.setDraft({
                  amount: value,
                });
              }
            }}
            value={amountValue.value}
          />
        </section>

        <section class="bg-gray-base p-4 rounded mt-[10px]">
          <div class="text-white">Sifchain Recipient Address</div>
          <div class="relative border h-[54px] rounded border-solid border-gray-input_outline focus-within:border-white bg-gray-input mt-[10px]">
            <input
              readonly
              value={store.wallet.sif.address}
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
