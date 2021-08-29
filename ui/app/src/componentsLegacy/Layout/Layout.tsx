import BetaWarningBanner from "@/components/BetaWarningBanner";
import { AssetAmount } from "@sifchain/sdk";
import { defineComponent } from "@vue/runtime-core";
import LayoutBackground from "./LayoutBackground";

export default defineComponent({
  name: "Layout",
  setup(props, context) {
    return () => (
      <>
        <div class="flex absolute justify-center sm:left-0 left-sidebar top-0 right-0 bottom-0 bg-gray-background overflow-y-scroll bg-black bg-opacity-40">
          {context.slots.default?.()}
          <div id="modal-target"></div>
          <BetaWarningBanner />
        </div>
        <LayoutBackground />
      </>
    );
  },
});
