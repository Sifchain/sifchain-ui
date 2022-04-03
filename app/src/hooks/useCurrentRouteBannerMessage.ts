import { computed } from "vue";
import { useRoute } from "vue-router";

import { useAsyncDataCached } from "./useAsyncDataCached";

const CHANGES_SERVER_ENDPOINT =
  "https://sifchain-changes-server.vercel.app/api/banners";

export const useCurrentRouteBannerMessage = () => {
  const route = useRoute();

  const bannersRes = useAsyncDataCached("banners", async () => {
    const res = await fetch(CHANGES_SERVER_ENDPOINT);

    try {
      return res.json();
    } catch (error) {
      return {};
    }
  });

  const currentMessage = computed(() => {
    const matchingKey = Object.keys(bannersRes.data.value || {}).find((key) =>
      route.path.startsWith(key),
    );
    if (matchingKey && matchingKey in bannersRes.data.value) {
      return bannersRes.data.value[matchingKey] as string;
    }
    return null;
  });

  return currentMessage;
};
