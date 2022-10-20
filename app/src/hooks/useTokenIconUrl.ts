import { useCore } from "~/hooks/useCore";
import { computed } from "vue";
import { Ref } from "vue";

export const useTokenIconUrl = (props: { symbol: Ref<string> }) => {
  const core = useCore();

  const coinGeckoIconUrl = computed(() => {
    return core.config.assets
      .find((a) => a.symbol == props.symbol.value)
      ?.imageUrl?.replace("thumb", "large");
  });

  return coinGeckoIconUrl;
};
