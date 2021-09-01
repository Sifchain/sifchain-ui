import Modal from "@/components/Modal";
import { useAsyncData } from "@/hooks/useAsyncData";
import { defineComponent, onMounted } from "vue";
import { PropType } from "vue";
import { Button } from "./Button/Button";

const VITE_APP_SHA = import.meta.env.VITE_APP_SHA || "develop";
const VITE_APP_VERSION = import.meta.env.VITE_APP_VERSION || "0.0.0.local";

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
    localStorage.setItem("changelogViewedVersion", VITE_APP_VERSION);
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
          <div
            class="css-unreset"
            innerHTML={res.data.value?.changelog || ""}
          />
          <div class="w-full h-[16px]" />
          <Button.CallToAction onClick={props.onClose}>
            Close
          </Button.CallToAction>
        </Modal>
      );
    };
  },
});
