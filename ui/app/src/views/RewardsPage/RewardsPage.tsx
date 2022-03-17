import { defineComponent, ref, computed } from "vue";
import PageCard from "@/components/PageCard";
import {
  rewardColumnsLookup,
  useRewardsPageData,
  useTimeUntilNextDispensation,
} from "./useRewardsPageData";
import AssetIcon from "@/components/AssetIcon";
import { RewardSection } from "./components/RewardSection";

import Layout from "@/componentsLegacy/Layout/Layout";
import { Tooltip } from "@/components/Tooltip";
import { Button } from "@/components/Button/Button";
import { prettyNumber } from "@/utils/prettyNumber";

// This one is for the chads
export default defineComponent({
  name: "RewardsPage",
  props: {},
  setup() {
    const data = useRewardsPageData();
    const {
      isLoading,
      error,
      rewardProgramResponse,
      lmClaim,
      address,
      reloadClaims,
    } = data;
    const timeUntilNextDispensation = useTimeUntilNextDispensation();
    const rewardTotals = computed(() => {
      return rewardProgramResponse.data.value?.rewardPrograms.reduce(
        (acc, program) => {
          if (program.participant) {
            acc.pendingRewards +=
              program.participant.claimedCommissionsAndRewardsAwaitingDispensation;
            acc.dispensedRewards += program.participant.dispensed;
          }
          return acc;
        },
        {
          pendingRewards: 0,
          dispensedRewards: 0,
        },
      );
    });

    const showAllRef = ref(true);

    const isClaimModalOpened = ref(false);
    const claimRewardType = ref<"vs" | "lm">("lm");
    return () => {
      if (isLoading.value) {
        return (
          <Layout>
            <div class="absolute left-0 top-[180px] w-full flex justify-center">
              <div class="flex items-center justify-center bg-black bg-opacity-50 rounded-lg h-[80px] w-[80px]">
                <AssetIcon
                  icon="interactive/anim-racetrack-spinner"
                  size={64}
                />
              </div>
            </div>
          </Layout>
        );
      }
      if (error.value) {
        return <div>Error! {error.value.message}</div>;
      }
      const summaryApyRef = computed(() => {
        return rewardProgramResponse.data.value?.rewardPrograms.reduce(
          (prev, curr) => {
            return prev + curr.summaryAPY;
          },
          0,
        );
      });

      return (
        <Layout>
          <PageCard
            class="w-[1000px]"
            heading="Rewards"
            iconName="navigation/rewards"
          >
            <>
              <p class="mt-[0px] ml-[5px] text-gray-850 ">
                Earn rewards by participating in Sifchain's Liquidity Mining
                programs.{" "}
                <a
                  href="https://docs.sifchain.finance/using-the-website/web-ui-step-by-step/rewards/liquidity-mining-rewards-programs"
                  rel="noopener noreferrer"
                  target="_blank"
                  class="underline"
                >
                  Learn More
                </a>{" "}
              </p>
              <div class="flex w-full items-center gap-[12px] mt-[10px] whitespace-nowrap">
                <div class="bg-white bg-opacity-5  px-[20px] py-[10px] rounded flex-1">
                  <div class="font-lg text-accent-base font-semibold">
                    Claimed - Pending Dispensation
                  </div>
                  <div class="pt-[4px] text-sm opacity-50">
                    Dispensed by Tuesday morning PST
                  </div>
                  <div class="pt-[7px] text-xl whitespace-pre">
                    {rewardTotals.value == null
                      ? " "
                      : lmClaim.value && !rewardTotals.value.pendingRewards
                      ? "Pending Claim"
                      : `${prettyNumber(
                          rewardTotals.value.pendingRewards,
                        )} ROWAN`}
                  </div>
                </div>
                <div class="bg-white bg-opacity-5  px-[20px] py-[10px] rounded flex-1">
                  <div class="font-lg text-accent-base font-semibold">
                    Dispensed Rewards
                  </div>
                  <div class="pt-[4px] text-sm opacity-50">
                    Amount already claimed and received
                  </div>
                  <div class="pt-[7px] text-xl whitespace-pre">
                    {rewardTotals.value == null
                      ? " "
                      : `${prettyNumber(
                          rewardTotals.value.dispensedRewards,
                        )} ROWAN`}
                  </div>
                </div>
                <div class="bg-white bg-opacity-5 px-[20px] py-[10px] rounded flex-1">
                  <div class="font-lg text-accent-base font-semibold">
                    Time Remaining to Claim
                  </div>
                  <div class="pt-[4px] text-sm opacity-50 whitespace-nowrap">
                    Claim deadline for weekly dispensation
                  </div>
                  <div class="pt-[7px] text-xl whitespace-pre">
                    {timeUntilNextDispensation.value.timeUntilNextDispensation}
                  </div>
                </div>
              </div>

              <div class="pb-[5px] mt-[12px] mb-[-5px] w-full flex items-center justify-start opacity-50 text-md">
                <div class={rewardColumnsLookup.rewardProgram.class}>
                  Reward Program
                </div>
                <div class={rewardColumnsLookup.duration.class}>
                  {/* Duration */}
                </div>
                <div class={rewardColumnsLookup.apy.class}>
                  Program APR
                  <Tooltip
                    content={
                      <div class="mb-2">
                        Current overall program summary APR. This is also
                        displayed in Pools and Pool Stats.
                      </div>
                    }
                  >
                    <Button.InlineHelp></Button.InlineHelp>
                  </Tooltip>
                </div>
                <div class={rewardColumnsLookup.claimableAmount.class}>
                  Claimable Amount
                  <Tooltip
                    content={
                      <div class="mb-2">
                        Current overall program summary APR. This is also
                        displayed in Pools and Pool Stats.
                      </div>
                    }
                  >
                    <Button.InlineHelp></Button.InlineHelp>
                  </Tooltip>
                </div>
                <div class={rewardColumnsLookup.expand.class} />
              </div>
              <div>
                {rewardProgramResponse.data.value?.rewardPrograms
                  .filter((program) => {
                    if (showAllRef.value) return true;

                    const isCurrent =
                      new Date().getTime() <
                      new Date(program.endDateTimeISO).getTime();
                    if (isCurrent) return true;

                    return (
                      (program.participant
                        ?.claimedCommissionsAndRewardsAwaitingDispensation ||
                        0) > 0 ||
                      (program.participant
                        ?.totalClaimableCommissionsAndClaimableRewards || 0) > 0
                    );
                  })
                  .sort((a, b) => {
                    const aIsCurrent = new Date() < new Date(a.endDateTimeISO);
                    const bIsCurrent = new Date() < new Date(b.endDateTimeISO);
                    return +bIsCurrent - +aIsCurrent;
                  })
                  .map((program) => {
                    return (
                      <RewardSection
                        key={program.rewardProgramName}
                        rewardProgram={program}
                        alreadyClaimed={!!lmClaim.value}
                        onClaimIntent={() => {
                          claimRewardType.value = "lm";
                          isClaimModalOpened.value = true;
                        }}
                      />
                    );
                  })}
              </div>

              <div class="h-1" />
            </>
          </PageCard>
        </Layout>
      );
    };
  },
});
