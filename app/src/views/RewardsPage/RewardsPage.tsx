import { defineComponent, ref, computed } from "vue";
import PageCard from "@/components/PageCard";
import { rewardColumnsLookup, useRewardsPageData } from "./useRewardsPageData";
import AssetIcon from "@/components/AssetIcon";
import { RewardSection } from "./components/RewardSection";

import Layout from "@/components/Layout";
import { prettyNumber } from "@/utils/prettyNumber";

// This one is for the chads
export default defineComponent({
  name: "RewardsPage",
  props: {},
  setup() {
    const data = useRewardsPageData();
    const { isLoading, error, rewardProgramResponse } = data;
    const timeUntilNextDispensation = computed(
      () => rewardProgramResponse.data.value?.timeRemaining ?? "",
    );
    const totalDispensedRewards = computed(
      () => rewardProgramResponse.data.value?.totalDispensed ?? 0,
    );

    const rewardTotals = computed(() => {
      const programs = rewardProgramResponse.data.value?.rewardPrograms;
      return programs?.reduce(
        (acc, program) => {
          if (program.participant) {
            return {
              ...acc,
              pendingRewards:
                acc.pendingRewards + program.participant.pendingRewards,
              dispensedRewards:
                acc.dispensedRewards + program.participant.dispensed,
            };
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
            <div class="absolute left-0 top-[180px] flex w-full justify-center">
              <div class="flex h-[80px] w-[80px] items-center justify-center rounded-lg bg-black bg-opacity-50">
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

      return (
        <Layout>
          <PageCard
            class="w-[1000px]"
            heading="Rewards"
            iconName="navigation/rewards"
          >
            <>
              <p class="text-gray-850 mt-[0px] ml-[5px]">
                Earn rewards by participating in Sifchain's Liquidity Mining
                programs.{" "}
                <a
                  href="https://docs.sifchain.finance/using-the-website/web-ui-step-by-step/rewards/liquidity-mining-rewards-programs"
                  rel="noopener noreferrer"
                  target="_blank"
                  class="underline"
                >
                  Learn More
                </a>
              </p>
              <div class="mt-[10px] flex w-full items-center gap-[12px] whitespace-nowrap">
                <div class="flex-1 rounded  bg-white bg-opacity-5 px-[20px] py-[10px]">
                  <div class="font-lg text-accent-base font-semibold">
                    Total pending rewards
                  </div>
                  <div class="pt-[4px] text-sm opacity-50">
                    Dispensed by Tuesday morning PST
                  </div>
                  <div class="whitespace-pre pt-[7px] text-xl">
                    {rewardTotals.value == null
                      ? "..."
                      : `${prettyNumber(
                          rewardTotals.value.pendingRewards,
                        )} ROWAN`}
                  </div>
                </div>
                <div class="flex-1 rounded  bg-white bg-opacity-5 px-[20px] py-[10px]">
                  <div class="font-lg text-accent-base font-semibold">
                    Dispensed rewards
                  </div>
                  <div class="pt-[4px] text-sm opacity-50">
                    Amount already claimed and received
                  </div>
                  <div class="whitespace-pre pt-[7px] text-xl">
                    {totalDispensedRewards.value
                      ? `${prettyNumber(totalDispensedRewards.value)} ROWAN`
                      : "..."}
                  </div>
                </div>
                <div class="flex-1 rounded bg-white bg-opacity-5 px-[20px] py-[10px]">
                  <div class="font-lg text-accent-base font-semibold">
                    Time until next dispensation
                  </div>
                  <div class="whitespace-nowrap pt-[4px] text-sm opacity-50">
                    Estimated time until next dispensation
                  </div>
                  <div class="whitespace-pre pt-[7px] text-xl">
                    {timeUntilNextDispensation.value || "..."}
                  </div>
                </div>
              </div>
              <div class="text-md mt-[12px] mb-[-5px] flex w-full items-center justify-start pb-[5px] opacity-50">
                <div class={rewardColumnsLookup.rewardProgram.class}>
                  Reward Program
                </div>
                <div class={rewardColumnsLookup.duration.class}>
                  {/* Duration */}
                </div>
                <div class={rewardColumnsLookup.apy.class}>Program APR</div>
                <div class={rewardColumnsLookup.claimableAmount.class}>
                  Pending Rewards
                </div>
                <div class={rewardColumnsLookup.expand.class} />
              </div>
              <div>
                {(rewardProgramResponse.data.value?.rewardPrograms ?? [])
                  .filter((program) => {
                    if (showAllRef.value) return true;

                    const isCurrent =
                      !program.endDateTimeISO ||
                      new Date().getTime() <
                        new Date(program.endDateTimeISO).getTime();

                    if (isCurrent) return true;

                    return (
                      (program.participant?.pendingRewards || 0) > 0 ||
                      (program.participant?.accumulatedRewards || 0) > 0
                    );
                  })
                  .sort((a, b) => {
                    const aIsCurrent =
                      !a.endDateTimeISO ||
                      new Date() < new Date(a.endDateTimeISO);
                    const bIsCurrent =
                      !b.endDateTimeISO ||
                      new Date() < new Date(b.endDateTimeISO);
                    return +bIsCurrent - +aIsCurrent;
                  })
                  .map((program) => (
                    <RewardSection
                      key={program.rewardProgramName}
                      rewardProgram={program}
                      alreadyClaimed={false}
                      onClaimIntent={() => {
                        claimRewardType.value = "lm";
                        isClaimModalOpened.value = true;
                      }}
                    />
                  ))}
              </div>

              <div class="h-1" />
            </>
          </PageCard>
        </Layout>
      );
    };
  },
});
