import Layout from "@/components/Layout";
import { defineComponent } from "vue";
import { useRoute } from "vue-router";

import PageCard from "~/components/PageCard";

export default defineComponent({
  name: "PoolDetailsPage",
  setup() {
    const route = useRoute();
    const poolId = String(route.params["poolId"])
      .toUpperCase()
      .replace("_", "-");

    return () => {
      return (
        <Layout>
          <PageCard withBackButton breadCrumbs={["Pools", poolId]}>
            Pool details
          </PageCard>
        </Layout>
      );
    };
  },
});
