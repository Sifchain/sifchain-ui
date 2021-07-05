<script lang="tsx">
import { defineComponent, PropType, Suspense, watchEffect } from "vue";
import { IAssetAmount } from "@sifchain/sdk";
import { useTVL } from "@/components/TVL/useTVL";
import { useRowanPrice } from "@/components/RowanPrice/useRowanPrice";
import { useCore } from "../../hooks/useCore";
import { computed } from "@vue/reactivity";
import NavSidePanelItemVue from "./NavSidePanelItem.vue";

// const navLinks: Array<{ displayName: string; routePath: string }> = [
//   "Dashboard",
//   "Swap",
//   "Balances",
//   "Pool",
//   "Pool Stats",
//   "Stake",
//   "Documents",
//   "More",
// ];
// console.log({ navIcons });

export default defineComponent({
  components: {
    NavSidePanelItemVue,
  },
  props: {},
  setup(props) {
    const tvl = useTVL();
    const rowanPrice = useRowanPrice();
    const core = useCore();
    const connectedWalletsCount = computed(() => {
      return Object.values(core.store.wallet).filter((v) => v.isConnected)
        .length;
    });
    return () => (
      <div class="overflow-y-scroll font-sans flex-row align-center justify-center container w-[210px] h-full z-10 bg-darkfill-base text-white fixed left-0 top-0 bottom-0">
        <div class="w-full text-center">
          <div class="w-[119px] ml-[46px] mr-[45px] mt-[38px] flex justify-center">
            <img src={require("@/assets/logo-lg.svg")} alt="" />
          </div>
          <div class="pl-[11px] pr-[12px] mt-[96px]">
            <NavSidePanelItemVue
              displayName="Dashboard"
              icon="dashboard"
              routerLink="/dashboard"
              isComingSoon
            />
            <NavSidePanelItemVue
              displayName="Swap"
              icon="swap"
              routerLink="/swap"
            />
            <NavSidePanelItemVue
              displayName="Balances"
              icon="balances"
              routerLink="/balances"
            />
            <NavSidePanelItemVue
              displayName="Pool"
              icon="pool"
              routerLink="/pool"
            />
            <NavSidePanelItemVue
              displayName="Pool Stats"
              icon="pool-stats"
              routerLink="/stats"
            />
            <NavSidePanelItemVue
              displayName="Stake"
              icon="stake"
              routerLink="/stake-delegate"
            />
            <NavSidePanelItemVue
              displayName="Documents"
              icon="documents"
              routerLink="/documents"
            />
            <NavSidePanelItemVue
              displayName="More"
              icon="more"
              routerLink="/more"
            />
          </div>
          <div class="transition-all pl-[41px] w-full mt-24 flex justify-start items-start flex-col">
            <div class="line-height-[22px] align-middle font-medium text-[10px] text-info-base px-[10px] py-[1px] border-[1px] border-solid border-info-base rounded-full justify-start">
              TVL: {tvl.data || "..."}
            </div>
            <div class="transition-all flex flex-row mt-[8px] align-middle font-medium text-[10px] text-accent-base pr-[9px] border-[1px] border-solid border-accent-base rounded-full justify-start">
              <img
                class="inline-block h-[20px] w-[20px] ml-[4px] my-[2px]"
                src={require("@/assets/icons/navigation/rowan.svg")}
              />
              <span
                style="line-height: 20px;"
                class="inline-block ml-[4px] my-[1px]"
              >
                ROWAN: ${rowanPrice.data || "..."}
              </span>
            </div>
            <div class=" mt-[8px] py-[1px] align-middle font-medium text-[10px] text-connected-base pl-[9px] border-[1px] border-solid border-connected-base rounded-full justify-start">
              <span style="line-height: 22px;" class="py-[2px]">
                Wallets Connected
              </span>
              <div class="inline pr-[4px] py-[5px] pl-[10px]">
                <div class="inline-flex items-center justify-center rounded-full w-[16px] h-[16px] bg-connected-base text-darkfill-base">
                  {connectedWalletsCount.value}
                </div>
              </div>
            </div>
          </div>
          <div class="opacity-20 font-mono mt-[22px] text-[10px] pb-[10px]">
            V.2.0.X © {new Date().getFullYear()} Sifchain
          </div>
        </div>
      </div>
    );
  },
});
</script>

<style lang="scss" module></style>
