import clsx from "clsx";
import { computed, defineComponent, ref } from "vue";

import { useCurrentRouteBannerMessage } from "~/hooks/useCurrentRouteBannerMessage";

import Button from "./Button";

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

export default defineComponent({
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

      return Boolean(
        JSON.parse(localStorage.getItem(messageHash.value) ?? "false"),
      );
    });

    function dismissAlert() {
      if (!messageHash.value) return;

      uiDismissed.value = true;
    }

    function dontShowAgain() {
      if (!messageHash.value) return;

      uiDismissed.value = true;
      localStorage.setItem(messageHash.value, "true");
    }

    const actions = [
      {
        label: "Don't show this again",
        onClick: dontShowAgain,
      },
      {
        label: "Dismiss",
        onClick: dismissAlert,
      },
    ];

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
          <div class="absolute bottom-1 right-1 flex">
            {actions.map(({ label, onClick }) => (
              <Button.Inline
                key={label}
                onClick={onClick}
                class="hover:text-accent-light !bg-transparent font-semibold !text-white underline"
              >
                {label}
              </Button.Inline>
            ))}
          </div>
          <p class="max-w-6xl pr-8">{bannerMessageRef.value.message}</p>
        </div>
      );
  },
});
