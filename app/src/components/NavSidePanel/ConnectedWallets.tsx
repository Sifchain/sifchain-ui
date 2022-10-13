import { defineComponent } from "vue";

import { accountStore } from "~/store/modules/accounts";
import { useAppWalletPicker } from "~/hooks/useAppWalletPicker";
import { formatAssetAmount } from "~/components/utils";
import Tooltip, { TooltipInstance } from "~/components/Tooltip";
import WalletPicker from "~/components/WalletPicker/WalletPicker";

import NavSidePanelItem from "./NavSidePanelItem";
import AssetIcon from "../AssetIcon";

export default defineComponent({
  name: "ConnectedWallets",
  setup() {
    const appWalletPicker = useAppWalletPicker();

    const connectedNetworkCount =
      accountStore.refs.connectedNetworkCount.computed();

    return () => (
      <Tooltip
        placement="top-start"
        animation="scale"
        arrow={false}
        trigger="click"
        interactive
        offset={[20, 0]}
        onShow={() => {
          appWalletPicker.isOpen.value = true;
        }}
        onHide={() => {
          appWalletPicker.isOpen.value = false;
        }}
        onMount={(instance: TooltipInstance) => {
          instance.popper
            .querySelector(".tippy-box")
            ?.classList.add("!origin-bottom-left");
        }}
        appendTo={() => document.body}
        content={<WalletPicker />}
        ref={appWalletPicker.ref}
      >
        <NavSidePanelItem
          icon="interactive/wallet"
          displayName={
            connectedNetworkCount.value === 0 ? (
              "Connect Wallets"
            ) : accountStore.getters.isConnecting ? (
              "Connecting..."
            ) : (
              <>
                <div>Connected Wallets</div>
                <div class="mt-[-2px] w-full text-left text-sm font-semibold opacity-50">
                  {!accountStore.state.sifchain.connecting &&
                    accountStore.state.sifchain.hasLoadedBalancesOnce && (
                      <>
                        {accountStore.state.sifchain.balances
                          .filter(
                            // does not have rowan
                            (b) => b.asset.symbol.includes("rowan"),
                          )
                          .map((asset) => {
                            const formatted = formatAssetAmount(asset);
                            if (formatted.length > 6) {
                              return Intl.NumberFormat("en", {
                                notation: "compact",
                              }).format(+formatted);
                            }
                          })[0] || 0}{" "}
                        ROWAN
                      </>
                    )}
                </div>
              </>
            )
          }
          class={["mt-0", appWalletPicker.isOpen.value && "bg-gray-200"]}
          action={
            connectedNetworkCount.value === 0 ? (
              <AssetIcon
                icon="interactive/chevron-down"
                style={{
                  transform: "rotate(-90deg)",
                }}
                class="h-[20px] w-[20px]"
              />
            ) : accountStore.getters.isConnecting ? (
              <div class="flex flex-1 justify-end">
                <AssetIcon
                  icon="interactive/anim-racetrack-spinner"
                  size={20}
                  class="flex-shrink-0"
                />
              </div>
            ) : (
              <div class="border-connected-base text-connected-base ml-auto flex h-[20px] w-[20px] flex-shrink-0 items-center justify-center rounded-full border border-solid">
                {connectedNetworkCount.value}
              </div>
            )
          }
        />
      </Tooltip>
    );
  },
});
