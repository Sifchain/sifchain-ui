import clsx from "clsx";
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
          <div id="modal-target" />

          {bannerMessageRef.value && (
            <div
              class={clsx(
                "bg-info-base/60 z-10 p-2 font-semibold text-white backdrop-blur-md",
                {
                  "absolute left-0 right-0 md:p-4":
                    !bannerMessageRef.value?.meta?.fullScreen,
                  "fixed inset-0 grid h-screen place-items-center text-lg md:p-24":
                    bannerMessageRef.value?.meta?.fullScreen,
                  "pointer-events-none": "",
                },
              )}
            >
              <p class="max-w-6xl">{bannerMessageRef.value.message}</p>
            </div>
          )}
        </div>
        <BetaWarningBanner />
        <LayoutBackground />
      </>
    );
  },
});
