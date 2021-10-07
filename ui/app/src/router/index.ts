import {
  createRouter,
  createWebHashHistory,
  RouteRecord,
  RouteRecordRaw,
} from "vue-router";

import Swap from "@/views/SwapPage/SwapPage";
import Balance from "@/views/BalancePage/BalancePage";
// import BalanceImport from "@/views/BalancePage/Import";
// import BalanceExport from "@/views/BalancePage/Export";
import RewardsPage from "@/views/RewardsPage/RewardsPage";
import StatsPage from "@/views/StatsPage/StatsPage";
import StakeDelegatePage from "@/views/StakeDelegatePage.vue";
import RemoveLiquidity from "@/views/RemoveLiquidityPage.vue";
import SinglePool from "@/views/SinglePool.vue";
// import PegAssetPage from "@/views/PegAssetPage.vue";
import Pool from "@/views/PoolPage/PoolPage";
import Pool_AddLiquidity from "@/views/PoolPage/children/AddLiquidity/AddLiquidity";
import Pool_RemoveLiquidity from "@/views/PoolPage/children/RemoveLiquidity/RemoveLiquidity";
import { SwapPageState } from "@/views/SwapPage/useSwapPageData";
import { ConfirmSwap } from "@/views/SwapPage/children/ConfirmSwap";
import { ApproveSwap } from "@/views/SwapPage/children/Approve";
import LeaderboardPage from "@/views/LeaderboardPage/LeaderboardPage";
import ImportSelect from "@/views/BalancePage/Import/Select";
import ImportConfirm from "@/views/BalancePage/Import/Confirm";
import ImportProcessing from "@/views/BalancePage/Import/Processing";
import ExportSelect from "@/views/BalancePage/Export/Select";
import ExportConfirm from "@/views/BalancePage/Export/Confirm";
import ExportProcessing from "@/views/BalancePage/Export/Processing";
import { DeepReadonly } from "vue";
import GetRowanModal from "@/views/BalancePage/GetRowan/GetRowanModal";
import OnboardingModal from "@/components/OnboardingModal";
import KeplrModal from "@/components/KeplrModal/KeplrModal";

type SwapPageMeta = {
  title: string;
  swapState: SwapPageState;
};

type RouteName<T> = T extends { name?: string }[]
  ? RouteName<T[number]>
  : T extends { name: string }
  ? T["name"]
  : "";

// type RouteName<T> = T extends RouteRecordRaw
//   ? RouteName<T[keyof T]>
//   : T extends { name: string; children: any[] }
//   ? T["name"] | RouteName<T["children"][number]>
//   : T extends { name: string }
//   ? T["name"]
//   : "";

const routes: DeepReadonly<RouteRecordRaw[]> = [
  {
    path: "/",
    redirect: "/swap",
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
        meta: {
          title: "Confirm Swap - Sifchain",
          swapState: "confirm",
        } as SwapPageMeta,
      },
      {
        path: "approve",
        name: "ApproveSwap",
        component: ApproveSwap,
        meta: {
          title: "Approve Swap - Sifchain",
          swapState: "submit",
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
        meta: {
          title: "Create Pool - Sifchain",
        },
      },
      {
        path: "add-liquidity/setup/:externalAsset?",
        name: "AddLiquidity",
        component: Pool_AddLiquidity,
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
        name: "GetRowan",
        path: "get-rowan",
        component: GetRowanModal,
      },
      {
        name: "KeplrInfo",
        path: "keplr",
        component: KeplrModal,
      },
      {
        name: "Import",
        path: "import/:displaySymbol/select",
        component: ImportSelect,
      },
      {
        name: "ConfirmImport",
        path: "import/:displaySymbol/confirm",
        component: ImportConfirm,
      },
      {
        name: "ProcessingImport",
        path: "import/:displaySymbol/processing",
        component: ImportProcessing,
      },
      {
        name: "Export",
        path: "export/:symbol/select",
        component: ExportSelect,
      },
      {
        name: "ConfirmExport",
        path: "export/:symbol/confirm",
        component: ExportConfirm,
      },
      {
        name: "ProcessingExport",
        path: "export/:symbol/processing",
        component: ExportProcessing,
      },
      // {
      //   name: "Export",
      //   path: "export/:symbol/:step",
      //   component: BalanceExport,
      // },
    ],
  },
  {
    name: "Leaderboard",
    path: "/leaderboard/:type",
    component: LeaderboardPage,
  },

  // {
  //   path: "/balances/import/:assetFrom/:assetTo",
  //   name: "ImportListingPage",
  //   component: PegAssetPage,
  //   meta: {
  //     title: "Import Asset - Sifchain",
  //   },
  // },
  // {
  //   path: "/balances/export/:assetFrom/:assetTo",
  //   name: "UnpegAssetPage",
  //   component: PegAssetPage,
  //   meta: {
  //     title: "Export Asset - Sifchain",
  //   },
  // },
] as const;

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

export default router;
