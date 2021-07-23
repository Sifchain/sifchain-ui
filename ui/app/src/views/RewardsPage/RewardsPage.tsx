import { defineComponent, ref } from "vue";
import PageCard from "@/components/PageCard";
import { useRewardsPageData } from "./useRewardsPageData";
import AssetIcon from "@/components/AssetIcon";
import { RewardSection } from "./components/RewardSection";
import ClaimRewardsModal from "./components/ClaimRewardsModal";
import { CryptoeconomicsRewardType } from "@sifchain/sdk/src/services/CryptoeconomicsService";

export default defineComponent({
  name: "RewardsPage",
  props: {},
  setup(props) {
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
    } = useRewardsPageData({ address: "" });

    const isClaimModalOpened = ref(false);
    const claimRewardType = ref("vs");

    return () => {
      if (isLoading.value) {
        return (
          <div class="absolute left-0 top-[180px] w-full flex justify-center">
            <div class="flex items-center justify-center bg-black bg-opacity-50 rounded-lg h-[80px] w-[80px]">
              <AssetIcon icon="interactive/anim-racetrack-spinner" size={64} />
            </div>
          </div>
        );
      }
      if (error.value) {
        return <div>Error! {error.value.message}</div>;
      }
      return (
        <PageCard
          class="w-[790px]"
          heading="Rewards"
          iconName="navigation/rewards"
        >
          {isClaimModalOpened.value && (
            <ClaimRewardsModal
              address={address.value}
              rewardType={claimRewardType.value as CryptoeconomicsRewardType}
              data={
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
            <div class="w-[250px] text-left">Reward Program</div>
            <div class="w-[200px] text-right">Projected Full Amount</div>
            <div class="flex-1 text-right">Claimable Amount</div>
          </div>

          <RewardSection
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
          <RewardSection
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
      );
    };
  },
});
