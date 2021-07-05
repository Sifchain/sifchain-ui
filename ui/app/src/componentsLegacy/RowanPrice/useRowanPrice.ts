import { useAsyncData } from "@/hooks/useAsyncData";
import { watchEffect } from "vue";

export const useRowanPrice = () => {
  const price = useAsyncData(async () => {
    function isNumeric(s: any) {
      return s - 0 == s && ("" + s).trim().length > 0;
    }
    const data = await fetch(
      "https://vtdbgplqd6.execute-api.us-west-2.amazonaws.com/default/tokenstats",
    );
    const json = await data.json();
    const rowanPriceInUSDT = json.body ? json.body.rowanUSD : "";

    if (isNumeric(rowanPriceInUSDT)) {
      return parseFloat(rowanPriceInUSDT).toPrecision(6);
    }
  });

  watchEffect(() => {
    const i = setInterval(() => price.reload(), 10000);
    return () => {
      clearInterval(i);
    };
  });

  return price;
};
