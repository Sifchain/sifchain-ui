import { defineComponent, ref, watch, computed } from "vue";
import { useRouter } from "vue-router";
import clsx from "clsx";

import { accountStore } from "@/store/modules/accounts";
import { governanceStore } from "@/store/modules/governance";
import Logo from "@/assets/logo-large.svg";
import useChangeLog from "@/hooks/useChangeLog";
import { shouldAllowFaucetFunding } from "@/hooks/useFaucet";
import Tooltip from "@/components/Tooltip";
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

    const isOpenRef = ref(true);

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

    const changelog = useChangeLog();

    return () => (
      <>
        {changelogOpenRef.value && (
          <ChangelogModal onClose={() => (changelogOpenRef.value = false)} />
        )}
        {votingOpenRef.value && (
          <VotingModal onClose={() => (votingOpenRef.value = false)} />
        )}

        <aside
          class={clsx(
            [
              "ease fixed z-40 flex h-screen w-full flex-col transition-transform md:max-w-[240px]",
              "gap-6 bg-black p-4 shadow-slate-900 sm:shadow-lg md:gap-12",
            ],
            {
              "-translate-x-[100%]": !isOpenRef.value,
              "md:relative": isOpenRef.value,
            },
          )}
        >
          <button
            onClick={() => (isOpenRef.value = !isOpenRef.value)}
            class={clsx(
              "absolute right-0 top-36 h-8 w-8 translate-x-[100%] rounded-r-md bg-slate-800 p-1",
              "z-40 opacity-80 transition-all hover:opacity-100",
              {
                "-right-0.5 translate-x-0 -scale-x-[1]": isOpenRef.value,
              },
            )}
          >
            <AssetIcon
              icon="interactive/chevron-down"
              size={20}
              class="-rotate-90"
            />
          </button>

          <div class="grid flex-1 content-start gap-8 md:gap-12">
            <div class="flex justify-center py-2 md:py-8">
              <Logo class="shorter:w-[90px] w-[119px]" />
            </div>
            <div class="grid gap-2 md:gap-3">
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
                content={
                  <MoreMenu onAction={() => moreMenuRef.value.tippy?.hide()} />
                }
              >
                <NavSidePanelItem displayName="More" icon="navigation/more" />
              </Tooltip>
            </div>
          </div>
          <div class="grid gap-2 md:gap-3">
            <TVL />
            <PmtpParam />
            <RowanPrice />
            <ConnectedWallets />
          </div>
          {changelog.isSuccess.value && (
            <div class="text-center font-mono text-xs opacity-40 hover:opacity-100">
              {`V.${changelog.data.value?.version?.toUpperCase()} © 
                  ${new Date().getFullYear()} Sifchain`}
            </div>
          )}
        </aside>
      </>
    );
  },
});
