import { defineComponent, ref, computed, PropType, ComputedRef } from "vue";
import { useRouter } from "vue-router";
import { AssetAmount, Network, toBaseUnits } from "@sifchain/sdk";

import Modal from "@/components/Modal";
import AssetIcon, { IconName } from "@/components/AssetIcon";
import { formatAssetAmount } from "@/componentsLegacy/shared/utils";
import {
  SelectDropdown,
  SelectDropdownOption,
} from "@/components/SelectDropdown";
import { useCore } from "@/hooks/useCore";
import { format } from "@sifchain/sdk/src/utils/format";
import { getMaxAmount } from "@/views/utils/getMaxAmount";
import { Input } from "@/components/Input/Input";
import { Button } from "@/components/Button/Button";
import { TokenSelectDropdown } from "@/components/TokenSelectDropdown";
import { useAppWalletPicker } from "@/hooks/useAppWalletPicker";
import { rootStore } from "@/store";
import { ImportDraft, importStore } from "@/store/modules/import";
import { useManagedInputValueRef } from "@/hooks/useManagedInputValueRef";
import { accountStore } from "@/store/modules/accounts";
import { useChains } from "@/hooks/useChains";
import { TokenNetworkIcon } from "@/components/TokenNetworkIcon/TokenNetworkIcon";
import { TokenListItem, useToken } from "@/hooks/useToken";

import { getImportLocation, useImportData } from "../useImportDataV2";

const MAX_ASSETS = 4;

export default defineComponent({
  name: "ImportSelect",

  setup() {
    const { store, services } = useCore();
    const appWalletPicker = useAppWalletPicker();
    const router = useRouter();

    const {
      computedImportAssetAmount,
      tokenRef,
      networksRef,
      importDrafts,
      networkBalances,
      tokenListRef,
      exitImport,
    } = useImportData();

    const firstDraft = computed(() => importDrafts.value[0]);

    const balanceAssetsRef = computed(() =>
      importDrafts.value.map((importDraft, i, drafts) => ({
        importDraft,
        token: useToken({
          network: computed(() => importDraft.network),
          symbol: computed(() => importDraft.symbol),
        }),
        hiddenTokens: i > 0 ? drafts.map((x) => x.symbol) : [],
      })),
    );

    const selectedNetwork = computed(() => firstDraft.value.network);

    const validationErrorRef = computed(() => {
      const chain = useChains().get(selectedNetwork.value);
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
                getImportLocation("confirm", rootStore.import.state.draft),
              );
            },
          },
        },
      ];
      return buttons.find((item) => item.condition) || buttons[0];
    });

    const hiddenTokenSymbols = computed(() =>
      importDrafts.value.map((x) => x.symbol),
    );
    const isHidden = (symbol: string) =>
      hiddenTokenSymbols.value.includes(symbol);

    const handleAddAssetDraft = () => {
      const previous = importDrafts.value[importDrafts.value.length - 1];

      const nextTokenSymbol =
        networkBalances.data.value.find((x) => !isHidden(x.symbol))?.symbol ??
        tokenListRef.value.find((x) => !isHidden(x.asset.symbol))?.asset.symbol;

      importDrafts.value.push({
        ...previous,
        amount: "0.0",
        symbol: nextTokenSymbol ?? "",
      });
    };

    const handleDeleteBalanceDraft = (index: number) => {
      importDrafts.value.splice(index, 1);
    };

    const createChainSortParam = (network: Network) => {
      // sort by type, then by network, so types are grouped together
      // should probably have some grouping mechanism in the selection dropdown in the future
      return services.chains.get(network).chainConfig.chainType + network;
    };

    const networkOptionsRef = computed<SelectDropdownOption[]>(() =>
      (networksRef.value ?? [])
        .map((network) => ({
          content: useChains().get(network).displayName,
          value: network,
        }))
        .sort((a, b) =>
          createChainSortParam(a.value).localeCompare(
            createChainSortParam(b.value),
          ),
        ),
    );

    return () => (
      <Modal
        heading="Import Token to Sifchain"
        icon="interactive/arrow-down"
        onClose={exitImport}
        showClose
      >
        <div class="grid gap-2">
          {balanceAssetsRef.value.map((asset, i) => {
            return (
              <BalanceSelector
                key={`${asset.importDraft.network}-${asset.importDraft.symbol}-${i}`}
                networkDisabled={i !== 0}
                network={asset.importDraft.network}
                onDelete={handleDeleteBalanceDraft.bind(null, i)}
                importDraft={asset.importDraft}
                networkOptionsRef={networkOptionsRef}
                tokenRef={asset.token}
                amount={asset.importDraft.amount}
                hiddenTokens={asset.hiddenTokens}
                index={i}
              />
            );
          })}
          <Button.CallToActionSecondary
            disabled={importDrafts.value.length >= MAX_ASSETS}
            onClick={handleAddAssetDraft}
          >
            + Add another asset
          </Button.CallToActionSecondary>
          <section class="bg-gray-base p-4 rounded">
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
          <Button.CallToAction {...buttonRef.value.props}>
            {!!buttonRef.value.icon && (
              <AssetIcon
                icon={buttonRef.value.icon}
                class="w-[20px] h-[20px] mr-[4px]"
              />
            )}{" "}
            {buttonRef.value.name}
          </Button.CallToAction>
        </div>
      </Modal>
    );
  },
});

