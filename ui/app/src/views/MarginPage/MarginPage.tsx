import PageCard from "@/components/PageCard";
import Layout from "@/componentsLegacy/Layout/Layout";
import { useNativeChain } from "@/hooks/useChains";
import { NativeDexClient } from "@sifchain/sdk/src/clients";
import { defineComponent, onMounted, onUnmounted, ref } from "vue";

import * as MarginV1Types from "@sifchain/sdk/src/generated/proto/sifnode/margin/v1/types";
import * as CLPV1Types from "@sifchain/sdk/src/generated/proto/sifnode/clp/v1/types";

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
          Hello
        </PageCard>
      </Layout>
    );
  },
});
