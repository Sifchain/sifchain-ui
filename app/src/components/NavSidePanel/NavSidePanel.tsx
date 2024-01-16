import { defineComponent, onMounted, ref, watch, computed } from "vue";
import { useRouter } from "vue-router";

import { accountStore } from "~/store/modules/accounts";
import { flagsStore, MARGIN_FE_URL } from "~/store/modules/flags";
import { governanceStore } from "~/store/modules/governance";
import Logo from "~/assets/logo-large.svg";
import useChangeLog from "~/hooks/useChangeLog";
import { shouldAllowFaucetFunding } from "~/hooks/useFaucet";
import Tooltip, { TooltipInstance } from "~/components/Tooltip";
import { Button } from "~/components/Button/Button";
import { VotingModal } from "~/components/VotingModal/VotingModal";
import ChangelogModal, {
  changelogViewedVersion,
} from "~/components/ChangelogModal";

import NavSidePanelItem from "./NavSidePanelItem";
import AssetIcon from "../AssetIcon";
import MoreMenu from "./NavMoreMenu";
import ConnectedWallets from "./ConnectedWallets";
import RowanPrice from "./RowanPrice";
import TVL from "./TVL";

let VOTE_PARAM_IN_URL = false;
try {
  VOTE_PARAM_IN_URL = window.location.href.includes("vote=1");
} catch (_) {
  // do nothing
}

