import PageCard from "@/components/PageCard";
import { Component, defineComponent, PropType } from "vue";
import { usePoolPageData } from "./usePoolPageData";

export default defineComponent({
  name: "PoolPage",
  props: {},
  setup() {
    // const data = usePoolPageData();
    return () => {
      return (
        <PageCard
          heading="Pool"
          iconName="navigation/pool"
          headerAction={<button>Add Liquidity</button>}
        ></PageCard>
      );
    };
  },
});
