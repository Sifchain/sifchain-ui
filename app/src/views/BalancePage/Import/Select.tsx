import { defineComponent, ref, computed } from "vue";
import { useRouter } from "vue-router";
import { AssetAmount, Network, toBaseUnits, format } from "@sifchain/sdk";

import { importStore } from "~/store/modules/import";
import { accountStore } from "~/store/modules/accounts";

import Modal from "~/components/Modal";
import AssetIcon, { IconName } from "~/components/AssetIcon";
import { formatAssetAmount } from "~/components/utils";
import {
  SelectDropdown,
  SelectDropdownOption,
} from "~/components/SelectDropdown";
import { useCore } from "~/hooks/useCore";
import { getMaxAmount } from "~/views/utils/getMaxAmount";
import { Input } from "~/components/Input/Input";
import { Button } from "~/components/Button/Button";
import { getImportLocation, useImportData } from "./useImportData";
import { TokenSelectDropdown } from "~/components/TokenSelectDropdown";
import { useAppWalletPicker } from "~/hooks/useAppWalletPicker";
import { useManagedInputValueRef } from "~/hooks/useManagedInputValueRef";
import { useChains } from "~/hooks/useChains";
import { TokenNetworkIcon } from "~/components/TokenNetworkIcon/TokenNetworkIcon";

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
      const chain = useChains().get(importDraft.value.network);
      if (chain.chainConfig.underMaintenance) {
        return `${chain.displayName} Connection Under Maintenance`;
      }
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
                getImportLocation("confirm", importStore.state.draft),
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

    const networkValue = importStore.refs.draft.network.computed();
    const amountValue = importStore.refs.draft.amount.computed();

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
          importStore.setDraft({
            amount: amount.lessThan("0")
              ? "0.0"
              : format(amount, tokenRef.value.asset),
          });
        } else {
          importStore.setDraft({
            amount: format(tokenRef.value.amount.amount, tokenRef.value.asset),
          });
        }
      } else {
        importStore.setDraft({
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
        <section class="bg-gray-base rounded p-4">
          <div class="w-full">
            <div class="flex w-full">
              <div class="mr-[5px] block flex-1">
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
                    class="relative mt-[10px] w-full pl-[16px] capitalize"
                    active={networkOpenRef.value}
                  >
                    {useChains().get(networkValue.value).displayName}
                  </Button.Select>
                </SelectDropdown>
              </div>
              <div class="ml-[5px] block flex-1">
                Token
                <Button.Select
                  class="mt-[10px] w-full"
                  active={selectIsOpen.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectIsOpen.value = !selectIsOpen.value;
                  }}
                >
                  <div class="flex items-center justify-between">
                    <TokenNetworkIcon
                      size={38}
                      key={boundAsset.value?.symbol || ""}
                      asset={boundAsset}
                    />
                    <div class="ml-[8px] font-sans text-[18px] font-medium uppercase text-white">
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

          <div class="flex h-[40px] items-end justify-end">
            {!!tokenRef.value && (
              <span
                class="hover:text-accent-base flex cursor-pointer items-center text-base opacity-50"
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
              Boolean(tokenRef.value) ? (
                <Button.Pill class="z-[1]" onClick={handleSetMax}>
                  MAX
                </Button.Pill>
              ) : null
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

        <section class="bg-gray-base mt-[10px] rounded p-4">
          <div class="text-white">Sifchain Recipient Address</div>
          <div class="border-gray-input_outline bg-gray-input relative mt-[10px] h-[54px] rounded border border-solid focus-within:border-white">
            <input
              readonly
              value={store.wallet.get(Network.SIFCHAIN).address}
              class="text-md absolute top-0 left-0 h-full w-full bg-transparent p-[16px] font-mono outline-none"
              onClick={(e) => {
                (e.target as HTMLInputElement).setSelectionRange(0, 99999999);
              }}
            />
          </div>
        </section>

        <Button.CallToAction
          {...buttonRef.value.props}
          class="mt-[10px]"
          disabled={networkValue.value === "ethereum"}
        >
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
