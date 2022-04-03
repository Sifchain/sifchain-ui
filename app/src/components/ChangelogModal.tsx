import { defineComponent, onMounted, PropType } from "vue";

import Modal from "@/components/Modal";
import { useAsyncData } from "@/hooks/useAsyncData";

import Button from "./Button";

const VITE_APP_SHA = import.meta.env.VITE_APP_SHA || "master";
const VITE_APP_VERSION = import.meta.env.VITE_APP_VERSION || "0.0.1.local";

type ChangelogData = { version: string; changelog: string };

const fetchChangelogData = async (): Promise<ChangelogData> => {
  const res = await fetch(
    `https://sifchain-changes-server.vercel.app/api/changes/${VITE_APP_SHA}`,
  );
  const json = (await res.json()) as { version: string; changelog: string };
  return {
    version: json.version,
    changelog: json.changelog,
  };
};

let changelogDataPromise: undefined | Promise<ChangelogData>;
const maybeFetchChangelogData = async () => {
  if (!changelogDataPromise) {
    changelogDataPromise = fetchChangelogData();
  }
  return changelogDataPromise;
};

// It's a low pri request, but if we can cache it before user
// opens the modal, that'd be nice.
if (typeof window !== "undefined") {
  setTimeout(maybeFetchChangelogData, 5000);
}

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
    const res = useAsyncData(maybeFetchChangelogData);

    onMounted(() => {
      changelogViewedVersion.setLatest();
    });

    return () => {
      if (res.isLoading.value) return null;
      return (
        <Modal
          heading="Changelog"
          icon="navigation/changelog"
          showClose
          onClose={props.onClose}
        >
          <div class="w-[calc(100% + 4px)] max-h-[70vh] overflow-y-scroll">
            <div
              class="css-unreset text-left"
              innerHTML={res.data.value?.changelog || ""}
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
