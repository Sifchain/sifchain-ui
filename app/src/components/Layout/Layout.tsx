import clsx from "clsx";
import {
  computed,
  defineComponent,
  HtmlHTMLAttributes,
  PropType,
  ref,
} from "vue";

import { useCurrentRouteBannerMessage } from "@/hooks/useCurrentRouteBannerMessage";
import BetaWarningBanner from "@/components/BetaWarningBanner";

import LayoutBackground from "./LayoutBackground";
import Button from "../Button";

function hashCode(str: string) {
  let hash = 0;
  if (str.length == 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

const AlertBanner = defineComponent({
  name: "AlertBanner",
  setup() {
    const bannerMessageRef = useCurrentRouteBannerMessage();

    const isFullScreen = computed(
      () => bannerMessageRef.value?.meta.fullScreen,
    );
    const messageHash = computed(() =>
      !bannerMessageRef.value
        ? null
        : `sifalerts/${hashCode(bannerMessageRef.value.message).toString(16)}`,
    );

    const uiDismissed = ref(false);

    const isDismissed = computed(() => {
      if (!bannerMessageRef.value || !messageHash.value) {
        return false;
      }

      const dismissed = Boolean(
        JSON.parse(localStorage.getItem(messageHash.value) ?? "false"),
      );

      return dismissed;
    });

    function dismiss() {
      if (!messageHash.value) return;

      uiDismissed.value = true;
      localStorage.setItem(messageHash.value, "true");
    }

    return () =>
      !bannerMessageRef.value ||
      isDismissed.value ||
      uiDismissed.value ? null : (
        <div
          class={clsx(
            "bg-info-base/60 z-10 font-semibold text-white backdrop-blur-md",
            {
              "absolute left-0 right-0 p-4 pt-8": !isFullScreen.value,
              "fixed inset-0 grid h-screen place-items-center text-lg md:p-24":
                isFullScreen.value,
              "pointer-events-none": isFullScreen.value,
            },
          )}
        >
          <Button.Inline
            onClick={dismiss}
            icon="interactive/close"
            class="absolute bottom-1 right-1 !h-6 !w-6 rounded-full"
          />
          <p class="max-w-6xl pr-8">{bannerMessageRef.value.message}</p>
        </div>
      );
  },
});

export default defineComponent({
  name: "Layout",
  props: {
    onScroll: {
      type: Function as PropType<HtmlHTMLAttributes["onScroll"]>,
      default: () => {},
    },
  },
  setup(props, context) {
    return () => (
      <>
        <div
          class="left-sidebar bg-gray-background absolute top-0 right-0 bottom-0 flex justify-center overflow-y-scroll bg-black bg-opacity-40 sm:left-0"
          onScroll={props.onScroll as HtmlHTMLAttributes["onScroll"]}
        >
          {context.slots.default?.()}
          <div id="modal-target" />
          <AlertBanner />
        </div>
        <BetaWarningBanner />
        <LayoutBackground />
      </>
    );
  },
});
