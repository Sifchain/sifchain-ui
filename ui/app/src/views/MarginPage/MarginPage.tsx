import PageCard from "@/components/PageCard";
import Layout from "@/componentsLegacy/Layout/Layout";
import { useNativeChain } from "@/hooks/useChains";
import { NativeDexClient } from "@sifchain/sdk/src/clients";
import { defineComponent, onMounted, onUnmounted, ref, watch } from "vue";

import * as MarginV1Types from "@sifchain/sdk/src/generated/proto/sifnode/margin/v1/types";
import * as CLPV1Types from "@sifchain/sdk/src/generated/proto/sifnode/clp/v1/types";
import { prettyNumber } from "@/utils/prettyNumber";
import { AssetAmount, formatAssetAmount } from "@sifchain/sdk";
import { TokenIcon } from "@/components/TokenIcon";
import { TokenNetworkIcon } from "@/components/TokenNetworkIcon/TokenNetworkIcon";
import { marginStore } from "@/store/modules/margin";
import { Card } from "@/components/Card";
import { MarginPosition } from "./MarginPosition";
import { accountStore } from "@/store/modules/accounts";
import { POSITION_COLUMNS } from "./data";
import { Button } from "@/components/Button/Button";
import { MarginPool } from "./MarginPool";

const poll = (fn: () => Promise<unknown>, intervalMs = 10000) => {
  let timeout: NodeJS.Timeout;
  (async function runPoll() {
    await fn();
    timeout = setTimeout(runPoll, intervalMs);
  })();
  return () => {
    clearTimeout(timeout);
  };
};

export default defineComponent({
  name: "MarginPage",
  props: {},
  setup() {
    const poolsRef = ref<CLPV1Types.Pool[]>([]);

    const nativeDexClientPromise = NativeDexClient.connectByChain(
      useNativeChain(),
    );

    const unsubscribeFns = [
      poll(() => marginStore.fetchPools(), 10_000),
      poll(() => marginStore.fetchAccountPositions(), 10_000),
    ];

    watch(accountStore.refs.sifchain.address.computed(), (address: string) => {
      if (address) {
        marginStore.fetchAccountPositions();
      }
    });

    onUnmounted(() => {
      unsubscribeFns.forEach((fn) => fn());
    });
  },
  render() {
    return (
      <Layout>
        <PageCard heading="Margin" iconName="navigation/globe">
          {accountStore.state.sifchain.address && (
            <Card heading="Your Positions" class="mb-3">
              <div class="w-full pb-[5px] w-full flex items-center">
                {POSITION_COLUMNS.map((column) => (
                  <div
                    key={column.id}
                    class={[column.class, "opacity-50 flex items-center"]}
                  >
                    {column.name}
                    {column.help && (
                      <Button.InlineHelp>{column.help}</Button.InlineHelp>
                    )}
                  </div>
                ))}
              </div>
              {marginStore.state.positions.map((position, index) => (
                <MarginPosition key={index} position={position} />
              ))}
            </Card>
          )}
          <Card heading="Margin Pools">
            {marginStore.state.pools
              .filter((pool) => pool.externalAsset)
              .map((pool) => (
                <MarginPool pool={pool} key={pool.externalAsset!.symbol} />
              ))}
          </Card>
          <div class="h-2" />
        </PageCard>
      </Layout>
    );
  },
});
