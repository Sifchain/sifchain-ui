import { useAsyncData } from "@/hooks/useAsyncData";

export const useTVL = () => {
  return useAsyncData(() => loadTVL());
};

async function loadTVL() {
  function isNumeric(s: any) {
    return s - 0 == s && ("" + s).trim().length > 0;
  }

  function formatNumberString(x: string) {
    const parts = x.split(".");
    return new Intl.NumberFormat("en-us", {
      maximumFractionDigits: parts.length < 2 ? 0 : parts[1].length,
    }).format(+x);
    // return x.replace(/\B(?=(?=\d*\.)(\d{3})+(?!\d))/g, ",");
  }

  const data = await fetch(
    "https://data.sifchain.finance/beta/asset/tokenStats",
  );
  const json = await data.json();
  const pools = json.body ? json.body.pools : "";
  if (!pools || pools.length < 1) {
    return "";
  }

  let total = 0.0;
  pools.map((p: any) => {
    const depth = p.poolDepth;
    if (isNumeric(depth)) {
      total += parseFloat(depth) * 2;
    }
  });

  const tlv = "$" + formatNumberString(total.toFixed(1));
  console.log("JSON!", json);

  return tlv.substring(0, tlv.length - 2);
}
