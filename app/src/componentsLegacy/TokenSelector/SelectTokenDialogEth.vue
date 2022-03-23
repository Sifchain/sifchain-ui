<script lang="ts">
import { Asset } from "@sifchain/sdk";
import { defineComponent, PropType } from "vue";
import { useCore } from "../../hooks/useCore";
import { generateTokenSearchLists } from "./tokenLists";
import SelectTokenDialog from "./SelectTokenDialog.vue";

export default defineComponent({
  components: { SelectTokenDialog },
  props: {
    selectedTokens: Array as PropType<string[]>,
  },
  emits: ["tokenselected"],
  setup(_, context) {
    const { displayList, fullSearchList } = generateTokenSearchLists({
      walletTokens: useCore()
        .store.wallet.get(Network.ETHEREUM)
        .balances.map((tok) => tok.asset),
    });

    function selectToken(symbol: string) {
      context.emit("tokenselected", symbol);
    }

    return { selectToken, displayList, fullSearchList };
  },
});
</script>
<template>
  <SelectTokenDialog
    :displayList="displayList"
    :fullSearchList="fullSearchList"
    :selectedTokens="selectedTokens"
    @tokenselected="selectToken"
  />
</template>
