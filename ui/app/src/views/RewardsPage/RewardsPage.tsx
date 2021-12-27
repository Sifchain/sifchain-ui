import { defineComponent, ref, computed } from "vue";
import PageCard from "@/components/PageCard";
import { rewardColumnsLookup, useRewardsPageData } from "./useRewardsPageData";
import AssetIcon from "@/components/AssetIcon";
import { RewardSection } from "./components/RewardSection";
import { SunsetRewardSection } from "./components/SunsetRewardSection";
import ClaimRewardsModal from "./components/ClaimRewardsModal";
import { CryptoeconomicsRewardType } from "@sifchain/sdk/src/services/CryptoeconomicsService";
import Layout from "@/componentsLegacy/Layout/Layout";
import { accountStore } from "@/store/modules/accounts";
import { Tooltip } from "@/components/Tooltip";
import { Button } from "@/components/Button/Button";
import { AppCookies, NetworkEnv } from "@sifchain/sdk";
import { flagsStore } from "@/store/modules/flags";
import { getClaimableAmountString } from "./getClaimableAmountString";
import { prettyNumber } from "@/utils/prettyNumber";

// This one is for the chads
export default defineComponent({
  name: "RewardsPage",
  props: {},
  setup(props) {
    const data = useRewardsPageData();
    const {
      isLoading,
      error,
      rewardProgramResponse,
      lmClaim,
      address,
      reloadClaims,
    } = data;

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
      const totalClaimableRef = computed(() => {
        return rewardProgramResponse.data.value?.rewardPrograms.reduce(
          (prev, curr) => {
            return (
              prev +
              (curr.participant?.totalClaimableCommissionsAndClaimableRewards ||
                0)
            );
          },
          0,
        );
      });

      const disabledClaim = !flagsStore.state.rewardClaims || !!lmClaim.value;

      /*
        Utilize if there is large rollover between distribution times 
        & claims need to be disabled during distributions
         ||
        !rewardProgramResponse.data.value?.rewardPrograms.some(
          (p) => p.participant?.totalClaimableCommissionsAndClaimableRewards,
        );
      */
      return (
        <Layout>
          <PageCard
            class="w-[810px]"
            heading="Rewards"
            iconName="navigation/rewards"
            headerAction={
              <div class="flex items-center">
                <label class="flex items-center mr-[16px] opacity-80">
                  <input
                    type="checkbox"
                    class="mr-[4px]"
                    checked={showAllRef.value}
                    onChange={(e) => (showAllRef.value = e.target.checked)}
                  />
                  Show Inactive
                </label>
                <Button.Inline
                  onClick={() => {
                    if (disabledClaim) return;
                    if (
                      window.location.hostname !== "dex.sifchain.finance" &&
                      AppCookies().getEnv() === NetworkEnv.MAINNET &&
                      !window.confirm(
                        "Are you sure you want to claim rewards on your mainnet account? It seems like you're testing this feature. If so, please be sure to do this on a dedicated betanet test wallet. Press 'cancel' to exit or 'ok' to continue",
                      )
                    ) {
                      alert("claim canceled.");
                      return;
                    }
                    claimRewardType.value = "lm";
                    isClaimModalOpened.value = true;
                  }}
                  class={[
                    "!h-[40px] px-[17px] text-md relative",
                    disabledClaim &&
                      "!text-accent-base !bg-gray-action_button !bg-none !cursor-default opacity-75",
                  ]}
                  icon={
                    !!lmClaim.value
                      ? "interactive/saturday"
                      : "navigation/rewards"
                  }
                  iconClass={
                    !!lmClaim.value &&
                    "!w-[24px] !h-[24px] transform translate-y-[1px]"
                  }
                  active
                >
                  {!!lmClaim.value
                    ? "Pending Claim"
                    : `Claim ${getClaimableAmountString(
                        totalClaimableRef.value,
                      )} Rowan`}
                  {!!lmClaim.value && (
                    <Button.InlineHelp
                      size={16}
                      class="absolute top-[-8px] right-[-8px]"
                    >
                      You will be able to claim additional rewards after the
                      dispensation run each Tuesday
                    </Button.InlineHelp>
                  )}
                </Button.Inline>
              </div>
            }
            headerContent={
              <>
                <div class="flex items-center mt-[10px]">
                  <div class="bg-gray-100 px-[20px] py-[10px] rounded mr-[6px] flex-1">
                    <div class="font-lg text-accent-base font-semibold">
                      Claimed - Pending Dispensation
                    </div>
                    <div class="pt-[4px] text-sm opacity-50">
                      Amount claimed, to be dispensed by Tuesday evening PST
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
                  <div class="bg-gray-100 px-[20px] py-[10px] rounded ml-[6px] flex-1">
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
                </div>
                <p class="mt-[10px]">
                  Earn rewards by participating in any of our rewards-earning
                  programs. Please see additional information of our{" "}
                  <a
                    href="https://docs.sifchain.finance/resources/rewards-programs"
                    rel="noopener noreferrer"
                    target="_blank"
                    class="underline"
                  >
                    current rewards program
                  </a>{" "}
                  and how to become eligible.
                </p>
                <div class="w-full pb-[5px] mt-[12px] mb-[-5px] w-full flex items-center justify-start opacity-50 text-md">
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
              </>
            }
          >
            {isClaimModalOpened.value &&
              rewardProgramResponse.data.value?.rewardPrograms.some(
                (p) => p.summaryAPY !== null,
              ) && (
                <ClaimRewardsModal
                  address={address.value}
                  rewardType={
                    claimRewardType.value as CryptoeconomicsRewardType
                  }
                  summaryAPY={summaryApyRef.value}
                  rewardPrograms={
                    rewardProgramResponse.data.value.rewardPrograms
                  }
                  onClose={() => {
                    isClaimModalOpened.value = false;
                    reloadClaims();
                  }}
                />
              )}

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
                      ?.claimedCommissionsAndRewardsAwaitingDispensation || 0) >
                      0 ||
                    (program.participant
                      ?.totalClaimableCommissionsAndClaimableRewards || 0) > 0
                  );
                })
                .sort((a, b) => {
                  const aIsCurrent = new Date() < new Date(a.endDateTimeISO);
                  const bIsCurrent = new Date() < new Date(b.endDateTimeISO);
                  return +bIsCurrent - +aIsCurrent;
                })
                .map((program, index, items) => {
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

            {/* 
            <div class="my-[16px] border border-dashed border-white opacity-40" />
            <SunsetRewardSection
              rewardType="lm"
              data={lmData.value}
              alreadyClaimed={!!vsClaim.value}
              infoLink={lmInfoLink.value}
              onClaimIntent={() => {
                claimRewardType.value = "lm";
                isClaimModalOpened.value = true;
              }}
            />
            <div class="my-[16px] border border-dashed border-white opacity-40" />
            <SunsetRewardSection
              rewardType="vs"
              data={vsData.value}
              alreadyClaimed={!!lmClaim.value}
              infoLink={vsInfoLink.value}
              onClaimIntent={() => {
                claimRewardType.value = "vs";
                isClaimModalOpened.value = true;
              }}
            /> */}

            <div class="h-1" />
          </PageCard>
        </Layout>
      );
    };
  },
});
