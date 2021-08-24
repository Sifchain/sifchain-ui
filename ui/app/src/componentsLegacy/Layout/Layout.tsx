import BetaWarningBanner from "@/components/BetaWarningBanner";
import { AssetAmount } from "@sifchain/sdk";
import { defineComponent } from "@vue/runtime-core";

export default defineComponent({
  name: "Layout",
  setup(props, context) {
    return () => (
      <>
        <div class="flex absolute justify-center portrait:left-0 left-sidebar top-0 right-0 bottom-0 bg-gray-background overflow-y-scroll bg-black bg-opacity-40">
          {context.slots.default?.()}
          <div id="modal-target"></div>
          <BetaWarningBanner />
        </div>
        <div
          class="z-[-1] w-full h-[100vh] fixed top-0 left-0 transition duration-500"
          style={{
            transition: "background-image",
            backgroundImage: `url(${require("@/assets/background.webp")})`,
            backgroundSize: "cover",
            backgroundPosition: "top center",
            backgroundAttachment: "fixed",
            backgroundRepeat: "no-repeat",
          }}
        />
      </>
    );
  },
});