const BalanceSelector = defineComponent({
  props: {
    networkDisabled: {
      type: Boolean,
      default: false,
    },
    network: {
      type: Object as PropType<Network>,
      default: Network.ETHEREUM,
    },
    amount: {
      type: String,
    },
    onDelete: {
      type: Function as PropType<() => void>,
      default: () => {},
    },
    importDraft: {
      type: Object as PropType<ImportDraft>,
    },
    networkOptionsRef: {
      type: Object as PropType<ComputedRef<SelectDropdownOption[]>>,
      default: [],
    },
    tokenRef: {
      type: Object as PropType<ComputedRef<TokenListItem | undefined>>,
      default: ref(undefined),
    },
    hiddenTokens: {
      type: Array as PropType<string[]>,
      default: [],
    },
    index: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const selectIsOpen = ref(false);

    const { networkBalances } = useImportData();

    const inputRef = useManagedInputValueRef(
      computed(() =>
        !props.importDraft || !parseFloat(props.importDraft?.amount ?? 0)
          ? ""
          : props.importDraft.amount,
      ),
    );

    const networkOpenRef = ref(false);

    const networkValue = computed(() => props.network);

    const token = computed(() => props.tokenRef.value);

    const boundAsset = computed(() => token.value?.asset);

    const handleSetMax = () => {
      if (!token.value) {
        return;
      }

      const chain = useChains().get(networkValue.value);

      if (chain.chainConfig.chainType === "ibc") {
        const gasAssetAmount = AssetAmount(
          chain.nativeAsset,
          toBaseUnits("0.1", chain.nativeAsset),
        );

        const isNativeToken =
          token.value.asset.symbol === chain.nativeAsset.symbol;

        const amount = isNativeToken
          ? token.value.amount.subtract(gasAssetAmount)
          : token.value.amount;

        rootStore.import.setDraftWithIndex({
          index: props.index,
          nextDraft: {
            amount: amount.lessThan("0")
              ? "0.0"
              : format(amount, token.value.asset),
          },
        });

        return;
      }

      // non-ibc flow
      const maxAmount = getMaxAmount(
        ref(token.value.asset.symbol),
        token.value.amount,
      );

      rootStore.import.setDraftWithIndex({
        index: props.index,
        nextDraft: {
          amount: format(maxAmount, token.value.asset),
        },
      });
    };

    const networkBalanceEntry = computed(() =>
      networkBalances.data.value.find(
        (v) => v.symbol === token.value?.asset.symbol,
      ),
    );

    const excludedSymbols = computed(() => props.hiddenTokens);

    return () => (
      <section class="bg-gray-base p-4 rounded relative animate-fade-in">
        {props.networkDisabled && (
          <button class="absolute top-0 right-0 p-2" onClick={props.onDelete}>
            <AssetIcon icon="interactive/close" size={22} />
          </button>
        )}
        <div class="w-full">
          <div class="grid grid-cols-2 gap-2">
            <div class="grid gap-1">
              <span>Network</span>
              <SelectDropdown
                key={props.networkOptionsRef.value.map((o) => o.value).join("")}
                options={props.networkOptionsRef}
                value={networkValue}
                onChangeValue={(value) => {
                  if (props.importDraft?.network)
                    importStore.setDraftWithIndex({
                      index: props.index,
                      nextDraft: {
                        network: value as Network,
                      },
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
                  class="w-full relative capitalize pl-[16px]"
                  active={networkOpenRef.value}
                  disabled={props.networkDisabled}
                >
                  {useChains().get(networkValue.value).displayName}
                </Button.Select>
              </SelectDropdown>
            </div>
            <div class="grid gap-1">
              <span>Token</span>
              <Button.Select
                active={selectIsOpen.value}
                onClick={(e) => {
                  e.stopPropagation();
                  selectIsOpen.value = !selectIsOpen.value;
                }}
              >
                <div class="flex justify-between items-center">
                  <TokenNetworkIcon
                    size={38}
                    key={boundAsset.value?.symbol || ""}
                    asset={boundAsset}
                  />
                  <div class="font-sans ml-[8px] text-[18px] font-medium text-white uppercase">
                    {boundAsset.value?.displaySymbol ||
                      boundAsset.value?.symbol}
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
            excludeSymbols={excludedSymbols.value}
            onSelectAsset={(asset) => {
              selectIsOpen.value = false;
              importStore.setDraftWithIndex({
                index: props.index,
                nextDraft: {
                  symbol: asset.symbol,
                },
              });
            }}
            active={selectIsOpen}
          />
        </div>

        <div class="h-[40px] flex items-end justify-end">
          {!!props.tokenRef.value && (
            <span
              class="text-base opacity-50 hover:text-accent-base cursor-pointer flex items-center pb-1"
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
          class="text-right"
          startContent={
            Boolean(token.value) ? (
              <Button.Pill class="z-[1]" onClick={handleSetMax}>
                MAX
              </Button.Pill>
            ) : null
          }
          onInput={(e) => {
            const value = (e.target as HTMLInputElement).value;
            importStore.setDraftWithIndex({
              index: props.index,
              nextDraft: {
                amount: isNaN(parseFloat(value)) ? "" : value,
              },
            });
          }}
          value={token.value?.amount.amount}
        />
      </section>
    );
  },
});
