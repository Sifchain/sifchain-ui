import { defineComponent, ref } from "vue";
import PageCard from "@/components/PageCard";
import { useRewardsPageData } from "./useRewardsPageData";
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

// This one is for the chads
export default defineComponent({
  name: "RewardsPage",
  props: {},
  setup(props) {
    const data = useRewardsPageData();
    const {
      isLoading,
      error,
      vsData,
      lmData,
      lmHarvestData,
      vsClaim,
      lmClaim,
      vsInfoLink,
      lmInfoLink,
      address,
      reloadClaims,
    } = data;

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
      return (
        <Layout>
          <PageCard
            class="w-[790px]"
            heading="Rewards"
            iconName="navigation/rewards"
            headerAction={
              <Button.Inline
                onClick={() => {
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
                class={["!h-[40px] px-[17px] text-md"]}
                icon="navigation/rewards"
                active
                disabled={
                  !flagsStore.state.rewardClaims ||
                  !!lmClaim.value ||
                  !(
                    (lmData.value?.user
                      ?.totalClaimableCommissionsAndClaimableRewards || 0) +
                    (lmHarvestData.value?.user
                      ?.totalClaimableCommissionsAndClaimableRewards || 0)
                  )
                }
              >
                {!!lmClaim.value ? "Pending Claim" : "Claim Reward"}
              </Button.Inline>
            }
          >
            {isClaimModalOpened.value && data.summaryAPY.value != null && (
              <ClaimRewardsModal
                address={address.value}
                rewardType={claimRewardType.value as CryptoeconomicsRewardType}
                summaryAPY={data.summaryAPY.value}
                userData={
                  claimRewardType.value === "vs"
                    ? vsData.value
                    : lmHarvestData.value
                }
                onClose={() => {
                  isClaimModalOpened.value = false;
                  reloadClaims();
                }}
              />
            )}
            <p>
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

            <div class="mt-[21px] text-md opacity-50 flex">
              <div class="w-[150px] text-left">Reward Program</div>
              <div class="w-[100px] flex-1 text-right">
                Projected Full Amount
                <Tooltip
                  content={
                    <>
                      You will earn this if you leave all of your deposits
                      pooled for at least 6 weeks.
                    </>
                  }
                >
                  <Button.InlineHelp></Button.InlineHelp>
                </Tooltip>
              </div>
              <div class="w-[300px] text-right">
                Claimable Amount
                <Tooltip
                  content={
                    <>
                      These are rewards that you can claim now, but by doing so,
                      you will forfeit the remainder in your Projected Full
                      Amount
                      <div></div>
                      <br></br>
                    </>
                  }
                >
                  <Button.InlineHelp></Button.InlineHelp>
                </Tooltip>
              </div>
            </div>
            <RewardSection
              rewardType="lm_harvest"
              data={lmHarvestData.value}
              alreadyClaimed={!!lmClaim.value}
              infoLink={lmInfoLink.value}
              onClaimIntent={() => {
                claimRewardType.value = "lm";
                isClaimModalOpened.value = true;
              }}
            />
            <div class="my-[16px] border border-dashed border-white opacity-40" />
            <RewardSection
              rewardType="lm"
              data={lmData.value}
              alreadyClaimed={!!lmClaim.value}
              infoLink={lmInfoLink.value}
              onClaimIntent={() => {
                claimRewardType.value = "lm";
                isClaimModalOpened.value = true;
              }}
            />
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

            <div class="h-4" />
          </PageCard>
        </Layout>
      );
    };
  },
});
