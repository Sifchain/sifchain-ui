import { useAssetItem } from "@/componentsLegacy/shared/utils";
import { computed, ref, Ref, toRefs } from "@vue/reactivity";
import { PoolStat, PoolStatsResponseData, usePoolStats } from "./usePoolStats";

// NOTE - this will be replaced by format display function
function format(item: string) {
  if (item !== "") {
    return parseFloat(item).toFixed(2) + "%";
  } else {
    return "N/A";
  }
}
export const usePoolStatItem = (props: { pool: Ref<PoolStat | undefined> }) => {
  function formatNumberString(x: string) {
    const parts = x.split(".");
    return new Intl.NumberFormat("en-us", {
      maximumFractionDigits: parts.length < 2 ? 0 : parts[1].length,
    }).format(+x);
    // return x.replace(/\B(?=(?=\d*\.)(\d{3})+(?!\d))/g, ",");
  }

  const info = computed(() => {
    const symbol = props.pool.value?.symbol ?? "";
    const asset = useAssetItem(ref(symbol));
    const token = asset.token;
    const image = !token.value ? "" : token.value.imageUrl;
    const priceToken = formatNumberString(
      parseFloat(props.pool.value?.priceToken || "0").toFixed(2),
    );
    const arb = props.pool.value?.arb;
    const poolDepth = formatNumberString(
      parseFloat(props.pool.value?.poolDepth || "0").toFixed(2),
    );
    const volume = formatNumberString(
      parseFloat(props.pool.value?.volume || "0").toFixed(1),
    );
    const poolAPY = formatNumberString(
      (
        (parseFloat(props.pool.value?.volume || "0") /
          parseFloat(props.pool.value?.poolDepth || "0")) *
        100
      ).toFixed(1),
    );
    return {
      priceToken,
      arb,
      poolDepth,
      volume,
      poolAPY: props.pool.value?.poolAPY,
      rewardAPY: props.pool.value?.rewardAPY,
      image,
    };
  });

  return info;
};
