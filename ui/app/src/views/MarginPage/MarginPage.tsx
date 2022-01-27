import PageCard from "@/components/PageCard";
import Layout from "@/componentsLegacy/Layout/Layout";
import { useNativeChain } from "@/hooks/useChains";
import { NativeDexClient } from "@sifchain/sdk/src/clients";
import { defineComponent, onMounted, onUnmounted, ref } from "vue";

import * as MarginV1Types from "@sifchain/sdk/src/generated/proto/sifnode/margin/v1/types";
import * as CLPV1Types from "@sifchain/sdk/src/generated/proto/sifnode/clp/v1/types";
import { prettyNumber } from "@/utils/prettyNumber";
import { AssetAmount, formatAssetAmount } from "@sifchain/sdk";
import { TokenIcon } from "@/components/TokenIcon";
import { TokenNetworkIcon } from "@/components/TokenNetworkIcon/TokenNetworkIcon";

export default defineComponent({
  name: "MarginPage",
  props: {},
  setup() {
    const poolsRef = ref<CLPV1Types.Pool[]>([]);

    const nativeDexClientPromise = NativeDexClient.connectByChain(
      useNativeChain(),
    );

    let poolTimeout: NodeJS.Timeout;
    (async function fetchPools() {
      console.log("HELLOOP!!!");
      const client = await nativeDexClientPromise;
      const res = await client.query.clp.GetPools({});
      poolsRef.value = res.pools;
      poolTimeout = setTimeout(fetchPools, 10 * 1000);

      console.log("HELLO", res, res.pools, poolsRef.value);
    })();

    onUnmounted(() => {
      clearTimeout(poolTimeout);
    });

    return {
      pools: poolsRef,
    };
  },
  render() {
    return (
      <Layout>
        <PageCard heading="Margin" iconName="navigation/globe">
          <h1>Margin Pools</h1>
          <ul>
            {this.pools
              .filter((pool) => pool.externalAsset)
              .map((pool) => {
                const asset = useNativeChain().forceGetAsset(
                  pool.externalAsset!.symbol,
                );
                return (
                  <li
                    key={pool.externalAsset!.symbol}
                    class="cursor-pointer font-mono w-full p-2 my-2 border border-solid border-white font-medium font-sans group-hover:opacity-80"
                  >
                    <div class="flex items-center">
                      <TokenIcon
                        assetValue={useNativeChain().forceGetAsset("rowan")}
                        size={22}
                      />
                      <TokenNetworkIcon
                        assetValue={asset}
                        size={22}
                        class="ml-[4px]"
                      />
                      <div class="ml-[10px] uppercase font-sans ">
                        <b>ROWAN / {asset.displaySymbol.toUpperCase()}</b>
                      </div>
                    </div>
                    <div>
                      {asset.displaySymbol.toUpperCase()} Liabilities:{" "}
                      {formatAssetAmount(
                        AssetAmount(asset, pool.externalLiabilities),
                      )}
                    </div>
                    <div>
                      {asset.displaySymbol.toUpperCase()} Custody:{" "}
                      {pool.externalCustody}
                    </div>
                    <div>
                      ROWAN Liabilities:{" "}
                      {formatAssetAmount(
                        AssetAmount("rowan", pool.nativeLiabilities),
                      )}
                    </div>
                    <div>
                      ROWAN Custody:{" "}
                      {formatAssetAmount(
                        AssetAmount("rowan", pool.nativeCustody),
                      )}
                    </div>
                    <div>Health: {pool.health}</div>
                    <div>Interest Rate: {pool.externalCustody}</div>
                  </li>
                );
              })}
          </ul>
        </PageCard>
      </Layout>
    );
  },
});
