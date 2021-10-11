import { defineComponent, ref, computed, watch } from "vue";
import Modal from "@/components/Modal";
import AssetIcon, { IconName } from "@/components/AssetIcon";
import { formatAssetAmount } from "@/componentsLegacy/shared/utils";
import { AssetAmount, Network, toBaseUnits } from "@sifchain/sdk";
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
import { getImportLocation, useImportData } from "./useImportData";
import { TokenSelectDropdown } from "@/components/TokenSelectDropdown";
import { useAppWalletPicker } from "@/hooks/useAppWalletPicker";
import { useRouter } from "vue-router";
import { rootStore } from "../../../store";
import { importStore } from "@/store/modules/import";
import { useManagedInputValueRef } from "@/hooks/useManagedInputValueRef";
import { accountStore } from "@/store/modules/accounts";
import { useChains } from "@/hooks/useChains";

export default defineComponent({
  name: "ImportSelect",

  setup() {
    const { store, services } = useCore();
    const appWalletPicker = useAppWalletPicker();
    const selectIsOpen = ref(false);
    const router = useRouter();

    const {
      tokenRef,
      computedImportAssetAmount,
      networksRef,
      chainsRef,
      importDraft,
      exitImport,
      networkBalances,
    } = useImportData();

    const inputRef = useManagedInputValueRef(
      computed(() =>
        parseFloat(importDraft.value.amount) === 0
          ? ""
          : importDraft.value.amount,
      ),
    );

    const validationErrorRef = computed(() => {
      if (!tokenRef.value) {
        return "Select Token";
      }
      if (tokenRef.value.asset.decommissioned) {
        return `Import Not Allowed for ${tokenRef.value.asset.displaySymbol}`;
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
          condition: !accountStore.state.sifchain.connected,
          name: "Connect Sifchain Wallet",
          icon: "interactive/arrows-in" as IconName,
          props: {
            disabled: false,
            onClick: () => {
              appWalletPicker.show();
              accountStore.load(Network.SIFCHAIN);
            },
          },
        },
        {
          condition:
            tokenRef.value &&
            !accountStore.state[tokenRef.value.asset.network].connected,
          name: `Connect ${
            tokenRef.value &&
            useChains().get(tokenRef.value.asset.network).displayName
          } Wallet`,
          icon: "interactive/arrows-in" as IconName,
          props: {
            onClick: () => {
              appWalletPicker.show();
              if (tokenRef.value)
                accountStore.load(tokenRef.value.asset.network);
            },
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

    const createChainSortParam = (network: Network) => {
      // sort by type, then by network, so types are grouped together
      // should probably have some grouping mechanism in the selection dropdown in the future
      return services.chains.get(network).chainConfig.chainType + network;
    };
    const optionsRef = computed<SelectDropdownOption[]>(
      () =>
        networksRef.value
          ?.map((network) => ({
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

    const networkValue = rootStore.import.refs.draft.network.computed();
    const amountValue = rootStore.import.refs.draft.amount.computed();

    const handleSetMax = async () => {
      if (!tokenRef.value) return;
      const chain = useChains().get(networkValue.value);
      if (chain.chainConfig.chainType === "ibc") {
        const gasAssetAmount = AssetAmount(
          chain.nativeAsset,
          toBaseUnits("0.1", chain.nativeAsset),
        );
        if (tokenRef.value.asset.symbol === chain.nativeAsset.symbol) {
          const amount = tokenRef.value.amount.subtract(gasAssetAmount);
          console.log({
            amount: amount.toString(),
            balance: tokenRef.value.amount.toString(),
            fee: gasAssetAmount.toString(),
          });
          rootStore.import.setDraft({
            amount: amount.lessThan("0")
              ? "0.0"
              : format(amount, tokenRef.value.asset),
          });
        } else {
          rootStore.import.setDraft({
            amount: format(tokenRef.value.amount.amount, tokenRef.value.asset),
          });
        }
      } else {
        rootStore.import.setDraft({
          amount: format(
            getMaxAmount(
              ref(tokenRef.value.asset.symbol),
              tokenRef.value.amount,
            ),
            tokenRef.value.asset,
          ),
        });
      }
    };
    const boundAsset = computed(() => tokenRef.value?.asset);

    const networkBalanceEntry = computed(() =>
      networkBalances.data.value.find(
        (v) => v.symbol === tokenRef.value?.asset.symbol,
      ),
    );

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
                  key={optionsRef.value.map((o) => o.value).join("")}
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
                    {useChains().get(networkValue.value).displayName}
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
                      key={boundAsset.value?.symbol || ""}
                      asset={boundAsset}
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
                  symbol: asset.symbol,
                });
              }}
              active={selectIsOpen}
            />
          </div>

          <div class="h-[40px] flex items-end justify-end">
            {!!tokenRef.value && (
              <span
                class="text-base opacity-50 hover:text-accent-base cursor-pointer flex items-center"
                onClick={handleSetMax}
              >
                Balance:{" "}
                {!networkBalances.hasLoaded.value ? (
                  <AssetIcon
                    icon="interactive/anim-racetrack-spinner"
                    class="ml-[4px] mt-[2px]"
                    size={16}
                  />
                ) : networkBalanceEntry.value ? (
                  formatAssetAmount(networkBalanceEntry.value)
                ) : (
                  "0"
                )}
              </span>
            )}
          </div>

          <Input.Base
            inputRef={inputRef}
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
              value={store.wallet.get(Network.SIFCHAIN).address}
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
