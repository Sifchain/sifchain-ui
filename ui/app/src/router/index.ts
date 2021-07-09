import {
  createRouter,
  createWebHistory,
  RouteRecord,
  RouteRecordRaw,
} from "vue-router";

import Swap from "@/views/SwapPage/SwapPage";
import Balance from "@/views/BalancePage/BalancePage";
import StatsPage from "@/views/StatsPage.vue";
import StakeDelegatePage from "@/views/StakeDelegatePage.vue";
import CreatePool from "@/views/CreatePoolPage.vue";
import RemoveLiquidity from "@/views/RemoveLiquidityPage.vue";
import SinglePool from "@/views/SinglePool.vue";
import PegListingPage from "@/views/PegListingPage.vue";
import PegAssetPage from "@/views/PegAssetPage.vue";
import RewardsPage from "@/views/RewardsPage.vue";
import Pool from "@/views/PoolPage/PoolPage";

const routes = [
  {
    path: "/",
    redirect: { name: "Balances" },
  },
  {
    path: "/stats",
    name: "StatsPage",
    component: StatsPage,
  },
  {
    path: "/rewards",
    name: "RewardsPage",
    component: RewardsPage,
  },
  {
    path: "/stake-delegate",
    name: "StakeDelegatePage",
    component: StakeDelegatePage,
  },
  {
    path: "/swap",
    name: "Swap",
    component: Swap,
    meta: {
      title: "Swap - Sifchain",
    },
  },
  {
    path: "/pool",
    name: "Pool",
    component: Pool,
    meta: {
      title: "Pool - Sifchain",
    },
  },
  {
    path: "/pool/:externalAsset",
    name: "SinglePool",
    component: SinglePool,
    meta: {
      title: "Single Pool - Sifchain",
    },
  },
  {
    path: "/pool/add-liquidity/:externalAsset?",
    name: "AddLiquidity",
    component: CreatePool,
    props: {
      title: "Add Liquidity",
    },
    meta: {
      title: "Add Liquidity - Sifchain",
    },
  },
  {
    path: "/pool/create-pool",
    name: "CreatePool",
    component: CreatePool,
    props: {
      title: "Create Pair",
    },
    meta: {
      title: "Create Pool - Sifchain",
    },
  },
  {
    path: "/pool/remove-liquidity/:externalAsset?",
    name: "RemoveLiquidity",
    component: RemoveLiquidity,
    meta: {
      title: "Remove Liquidity - Sifchain",
    },
  },
  {
    path: "/balances",
    name: "Balances",
    component: Balance,
    meta: {
      title: "Balances - Sifchain",
    },
  },
  {
    path: "/balances/import/:assetFrom/:assetTo",
    name: "ImportListingPage",
    component: PegAssetPage,
    meta: {
      title: "Import Asset - Sifchain",
    },
  },
  {
    path: "/balances/export/:assetFrom/:assetTo",
    name: "UnpegAssetPage",
    component: PegAssetPage,
    meta: {
      title: "Export Asset - Sifchain",
    },
  },
] as const;

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes: [...routes] as Array<RouteRecordRaw>,
});

router.beforeEach((to, from, next) => {
  const win = window as any;
  if (!win.gtag) {
    return next();
  }
  // Taken from https://www.digitalocean.com/community/tutorials/vuejs-vue-router-modify-head
  // This goes through the matched routes from last to first, finding the closest route with a title.
  // e.g., if we have `/some/deep/nested/route` and `/some`, `/deep`, and `/nested` have titles,
  // `/nested`'s will be chosen.
  const nearestWithTitle = to.matched
    .slice()
    .reverse()
    .find((r) => r.meta && r.meta.title);

  // Find the nearest route element with meta tags.
  const nearestWithMeta = to.matched
    .slice()
    .reverse()
    .find((r) => r.meta && r.meta.metaTags);

  // If a route with a title was found, set the document (page) title to that value.
  if (nearestWithTitle) {
    document.title = nearestWithTitle.meta.title;
    // Let's log the page view to Google Analytics manually
    (window as any).gtag("event", "page_view", {
      page_title: nearestWithTitle.meta.title,
      page_location: window.location.href,
      page_path: window.location.pathname + window.location.hash,
    });
  }

  next();
});

export default router;
