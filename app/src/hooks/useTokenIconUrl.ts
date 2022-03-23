import { useCore } from "@/hooks/useCore";
import { computed, ref } from "@vue/reactivity";
import { Ref } from "vue";

// const icons = ((ctx) => {
//   const keys = ctx.keys();
//   const values = keys.map(ctx);
//   return keys.reduce((o, k, i) => {
//     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//     // @ts-ignore
//     const tokenSymbol = k
//       .split("./")
//       .join("")
//       .split(".svg")
//       .join("")
//       .toLowerCase();
//     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//     // @ts-ignore
//     o[tokenSymbol] = values[i];
//     return o;
//   }, {});
// })(require.context("@/assets/icons/tokens", true, /.*/)) as Record<
//   string,
//   string
// >;

export const useTokenIconUrl = (props: { symbol: Ref<string> }) => {
  const core = useCore();
  const svgIconsUrl = computed(() => {
    return "";
    // return (
    //   icons[props.symbol.value] ??
    //   icons[props.symbol.value.replace(/^c/, "")] ??
    //   icons["e" + props.symbol.value]
    // );
  });
  const coinGeckoIconUrl = computed(() => {
    return core.config.assets
      .find((a) => a.symbol == props.symbol.value)
      ?.imageUrl?.replace("thumb", "large");
  });
  return svgIconsUrl.value ? svgIconsUrl : coinGeckoIconUrl;
};
