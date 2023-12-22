import { defineComponent } from "vue";

import Layout from "~/components/Layout";
import PageCard from "~/components/PageCard";

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
              With Sif’s Ascension, ROWAN rewards are injected directly into the
              pools and auto-compounded every block (~6 seconds). To learn more
              about Sif's Ascension and to access tools for tracking rewards,
              please visit our documents site{" "}
              <a
                class="text-accent-base hover:underline"
                href="https://docs.sifchain.network/sifchain/project/about-sifchain/community-run-tools-and-products"
                target="_blank"
                rel="noopener noreferrer"
              >
                here
              </a>
              .
            </p>
          </div>
        </PageCard>
      </Layout>
    );
  },
});
