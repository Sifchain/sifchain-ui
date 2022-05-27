import { computed, defineComponent, PropType, ref } from "vue";
import { useRouter } from "vue-router";

import AssetPair from "~/components/AssetPair";
import { ElementOf } from "~/utils/types";
import { PoolDataArray } from "../usePoolPageData";
import MyPoolStats from "./MyPoolStats";
import PoolStats from "./PoolStats";

export default defineComponent({
  name: "PoolCard",
  props: {
    context: {
      type: Object as PropType<ElementOf<PoolDataArray>>,
      required: true,
    },
  },
  setup(props) {
    const router = useRouter();

    const contextRef = computed(() => props.context);

    return () => (
      <li
        role="button"
        class="bg-gray-sif800 flex h-[312px] flex-col gap-2 overflow-hidden rounded-lg"
        onClick={() => {
          router.push({
            name: "PoolDetails",
            params: {
              poolId: contextRef.value.pool.symbol(),
            },
          });
        }}
      >
        {contextRef.value.accountPool ? (
          <MyPoolStats context={props.context} />
        ) : (
          <>
            <header class="flex items-center p-4">
              <AssetPair
                asset={ref(contextRef.value.pool.externalAmount.asset)}
                invert
              />
            </header>
            <main class="bg-gray-sif850 flex flex-1">
              <PoolStats context={props.context} />
            </main>
          </>
        )}
      </li>
    );
  },
});
