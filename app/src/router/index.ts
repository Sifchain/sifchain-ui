import { DeepReadonly } from "vue";
import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";

import { WalletInstallModal } from "~/components/WalletInstallModal/WalletInstallModal";
import { flagsStore } from "~/store/modules/flags";
import Balance from "~/views/BalancePage";
import ExportConfirm from "~/views/BalancePage/Export/Confirm";
import ExportProcessing from "~/views/BalancePage/Export/Processing";
import ExportSelect from "~/views/BalancePage/Export/Select";
import GetRowanModal from "~/views/BalancePage/GetRowan/GetRowanModal";
import ImportConfirm from "~/views/BalancePage/Import/Confirm";
import ImportProcessing from "~/views/BalancePage/Import/Processing";
import ImportSelect from "~/views/BalancePage/Import/Select";
import LeaderboardPage from "~/views/LeaderboardPage/LeaderboardPage";
import Pool_AddLiquidity from "~/views/PoolPage/children/AddLiquidity/AddLiquidity";
import Pool_RemoveLiquidity from "~/views/PoolPage/children/RemoveLiquidity/RemoveLiquidity";
import UnbondLiquidity from "~/views/PoolPage/children/UnbondLiquidity";
import Pool from "~/views/PoolPage/PoolPage";
import RewardsCalculatorPage from "~/views/RewardsCalculatorPage/RewardsCalculatorPage";
import RewardsPage from "~/views/RewardsPage/RewardsPage";
import StatsPage from "~/views/StatsPage/StatsPage";
import Swap from "~/views/SwapPage";
import { ApproveSwap } from "~/views/SwapPage/children/Approve";
import { ConfirmSwap } from "~/views/SwapPage/children/ConfirmSwap";
import { SwapPageState } from "~/views/SwapPage/useSwapPageData";

type SwapPageMeta = {
  title: string;
  swapState: SwapPageState;
};

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
        path: "unbond-liquidity/:externalAsset?",
        name: "UnbondLiquidity",
        component: UnbondLiquidity,
        meta: {
          title: "UnbondLiquidity - Sifchain",
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
        name: "WalletInstallModal",
        path: "install-wallet/:walletId",
        component: WalletInstallModal,
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
    ],
  },
  {
    name: "Leaderboard",
    path: "/leaderboard/:type/:symbol?",
    component: LeaderboardPage,
  },
] as const;

const finalRoutes = flagsStore.state.rewardsCalculator
  ? [
      ...routes,
      {
        name: "RewardsCalculator",
        path: "/calculator",
        component: RewardsCalculatorPage,
      },
    ]
  : routes;

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes: [...finalRoutes] as Array<RouteRecordRaw>,
});

router.beforeEach((to, _from, next) => {
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
  // const nearestWithMeta = to.matched
  //   .slice()
  //   .reverse()
  //   .find((r) => r.meta && r.meta.metaTags);

  // If a route with a title was found, set the document (page) title to that value.
  if (nearestWithTitle) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
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
