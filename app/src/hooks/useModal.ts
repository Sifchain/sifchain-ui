import { computed, reactive } from "vue";
import { useRoute } from "vue-router";

type RouteModalId = "import" | "connect";

export function createRouteModal<Key, Props>(routeKey: Key, routeProps: Props) {
  const route = useRoute();

  const state = reactive<RouteModalState>({
    stack: [],
  });
}
