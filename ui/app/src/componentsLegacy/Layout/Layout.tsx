import BetaWarningBanner from "@/components/BetaWarningBanner";
import { VotingModal } from "@/components/VotingModal/VotingModal";
import { useCurrentRouteBannerMessage } from "@/hooks/useCurrentRouteBannerMessage";
import { flagsStore } from "@/store/modules/flags";
import { AssetAmount } from "@sifchain/sdk";
import { defineComponent } from "vue";
import { useRoute } from "vue-router";
import LayoutBackground from "./LayoutBackground";

export default defineComponent({
  name: "Layout",
  setup(props, context) {
    const bannerMessageRef = useCurrentRouteBannerMessage();

    return () => (
      <>
        <div class="flex absolute justify-center sm:left-0 left-sidebar top-0 right-0 bottom-0 bg-gray-background overflow-y-scroll bg-black bg-opacity-40">
          {context.slots.default?.()}
          <div id="modal-target"></div>
          <BetaWarningBanner />
          {!!bannerMessageRef.value && (
            <div class="flex absolute top-0 left-0 right-0 items-center justify-center bg-info-base text-white p-[12px] px-[100px] pr-[200px] overflow-visible">
              <p>{bannerMessageRef.value}</p>
            </div>
          )}
        </div>
        <LayoutBackground />
      </>
    );
  },
});
