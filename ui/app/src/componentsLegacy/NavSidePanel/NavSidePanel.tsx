import { defineComponent, ref } from "vue";
import { useCore } from "../../hooks/useCore";
import { computed } from "@vue/reactivity";
import Tooltip, { TooltipInstance } from "@/components/Tooltip";
import NavSidePanelItem from "./NavSidePanelItem";
import Logo from "@/assets/logo-large.svg";
import AssetIcon from "../utilities/AssetIcon";
import { prettyNumber } from "@/utils/prettyNumber";
import WalletPicker from "@/components/WalletPicker";
import { PoolStat, usePoolStats } from "@/hooks/usePoolStats";
import { useAppWalletPicker } from "@/hooks/useAppWalletPicker";

export default defineComponent({
  props: {},
  setup(props) {
    const { store, config } = useCore();
    const appWalletPicker = useAppWalletPicker();

    const poolStats = usePoolStats();
    const tvl = computed(() => {
      return poolStats.data.value?.poolData?.pools.reduce(
        (tvl: number, pool: PoolStat) => {
          return tvl + (parseFloat(pool.poolDepth) || 0) * 2;
        },
        0,
      );
    });
    const rowanPrice = computed(() => {
      return poolStats.data.value?.rowanUsd;
    });

    const connectedWalletCount = computed(
      () =>
        [store.wallet.eth.isConnected, store.wallet.sif.isConnected].filter(
          Boolean,
        ).length,
    );
    return () => (
      <div class="portrait:hidden overflow-y-scroll font-sans flex-row align-center justify-center container w-sidebar h-full z-10 bg-gray-base text-white fixed left-0 top-0 bottom-0">
        <div class="w-full h-full text-center flex flex-col flex-1 justify-between px-[10px]">
          <div class="top">
            <div class="mt-[38px] flex justify-center">
              <Logo class="w-[119px]" />
            </div>
            <div class="mt-[9.3vh]">
              <NavSidePanelItem
                displayName="Dashboard"
                icon="navigation/dashboard"
                routerLink="/dashboard"
                class="opacity-50 pointer-events-none"
                action={
                  <div class="py-[2px] px-[6px] text-[10px] text-info-base border-solid border-[1px] rounded-full border-info-base mr-[8px] justify-self-end">
                    Soon
                  </div>
                }
              />
              <NavSidePanelItem
                displayName="Swap"
                icon="navigation/swap"
                routerLink="/swap"
              />
              <NavSidePanelItem
                displayName="Balances"
                icon="navigation/balances"
                routerLink="/balances"
              />
              <NavSidePanelItem
                displayName="Pool"
                icon="navigation/pool"
                routerLink="/pool"
              />
              <NavSidePanelItem
                displayName="Pool Stats"
                icon="navigation/pool-stats"
                routerLink="/stats"
              />
              <NavSidePanelItem
                displayName="Stake"
                icon="navigation/stake"
                routerLink="/stake-delegate"
              />
              <NavSidePanelItem
                displayName="Documents"
                icon="navigation/documents"
                routerLink="/documents"
              />
              <NavSidePanelItem
                displayName="More"
                icon="navigation/more"
                routerLink="/more"
              />
            </div>
          </div>
          <div class="bottom">
            <div class="transition-all pl-[30px] w-full text-left">
              <span class="inline-flex items-center justify-center h-[26px] font-medium text-[10px] text-info-base px-[10px] border border-solid border-info-base rounded-full">
                TVL: {tvl.value ? `$${prettyNumber(tvl.value)}` : "..."}
              </span>
              <div />
              <span class="inline-flex items-center justify-center h-[26px] mt-[10px] font-medium text-[10px] text-accent-base pr-[10px] pl-[5px] border border-solid border-accent-base rounded-full">
                <img
                  class="w-[20px] h-[20px] mr-[4px]"
                  alt="ROWAN price"
                  src="/images/tokens/ROWAN.svg"
                />
                ROWAN:{" "}
                {rowanPrice.value ? `$${rowanPrice.value.toFixed(5)}` : "..."}
              </span>
            </div>
            <Tooltip
              placement="top-start"
              animation="scale"
              arrow={false}
              trigger="click"
              interactive
              offset={[20]}
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
                  connectedWalletCount.value === 0
                    ? "Connect Wallets"
                    : "Connected Wallets"
                }
                class={appWalletPicker.isOpen.value && "bg-gray-200"}
                action={
                  connectedWalletCount.value === 0 ? (
                    <AssetIcon
                      icon="interactive/chevron-down"
                      style={{
                        transform: "rotate(-90deg)",
                      }}
                      class="w-[20px] h-[20px] justify-self-end"
                    />
                  ) : (
                    <div class="w-[20px] h-[20px] rounded-full text-connected-base flex items-center justify-center border border-solid flex-shrink-0 justify-self-end">
                      {connectedWalletCount.value}
                    </div>
                  )
                }
              />
            </Tooltip>
            <div class="opacity-20 font-mono mt-[22px] text-[10px] pb-[10px]">
              V.2.0.X © {new Date().getFullYear()} Sifchain
            </div>
          </div>
        </div>
      </div>
    );
  },
});
