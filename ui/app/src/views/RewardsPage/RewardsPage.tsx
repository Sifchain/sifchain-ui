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
      vsClaim,
      lmClaim,
      vsInfoLink,
      lmInfoLink,
      address,
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
          >
            {isClaimModalOpened.value && data.summaryAPY.value != null && (
              <ClaimRewardsModal
                address={address.value}
                rewardType={claimRewardType.value as CryptoeconomicsRewardType}
                summaryAPY={data.summaryAPY.value}
                userData={
                  claimRewardType.value === "vs" ? vsData.value : lmData.value
                }
                onClose={() => (isClaimModalOpened.value = false)}
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
              rewardType="lm"
              data={lmData.value}
              alreadyClaimed={!!lmClaim.value}
              infoLink={lmInfoLink.value}
              onClaimIntent={() => {
                claimRewardType.value = "lm";
                isClaimModalOpened.value = true;
              }}
            />
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
            />

            <div class="h-4" />
          </PageCard>
        </Layout>
      );
    };
  },
});
