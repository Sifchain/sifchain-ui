import Layout from "@/components/Layout";
import PageCard from "@/components/PageCard";
import { defineComponent } from "vue";
import { RouterLink } from "vue-router";

export default defineComponent({
  name: "RewardsPage",
  props: {},
  setup() {
    return () => (
      <Layout>
        <PageCard
          class="w-[1000px]"
          heading="Rewards"
          iconName="navigation/rewards"
        >
          <p class="text-md pt-1 pb-3">
            Rewards have moved! Visit the{" "}
            <RouterLink class="text-accent-dark" to="pool">
              Pools
            </RouterLink>{" "}
            or{" "}
            <RouterLink class="text-accent-dark" to="stats">
              Pool Stats
            </RouterLink>{" "}
            pages to see your rewards
          </p>
        </PageCard>
      </Layout>
    );
  },
});
