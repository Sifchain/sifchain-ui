import { defineComponent, HtmlHTMLAttributes, PropType } from "vue";

import { useCurrentRouteBannerMessage } from "@/hooks/useCurrentRouteBannerMessage";
import BetaWarningBanner from "@/components/BetaWarningBanner";

import LayoutBackground from "./LayoutBackground";

export default defineComponent({
  name: "Layout",
  props: {
    onScroll: {
      type: Function as PropType<HtmlHTMLAttributes["onScroll"]>,
      default: () => {},
    },
  },
  setup(props, context) {
    const bannerMessageRef = useCurrentRouteBannerMessage();

    return () => (
      <>
        <div
          class="left-sidebar bg-gray-background absolute top-0 right-0 bottom-0 flex justify-center overflow-y-scroll bg-black bg-opacity-40 sm:left-0"
          onScroll={props.onScroll as HtmlHTMLAttributes["onScroll"]}
        >
          {context.slots.default?.()}
          <div id="modal-target"></div>

          {!!bannerMessageRef.value && (
            <div class="bg-info-base absolute top-0 left-0 right-0 flex items-center justify-center overflow-visible p-[12px] px-[100px] pr-[200px] text-white">
              <p>{bannerMessageRef.value}</p>
            </div>
          )}
        </div>
        <BetaWarningBanner />
        <LayoutBackground />
      </>
    );
  },
});