export default defineComponent({
  setup() {
    const moreMenuRef = ref();

    const sidebarRef = ref();
    const isOpenRef = ref(false);

    const proposalData = computed(() => governanceStore.getters.activeProposal);

    const changelogOpenRef = ref(false);
    const votingOpenRef = ref(false);

    const router = useRouter();

    watch([router.currentRoute], () => {
      // add ?vote=anything to any hash route to open the voting modal
      if (router.currentRoute.value?.query?.vote) {
        votingOpenRef.value = true;
      }
    });

    watch(
      proposalData,
      (data, oldData) => {
        if (
          data.proposal &&
          !oldData?.proposal &&
          VOTE_PARAM_IN_URL &&
          !data.hasVoted
        ) {
          votingOpenRef.value = true;
        }
      },
      { immediate: true },
    );

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

    const isMarginOn = computed(() => flagsStore.state.remoteFlags.MARGIN);

    const changelog = useChangeLog();

    return () => (
      <>
        {changelogOpenRef.value && (
          <ChangelogModal onClose={() => (changelogOpenRef.value = false)} />
        )}
        {votingOpenRef.value && (
          <VotingModal onClose={() => (votingOpenRef.value = false)} />
        )}
        <Button.Inline
          id="open-button"
          class={[
            "fixed top-[8px] left-0 z-40 hidden transform rounded-bl-none rounded-tl-none transition-all duration-500 sm:block",
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
            "align-center w-sidebar container fixed left-0 top-0 bottom-0 z-50 h-full font-sans text-white",
            "flex-row justify-center overflow-y-scroll bg-black transition-transform sm:translate-x-[-100%] sm:duration-500",
            isOpenRef.value && "!translate-x-0",
          ]}
        >
          <div class="flex h-full w-full flex-1 flex-col justify-between px-[10px] text-center">
            <div class="top">
              <div class="shorter:mt-[7.5vmin] mt-[38px] flex justify-center">
                <Logo class="shorter:w-[90px] w-[119px]" />
              </div>
              <div class="shorter:mt-[7.5vmin] mt-[9.3vmin]">
                <NavSidePanelItem
                  displayName="Swap"
                  icon="navigation/swap"
                  href="/swap"
                />
                <NavSidePanelItem
                  displayName={<>Balances</>}
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
                {isMarginOn.value && (
                  <NavSidePanelItem
                    displayName="Margin"
                    icon="navigation/harvest"
                    href=""
                    class="opacity-50"
                    style="pointer-events: none;"
                  />
                )}
                <NavSidePanelItem
                  displayName="Stake"
                  icon="navigation/stake"
                  href="https://wallet.keplr.app/#/sifchain/stake"
                />
                <NavSidePanelItem
                  displayName="Charts"
                  icon="navigation/charts"
                  href=""
                  class="opacity-50"
                  style="pointer-events: none;"
                  // href="https://dexscreener.com/sifchain/cusdc"
                />
                <NavSidePanelItem
                  icon="navigation/changelog"
                  onClick={() => {
                    changelogOpenRef.value = true;
                  }}
                  displayName={<div class="flex items-center">Changelog</div>}
                  action={
                    changelogViewedVersion.isLatest() ? undefined : (
                      <div class="flex flex-1 justify-end">
                        <div class="bg-accent-base mr-[2px] h-[8px] w-[8px] rounded-full" />
                      </div>
                    )
                  }
                />
                {changelogOpenRef.value && (
                  <ChangelogModal
                    onClose={() => (changelogOpenRef.value = false)}
                  />
                )}

                {votingOpenRef.value && (
                  <VotingModal onClose={() => (votingOpenRef.value = false)} />
                )}
                {shouldAllowFaucetFunding() && (
                  <NavSidePanelItem
                    displayName="Get Free Rowan"
                    icon="navigation/rowan"
                    href="/balances/get-rowan"
                  />
                )}
                {!accountStore.state.sifchain.connecting &&
                  accountStore.state.sifchain.hasLoadedBalancesOnce &&
                  !accountStore.state.sifchain.balances.some(
                    // does not have rowan
                    (b) =>
                      b.asset.symbol.includes("rowan") &&
                      b.amount.greaterThan("1".padEnd(b.asset.decimals, "0")),
                  ) && (
                    <NavSidePanelItem
                      displayName="Rowan Faucet"
                      icon="navigation/rowan"
                      // href="https://stakely.io/faucet/sifchain-rowan"
                      href=""
                      class="opacity-50"
                      style="pointer-events: none;"
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
                    const content =
                      instance.popper.querySelector(".tippy-content");
                    if (content) {
                      content.className +=
                        "w-[180px] font-medium bg-gray-200 px-[16px] py-[12px] rounded-none rounded-b-sm";
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
            {!!proposalData.value.proposal && (
              <div
                onClick={() => {
                  votingOpenRef.value = true;
                }}
                class="w-full"
              >
                <div
                  class={[
                    "mt-[10px] flex h-[46px] w-full cursor-pointer items-center justify-between rounded-t-[10px] px-[16px] font-semibold text-black",
                  ]}
                  style={{
                    backgroundImage:
                      "linear-gradient(93.61deg, #C79E3A 0.77%, #EBCA62 100%)",
                  }}
                >
                  <div class="flex items-center">
                    <AssetIcon
                      size={32}
                      icon="interactive/ticket"
                      style={{ transform: "translateY(-1px)" }}
                    />
                    <div class="ml-[6px] whitespace-nowrap">
                      {proposalData.value.proposal.title}
                    </div>
                  </div>
                  {/* bump */}
                  {!proposalData.value.hasVoted && (
                    <div>
                      <AssetIcon
                        icon="interactive/chevron-down"
                        style={{ transform: "rotate(-90deg)" }}
                        size={12}
                      />
                    </div>
                  )}
                </div>
                <div class="bg-gray-250 text-accent-base rounded-b-[10px] p-[12px] text-left font-medium">
                  <div class="whitespace-pre text-sm">
                    Voting open until{" "}
                    {new Date(
                      proposalData.value.proposal.endDateTime,
                    ).toLocaleDateString()}
                    .
                    {proposalData.value.hasVoted &&
                      "\nYour vote has been recorded."}
                  </div>
                </div>
              </div>
            )}
            <div class="bottom mt-[10px]">
              <div class="mb-[2.2vh] w-full text-left transition-all">
                <TVL />
                <RowanPrice />
              </div>
              <ConnectedWallets />
              {changelog.isSuccess.value && (
                <div class="mt-[24px] pb-[10px] font-mono text-sm opacity-20 hover:opacity-100">
                  {`V.${changelog.data.value?.version?.toUpperCase()} © 
                  ${new Date().getFullYear()} Sifchain`}
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  },
});
