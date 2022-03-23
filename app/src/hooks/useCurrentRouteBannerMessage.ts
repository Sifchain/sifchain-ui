import { computed } from "vue";
import { useRoute } from "vue-router";
import { useAsyncDataCached } from "./useAsyncDataCached";

export const useCurrentRouteBannerMessage = () => {
  const route = useRoute();

  const bannersRes = useAsyncDataCached("banners", async () => {
    const res = await fetch(
      "https://sifchain-changes-server.vercel.app/api/banners",
    );
    try {
      return res.json();
    } catch (error) {
      return {};
    }
  });

  const currentMessage = computed(() => {
    const matchingKey = Object.keys(bannersRes.data.value || {}).find((key) => {
      return route.path.startsWith(key);
    });
    if (matchingKey) {
      // @ts-ignore
      return bannersRes.data.value?.[matchingKey];
    }
  });

  return currentMessage;
};
