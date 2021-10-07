import { defineComponent, onMounted, ref, useCssModule } from "vue";
import { computed } from "@vue/reactivity";
import Tooltip, { TooltipInstance } from "@/components/Tooltip";
import NavSidePanelItem from "./NavSidePanelItem";
import Logo from "@/assets/logo-large.svg";
import AssetIcon from "../../components/AssetIcon";
import { prettyNumber } from "@/utils/prettyNumber";
import WalletPicker from "@/components/WalletPicker/WalletPicker";
import MoreMenu from "./NavMoreMenu";
import { PoolStat, usePoolStats } from "@/hooks/usePoolStats";
import { useAppWalletPicker } from "@/hooks/useAppWalletPicker";
import { rootStore } from "@/store";
import { accountStore } from "@/store/modules/accounts";
import { Button } from "@/components/Button/Button";
import ChangelogModal, {
  changelogViewedVersion,
} from "@/components/ChangelogModal";
import { useAsyncData } from "@/hooks/useAsyncData";
import { loadChangesData } from "@/hooks/informational-modals";
import { flagsStore } from "@/store/modules/flags";
import { shouldAllowFaucetFunding } from "@/hooks/useFaucet";
import { RouterLink } from "vue-router";

export default defineComponent({
  props: {},
  setup() {
    const appWalletPicker = useAppWalletPicker();

    const moreMenuRef = ref();

    const sidebarRef = ref();
    const isOpenRef = ref(false);

    const changelogOpenRef = ref(false);

    onMounted(() => {
      document.addEventListener("click", (ev) => {
        setTimeout(() => {
          const target = ev.target as HTMLElement;
          const btn = document.getElementById("open-button");
          if (!isOpenRef.value) return;
          if (btn && btn.contains(target)) return;
          if (sidebarRef.value.contains(target)) return;

          isOpenRef.value = false;
        }, 1);
      });
    });

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

    const connectedNetworkCount = rootStore.accounts.refs.connectedNetworkCount.computed();

    const changesData = useAsyncData(() => loadChangesData());

    return () => (
      <>
        <Button.Inline
          id="open-button"
          class={[
            "hidden sm:block fixed top-[8px] rounded-bl-none rounded-tl-none left-0 z-40 transition-all transform duration-500",
            isOpenRef.value ? "translate-x-[-100%]" : "translate-x-none",
            isOpenRef.value ? "ml-sidebar left-[-8px]" : "ml-0",
            isOpenRef.value ? "!rounded-sm" : "",
          ]}
          onClick={() => (isOpenRef.value = !isOpenRef.value)}
        >
          <AssetIcon
            icon="interactive/chevron-down"
            size={20}
            style={{
              transform: `rotate(${isOpenRef.value ? 90 : -90}deg)`,
            }}
          />
        </Button.Inline>
        <div
          ref={sidebarRef}
          class={[
            "overflow-y-scroll font-sans flex-row align-center justify-center container w-sidebar h-full z-30 bg-gray-base text-white fixed left-0 top-0 bottom-0 transition-transform sm:translate-x-[-100%] sm:duration-500",
            isOpenRef.value && "!translate-x-0",
          ]}
        >
          <div class="w-full h-full text-center flex flex-col flex-1 justify-between px-[10px]">
            <div class="top">
              <div class="mt-[38px] shorter:mt-[19px] flex justify-center">
                <Logo class="w-[119px] shorter:w-[80px]" />
              </div>
              <div class="mt-[9.3vmin] shorter:mt-[3vmin]">
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
                <NavSidePanelItem
                  icon="navigation/changelog"
                  onClick={() => (changelogOpenRef.value = true)}
                  displayName={<div class="flex items-center">Changelog</div>}
                  action={
                    changelogViewedVersion.isLatest() ? undefined : (
                      <div class="flex flex-1 justify-end">
                        <div class="w-[8px] h-[8px] mr-[2px] bg-accent-base rounded-full" />
                      </div>
                    )
                  }
                />
                {changelogOpenRef.value && (
                  <ChangelogModal
                    onClose={() => (changelogOpenRef.value = false)}
                  />
                )}
                {shouldAllowFaucetFunding() && (
                  <NavSidePanelItem
                    displayName="Get Free Rowan"
                    icon="navigation/rowan"
                    href="/balances/get-rowan"
                  />
                )}
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
                    <MoreMenu
                      onAction={() => moreMenuRef.value.tippy?.hide()}
                    />
                  }
                >
                  <NavSidePanelItem displayName="More" icon="navigation/more" />
                </Tooltip>
              </div>
            </div>
            {flagsStore.state.fieldsOfGoldEnabled && (
              <div class="middle mt-[10px]">
                <RouterLink
                  to={{ name: "Leaderboard", params: { type: "vol" } }}
                  class="h-[46px] flex items-center justify-between px-[16px] cursor-pointer text-black rounded-t-[20px] font-semibold"
                  style={{
                    backgroundImage:
                      "linear-gradient(93.61deg, #C79E3A 0.77%, #EBCA62 100%)",
                  }}
                >
                  <div class="flex items-center">
                    <img class="w-[33px]" src="/images/wreath-tiny.svg" />
                    <div class="ml-[10px]">Fields of Gold</div>
                  </div>
                  <AssetIcon
                    icon="interactive/chevron-down"
                    style={{ transform: "rotate(-90deg)" }}
                    size={12}
                  />
                </RouterLink>
                <div class="p-[12px] bg-gray-250 rounded-b-[20px] text-accent-base font-medium text-left">
                  <div class="text-sm">View the Leaderboards</div>
                  <div class="flex items-center mt-[8px]">
                    {["vol", "txn"].map((type) => (
                      <RouterLink
                        to={{ name: "Leaderboard", params: { type } }}
                        key={type}
                      >
                        <div class="pl-[8px] pr-[6px] h-[22px] border-solid border border-accent-base rounded-xs flex items-center text-sm hover:bg-gray-500 mr-[10px] whitespace-nowrap">
                          {type === "vol" ? "Volume" : "Tx Count"}
                          <AssetIcon
                            icon="interactive/chevron-down"
                            size={12}
                            style={{
                              transform: "rotate(-90deg)",
                            }}
                            class="ml-[4px]"
                          />
                        </div>
                      </RouterLink>
                    ))}
                  </div>
                </div>
              </div>
            )}
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
                  {rowanPrice.value
                    ? `$${(+rowanPrice.value).toFixed(5)}`
                    : "..."}
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
                    connectedNetworkCount.value === 0
                      ? "Connect Wallets"
                      : accountStore.getters.isConnecting
                      ? "Connecting..."
                      : "Connected Wallets"
                  }
                  class={[
                    "mt-0",
                    appWalletPicker.isOpen.value && "bg-gray-200",
                  ]}
                  action={
                    connectedNetworkCount.value === 0 ? (
                      <AssetIcon
                        icon="interactive/chevron-down"
                        style={{
                          transform: "rotate(-90deg)",
                        }}
                        class="w-[20px] h-[20px]"
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
                      <div class="w-[20px] h-[20px] ml-auto rounded-full text-connected-base flex items-center justify-center border border-solid flex-shrink-0">
                        {connectedNetworkCount.value}
                      </div>
                    )
                  }
                />
              </Tooltip>
              <div class="opacity-20 font-mono mt-[24px] text-sm pb-[10px] hover:opacity-100">
                {/* V.2.0.X © {new Date().getFullYear()} Sifchain */}
                {changesData.isSuccess.value &&
                  "V." + changesData.data.value?.version?.toUpperCase()}{" "}
                © {new Date().getFullYear()} Sifchain
              </div>
            </div>
          </div>
        </div>
      </>
    );
  },
});
