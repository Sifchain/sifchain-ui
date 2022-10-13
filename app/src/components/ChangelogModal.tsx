import { defineComponent, onMounted, PropType } from "vue";

import Modal from "~/components/Modal";
import useChangeLog from "~/hooks/useChangeLog";

import Button from "./Button";

const VITE_APP_VERSION = String(
  import.meta.env.VITE_APP_VERSION || "0.0.1.local",
);

export const changelogViewedVersion = {
  get() {
    return localStorage.getItem("changelogViewedVersion");
  },
  setLatest() {
    localStorage.setItem("changelogViewedVersion", String(VITE_APP_VERSION));
  },
  isLatest() {
    return VITE_APP_VERSION === this.get();
  },
};

export default defineComponent({
  name: "ChangelogModal",
  props: {
    onClose: { type: Function as PropType<() => void>, required: true },
  },
  setup(props) {
    const changelog = useChangeLog();

    onMounted(() => {
      changelogViewedVersion.setLatest();
    });

    return () => {
      if (changelog.isLoading.value) {
        return null;
      }

      return (
        <Modal
          heading="Changelog"
          icon="navigation/changelog"
          showClose
          onClose={() => props.onClose?.()}
        >
          <div class="w-[calc(100% + 4px)] max-h-[70vh] overflow-y-scroll">
            <div
              class="prose prose-invert text-left"
              innerHTML={changelog.data.value?.changelog || ""}
            />
            <div class="h-[16px] w-full" />
          </div>
          <Button.CallToAction onClick={props.onClose}>
            Close
          </Button.CallToAction>
        </Modal>
      );
    };
  },
});
