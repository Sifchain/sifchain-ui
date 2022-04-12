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
          <div class="grid place-items-center p-8">
            <p class="pt-1 pb-3 md:text-lg">
              Rewards have moved! Please visit the{" "}
              <RouterLink class="text-accent-dark" to="pool">
                Pools
              </RouterLink>{" "}
              page to see rewards.
            </p>
          </div>
        </PageCard>
      </Layout>
    );
  },
});
