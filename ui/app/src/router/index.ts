import {
  createRouter,
  createWebHashHistory,
  RouteRecord,
  RouteRecordRaw,
} from "vue-router";

import Swap from "@/views/SwapPage/SwapPage";
import Balance from "@/views/BalancePage/BalancePage";
import BalanceImport from "@/views/BalancePage/Import";
import BalanceExport from "@/views/BalancePage/Export";
import RewardsPage from "@/views/RewardsPage/RewardsPage";
import StatsPage from "@/views/StatsPage/StatsPage";
import StakeDelegatePage from "@/views/StakeDelegatePage.vue";
import RemoveLiquidity from "@/views/RemoveLiquidityPage.vue";
import SinglePool from "@/views/SinglePool.vue";
import PegAssetPage from "@/views/PegAssetPage.vue";
import Pool from "@/views/PoolPage/PoolPage";
import Pool_AddLiquidity from "@/views/PoolPage/children/AddLiquidity/AddLiquidity";
import Pool_RemoveLiquidity from "@/views/PoolPage/children/RemoveLiquidity/RemoveLiquidity";
import { SwapPageState } from "@/views/SwapPage/useSwapPageData";
import { ConfirmSwap } from "@/views/SwapPage/children/ConfirmSwap";
import { ApproveSwap } from "@/views/SwapPage/children/Approve";
import { SubmittedSwap } from "@/views/SwapPage/children/SubmittedSwap";

type SwapPageMeta = {
  title: string;
  swapState: SwapPageState;
};
const routes: Array<RouteRecordRaw> = [
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
    name: "Rewards",
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
      swapState: "idle",
    } as SwapPageMeta,
    children: [
      {
        path: "confirm",
        name: "ConfirmSwap",
        component: ConfirmSwap,
        props: {
          title: "Confirm Swap",
        },
        meta: {
          title: "Confirm Swap - Sifchain",
          swapState: "confirm",
        } as SwapPageMeta,
      },
      {
        path: "approve",
        name: "ApproveSwap",
        component: ApproveSwap,
        props: {
          title: "Approve Swap",
        },
        meta: {
          title: "Approve Swap - Sifchain",
          swapState: "submit",
        } as SwapPageMeta,
      },
      {
        path: "submitted/:txHash",
        name: "SubmittedSwap",
        component: SubmittedSwap,
        props: {
          title: "Transaction Submitted",
        },
        meta: {
          title: "Transaction Submitted - Sifchain",
          swapState: "success",
        } as SwapPageMeta,
      },
    ],
  },
  {
    path: "/pool",
    name: "Pool",
    component: Pool,
    meta: {
      title: "Pool - Sifchain",
    },
    children: [
      {
        path: "create-pool",
        name: "CreatePool",
        component: Pool_AddLiquidity,
        props: {
          title: "Create Pair",
        },
        meta: {
          title: "Create Pool - Sifchain",
        },
      },
      {
        path: "add-liquidity/setup/:externalAsset?",
        name: "AddLiquidity",
        component: Pool_AddLiquidity,
        props: {
          title: "Add Liquidity",
        },
        meta: {
          title: "Add Liquidity - Sifchain",
        },
      },
      {
        path: "remove-liquidity/:externalAsset?",
        name: "RemoveLiquidity",
        component: Pool_RemoveLiquidity,
        meta: {
          title: "Remove Liquidity - Sifchain",
        },
      },
    ],
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
    path: "/balances",
    name: "Balances",
    component: Balance,
    meta: {
      title: "Balances - Sifchain",
    },
    children: [
      {
        name: "Import",
        path: "import/:symbol/:step",
        component: BalanceImport,
      },
      {
        name: "Export",
        path: "export/:symbol/:step",
        component: BalanceExport,
      },
    ],
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
];

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
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

router.afterEach((to, from) => {
  // Reset scroll on route change
  if (to.name !== from.name) {
    const layout = document.querySelector(".layout");
    if (layout) layout.scrollTop = 0;
  }
});

export default router;
