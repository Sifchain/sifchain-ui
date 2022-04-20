import { computed } from "vue";
import { useQuery } from "vue-query";
import { useRoute } from "vue-router";

const CHANGES_SERVER_ENDPOINT =
  "https://sifchain-changes-server.vercel.app/api/banners";

type RouteKey = "/swap" | "/balances" | "/pool" | "/rewards" | "/stats";

type BannersResponse = Record<RouteKey, string> & {
  meta: Record<
    RouteKey,
    {
      fullScreen: boolean;
      dismissable: boolean;
    }
  >;
};

export const useCurrentRouteBannerMessage = () => {
  const route = useRoute();

  const bannersRes = useQuery("banners", async (): Promise<BannersResponse> => {
    const res = await fetch(CHANGES_SERVER_ENDPOINT);

    try {
      return res.json() as Promise<BannersResponse>;
    } catch (error) {
      return {} as BannersResponse;
    }
  });

  const currentMessage = computed(() => {
    if (!bannersRes.data.value) {
      return null;
    }

    const matchingKey = Object.keys(bannersRes.data.value || {}).find((key) =>
      route.path.startsWith(key),
    ) as RouteKey | undefined;

    if (
      matchingKey &&
      matchingKey in bannersRes.data.value &&
      Boolean(bannersRes.data.value[matchingKey])
    ) {
      const meta = bannersRes.data.value.meta[matchingKey];
      const message = bannersRes.data.value[matchingKey];
      return { message, meta };
    }
    return null;
  });

  return currentMessage;
};
