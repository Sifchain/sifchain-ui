import { defineComponent } from "vue";
import { useTVL } from "@/componentsLegacy/TVL/useTVL";
import { useRowanPrice } from "@/componentsLegacy/RowanPrice/useRowanPrice";
import { useCore } from "../../hooks/useCore";
import { computed } from "@vue/reactivity";
import Tooltip, { TooltipInstance } from "@/components/Tooltip";
import NavSidePanelItem from "./NavSidePanelItem";
import Logo from "@/assets/logo-large.svg";
import AssetIcon from "../utilities/AssetIcon";
import WalletPicker from "@/components/WalletPicker";

export default defineComponent({
  props: {},
  setup(props) {
    const tvl = useTVL();
    const rowanPrice = useRowanPrice();

    return () => (
      <div class="portrait:hidden overflow-y-scroll font-sans flex-row align-center justify-center container w-sidebar h-full z-10 bg-gray-base text-white fixed left-0 top-0 bottom-0">
        <div class="w-full h-full text-center flex flex-col flex-1 justify-between px-[10px]">
          <div class="top">
            <div class="w-[119px] ml-[46px] mr-[45px] mt-[38px] flex justify-center">
              <Logo />
            </div>
            <div class="mt-[96px]">
              <NavSidePanelItem
                displayName="Dashboard"
                icon="dashboard"
                routerLink="/dashboard"
                isComingSoon
              />
              <NavSidePanelItem
                displayName="Swap"
                icon="swap"
                routerLink="/swap"
              />
              <NavSidePanelItem
                displayName="Balances"
                icon="balances"
                routerLink="/balances"
              />
              <NavSidePanelItem
                displayName="Pool"
                icon="pool"
                routerLink="/pool"
              />
              <NavSidePanelItem
                displayName="Pool Stats"
                icon="pool-stats"
                routerLink="/stats"
              />
              <NavSidePanelItem
                displayName="Stake"
                icon="stake"
                routerLink="/stake-delegate"
              />
              <NavSidePanelItem
                displayName="Documents"
                icon="documents"
                routerLink="/documents"
              />
              <NavSidePanelItem
                displayName="More"
                icon="more"
                routerLink="/more"
              />
            </div>
          </div>
          <div class="bottom">
            <div class="transition-all pl-[30px] w-full mt-24 flex justify-start items-start flex-col">
              <div class="line-height-[22px] align-middle font-medium text-[10px] text-info-base px-[10px] py-[1px] border-[1px] border-solid border-info-base rounded-full justify-start">
                TVL: {tvl.data || "..."}
              </div>
              <div class="transition-all flex flex-row mt-[8px] align-middle font-medium text-[10px] pr-[9px] text-accent-base border-[1px] border-solid border-accent-base rounded-full justify-start">
                <img
                  class="ml-[4px] my-[2px] w-[20px] h-[20px]"
                  src="/images/tokens/ROWAN.svg"
                />
                <span
                  style="line-height: 20px;"
                  class="inline-block ml-[4px] my-[1px]"
                >
                  ROWAN: ${rowanPrice.data || "..."}
                </span>
              </div>
            </div>
            <Tooltip
              placement="top-start"
              animation="scale"
              arrow={false}
              trigger="click"
              interactive
              offset={[20, 20]}
              onMount={(instance: TooltipInstance) => {
                instance.popper
                  .querySelector(".tippy-box")
                  ?.classList.add("!origin-bottom-left");
              }}
              appendTo={() => document.body}
              content={<WalletPicker />}
            >
              <button class="mt-[22px] text-xs text-bold flex items-center w-full px-1">
                <AssetIcon
                  icon="interactive/wallet"
                  class="w-[20px] h-[20px] mr-[10px]"
                />
                Connect Wallet
              </button>
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
