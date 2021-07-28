import { defineComponent, ref } from "vue";
import { useCore } from "../../hooks/useCore";
import { computed } from "@vue/reactivity";
import Tooltip, { TooltipInstance } from "@/components/Tooltip";
import NavSidePanelItem from "./NavSidePanelItem";
import Logo from "@/assets/logo-large.svg";
import AssetIcon from "../../components/AssetIcon";
import { prettyNumber } from "@/utils/prettyNumber";
import WalletPicker from "@/components/WalletPicker";
import MoreMenu from "./NavMoreMenu";
import { PoolStat, usePoolStats } from "@/hooks/usePoolStats";
import { useAppWalletPicker } from "@/hooks/useAppWalletPicker";

export default defineComponent({
  props: {},
  setup(props) {
    const { store, config } = useCore();
    const appWalletPicker = useAppWalletPicker();

    const moreMenuRef = ref();

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
                class="opacity-50 pointer-events-none"
                action={
                  <div class="py-[2px] px-[6px] text-sm text-info-base border-solid border-[1px] rounded-full border-info-base mr-[8px] justify-self-end">
                    Soon
                  </div>
                }
              />
              <NavSidePanelItem
                displayName="Swap"
                icon="navigation/swap"
                href="/swap"
              />
              <NavSidePanelItem
                displayName="Balances"
                icon="navigation/balances"
                href="/balances"
              />
              <NavSidePanelItem
                displayName="Pool"
                icon="navigation/pool"
                href="/pool"
              />
              <NavSidePanelItem
                displayName="Pool Stats"
                icon="navigation/pool-stats"
                href="/stats"
              />
              <NavSidePanelItem
                displayName="Rewards"
                icon="navigation/rewards"
                href="/rewards"
              />
              <NavSidePanelItem
                displayName="Stake"
                icon="navigation/stake"
                href="https://wallet.keplr.app/#/sifchain/stake"
                class="group"
                action={
                  <div class="hidden group-hover:flex flex-1 justify-end items-center">
                    <AssetIcon
                      icon="interactive/open-external"
                      size={16}
                      class="opacity-50"
                    />
                  </div>
                }
              />
              <NavSidePanelItem
                displayName="Documents"
                icon="navigation/documents"
                href="https://docs.sifchain.finance/resources/sifchain-dex-ui"
                class="group"
                action={
                  <div class="hidden group-hover:flex flex-1 justify-end items-center">
                    <AssetIcon
                      icon="interactive/open-external"
                      size={16}
                      class="opacity-50"
                    />
                  </div>
                }
              />
              <Tooltip
                trigger="click"
                placement="bottom"
                arrow={false}
                interactive
                animation={undefined}
                ref={moreMenuRef}
                offset={[0, -2]}
                onShow={(instance: TooltipInstance) => {
                  const content = instance.popper.querySelector(
                    ".tippy-content",
                  );
                  if (content) {
                    content.className +=
                      " w-[180px] font-medium bg-gray-200 px-[16px] py-[12px] rounded-none rounded-b-sm";
                  }
                }}
                content={
                  <MoreMenu onAction={() => moreMenuRef.value.tippy?.hide()} />
                }
              >
                <NavSidePanelItem displayName="More" icon="navigation/more" />
              </Tooltip>
            </div>
          </div>
          <div class="bottom mt-[10px]">
            <div class="transition-all pl-[30px] w-full text-left mb-[2.2vh]">
              <span class="inline-flex items-center justify-center h-[26px] font-medium text-sm text-info-base px-[10px] border border-solid border-info-base rounded-full">
                TVL: {tvl.value ? `$${prettyNumber(tvl.value)}` : "..."}
              </span>
              <div />
              <span class="inline-flex items-center justify-center h-[26px] mt-[10px] font-medium text-sm text-accent-base pr-[10px] pl-[5px] border border-solid border-accent-base rounded-full">
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
                  connectedWalletCount.value === 0
                    ? "Connect Wallets"
                    : "Connected Wallets"
                }
                class={["mt-0", appWalletPicker.isOpen.value && "bg-gray-200"]}
                action={
                  connectedWalletCount.value === 0 ? (
                    <AssetIcon
                      icon="interactive/chevron-down"
                      style={{
                        transform: "rotate(-90deg)",
                      }}
                      class="w-[20px] h-[20px]"
                    />
                  ) : (
                    <div class="w-[20px] h-[20px] rounded-full text-connected-base flex items-center justify-center border border-solid flex-shrink-0">
                      {connectedWalletCount.value}
                    </div>
                  )
                }
              />
            </Tooltip>
            <div class="opacity-20 font-mono mt-[24px] text-sm pb-[10px]">
              V.2.0.X © {new Date().getFullYear()} Sifchain
            </div>
          </div>
        </div>
      </div>
    );
  },
});
