import { useCore } from "./useCore";
import { computed, onUnmounted, ref, Ref, watch } from "vue";
import { getUnpeggedSymbol } from "@/componentsLegacy/shared/utils";
import {
  AssetAmount,
  Network,
  IAsset,
  IAssetAmount,
  TransactionStatus,
} from "@sifchain/sdk";
import { isLikeSymbol } from "@/utils/symbol";
import { accountStore } from "@/store/modules/accounts";
import { PendingTransferItem } from "@sifchain/sdk/src/store/tx";
import { useAsyncData } from "./useAsyncData";
import { useChains } from "./useChains";

export type TokenListItem = {
  amount: IAssetAmount;
  asset: IAsset;
  pendingImports: PendingTransferItem[];
  pendingExports: PendingTransferItem[];
};

export type TokenListParams = {
  networks?: Ref<Network[]>;
  showDecomissionedAssetsWithBalance?: boolean;
  showDecomissionedAssets?: boolean;
};

export const useTokenList = (params: TokenListParams) => {
  const { store, config, usecases } = useCore();

  const tokenList = computed<TokenListItem[]>(() => {
    const pendingTransfers = Object.values(store.tx.pendingTransfers);

    const networksSet = new Set(params.networks?.value || []);

    return config.assets
      .filter((asset: IAsset) => {
        if (!networksSet.size) return true;
        return networksSet.has(asset.network);
      })
      .map((asset: IAsset) => {
        const balancesRef = accountStore.computed(
          (s) => s.state[asset.network].balances,
        );
        const balances = balancesRef.value;

        const amount = balances?.find(({ asset: { symbol } }) => {
          return asset.symbol.toLowerCase() === symbol.toLowerCase();
        });

        const pendingImports: PendingTransferItem[] = [];
        const pendingExports: PendingTransferItem[] = [];
        pendingTransfers.forEach((transfer) => {
          if (
            isLikeSymbol(transfer.bridgeTx.assetAmount.symbol, asset.symbol) ||
            isLikeSymbol(
              transfer.bridgeTx.assetAmount.unitDenom || "",
              asset.symbol,
            )
          ) {
            const array =
              transfer.bridgeTx.toChain.network === asset.network
                ? pendingImports
                : transfer.bridgeTx.fromChain.network === asset.network
                ? pendingExports
                : null;
            if (array) array.push(transfer);
          }
        });

        return {
          amount: !amount ? AssetAmount(asset, "0") : amount,
          asset,
          pendingImports,
          pendingExports,
        };
      })
      .filter((token) => {
        if (token.asset.decommissioned) {
          if (params.showDecomissionedAssets) {
            return true;
          }
          return (
            params.showDecomissionedAssetsWithBalance &&
            parseFloat(token.amount.amount.toString()) > 0
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (a.asset.symbol === config.nativeAsset.symbol) return -1;
        if (b.asset.symbol === config.nativeAsset.symbol) return 1;
        return a.asset.symbol.localeCompare(b.asset.symbol);
      });
  });

  return tokenList;
};

export const useToken = (params: {
  network: Ref<Network>;
  symbol: Ref<string>;
  tokenListParams?: TokenListParams;
}) => {
  const tokenListRef = useTokenList(params.tokenListParams || {});

  return computed(() => {
    return tokenListRef.value?.find((token) => {
      return (
        token.asset.network === params.network.value &&
        isLikeSymbol(token.asset.symbol, params.symbol.value)
      );
    });
  });
};

export const useAndPollNetworkBalances = (params: {
  network: Ref<Network>;
}) => {
  const res = useAsyncData(async () => {
    if (!params.network.value) return;
    await accountStore.updateBalances(params.network.value);
  }, [params.network]);

  let stopPollingRef = ref<Promise<() => void> | undefined>();
  watch(
    params.network,
    async (network) => {
      if (stopPollingRef.value) stopPollingRef.value.then((fn) => fn());
      if (network === Network.SIFCHAIN) return;
      stopPollingRef.value = accountStore.pollBalances(network);
    },
    { immediate: true },
  );
  onUnmounted(() => {
    if (stopPollingRef.value) stopPollingRef.value.then((fn) => fn());
  });

  const hasLoaded = computed(
    () => accountStore.state[params.network.value]?.hasLoadedBalancesOnce,
  );

  return {
    ...res,
    hasLoaded,
    data: computed(() => accountStore.state[params.network.value]?.balances),
  };
};
