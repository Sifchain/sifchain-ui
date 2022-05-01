import { defineComponent, onMounted, ref, watch, computed } from "vue";
import { useRouter } from "vue-router";

import { accountStore } from "@/store/modules/accounts";
import { governanceStore } from "@/store/modules/governance";
import Logo from "@/assets/logo-large.svg";
import useChangeLog from "@/hooks/useChangeLog";
import { shouldAllowFaucetFunding } from "@/hooks/useFaucet";
import Tooltip, { TooltipInstance } from "@/components/Tooltip";
import { Button } from "@/components/Button/Button";
import { VotingModal } from "@/components/VotingModal/VotingModal";
import ChangelogModal, {
  changelogViewedVersion,
} from "@/components/ChangelogModal";

import NavSidePanelItem from "./NavSidePanelItem";
import AssetIcon from "../AssetIcon";
import MoreMenu from "./NavMoreMenu";
import ConnectedWallets from "./ConnectedWallets";
import RowanPrice from "./RowanPrice";
import PmtpParam from "./PmtpParam";
import TVL from "./TVL";

let VOTE_PARAM_IN_URL = false;
try {
  VOTE_PARAM_IN_URL = window.location.href.includes("vote=1");
} catch (_) {}

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
      if (!!router.currentRoute.value?.query?.vote) {
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
            isOpenRef.value ? "!rounded" : "",
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
          class={["flex flex-1 flex-col justify-between p-4 shadow-xl"]}
        >
          <div class="grid gap-12">
            <div class="flex justify-center py-8">
              <Logo class="shorter:w-[90px] w-[119px]" />
            </div>
            <div class="grid gap-3">
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
              <NavSidePanelItem
                displayName="Rewards"
                icon="navigation/rewards"
                href="/rewards"
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
                    href="https://stakely.io/faucet/sifchain-rowan"
                    class="group"
                    action={
                      <div class="hidden flex-1 items-center justify-end group-hover:flex">
                        <AssetIcon
                          icon="interactive/open-external"
                          size={16}
                          class="opacity-50"
                        />
                      </div>
                    }
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
                      "w-[180px] font-medium bg-gray-800 text-white px-8 py-[12px] rounded-none rounded-b-sm";
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
          <div class="grid gap-3">
            <TVL />
            <PmtpParam />
            <RowanPrice />
            <ConnectedWallets />
            {changelog.isSuccess.value && (
              <div class="mt-[24px] pb-[10px] font-mono text-sm opacity-20 hover:opacity-100">
                {`V.${changelog.data.value?.version?.toUpperCase()} © 
                  ${new Date().getFullYear()} Sifchain`}
              </div>
            )}
          </div>
        </div>
      </>
    );
  },
});
