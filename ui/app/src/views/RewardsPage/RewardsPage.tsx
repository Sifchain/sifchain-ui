import { defineComponent, ref } from "vue";
import PageCard from "@/components/PageCard";
import { useRewardsPageData } from "./useRewardsPageData";
import AssetIcon from "@/components/AssetIcon";
import { RewardSection } from "./components/RewardSection";
import ClaimRewardsModal from "./components/ClaimRewardsModal";
import { CryptoeconomicsRewardType } from "@sifchain/sdk/src/services/CryptoeconomicsService";
import Layout from "@/componentsLegacy/Layout/Layout.vue";

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
        <Layout>
          <PageCard
            class="w-[790px]"
            heading="Rewards"
            iconName="navigation/rewards"
          >
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
        </Layout>
      );
    };
  },
});
