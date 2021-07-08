import { sortAssetAmount } from "../utils/sortAssetAmount";
import { useCore } from "@/hooks/useCore";
import { computed, reactive } from "@vue/reactivity";
import { getUnpeggedSymbol } from "@/componentsLegacy/shared/utils";
import {
  AssetAmount,
  IAsset,
  IAssetAmount,
  TransactionStatus,
} from "@sifchain/sdk";

export type TokenListItem = {
  amount: IAssetAmount;
  asset: IAsset;
  pegTxs: TransactionStatus[];
  supported: boolean;
};

export type BalancePageState = {
  searchQuery: string;
  expandedSymbol: string;
};

export const useBalancePageData = (initialState: BalancePageState) => {
  const { store, usecases, config } = useCore();
  const state = reactive(initialState);

  function getIsSupportedNetwork(asset: IAsset): boolean {
    if (asset.network === "ethereum") {
      return usecases.wallet.eth.isSupportedNetwork();
    }

    if (asset.network === "sifchain") {
      return true; // TODO: Handle the case of whether the network is supported
    }
    return false;
  }

  const pendingPegTxList = computed(() => {
    if (
      !store.wallet.eth.address ||
      !store.tx.eth ||
      !store.tx.eth[store.wallet.eth.address]
    )
      return null;

    const txs = store.tx.eth[store.wallet.eth.address];

    const txKeys = Object.keys(txs);

    const list: TransactionStatus[] = [];
    for (let key of txKeys) {
      const txStatus = txs[key];

      // Are only interested in pending txs with a symbol
      if (!txStatus.symbol || txStatus.state !== "accepted") continue;

      list.push(txStatus);
    }

    return list;
  });

  const txMatchesUnpegSymbol = (pegAssetSymbol: string) => (
    txStatus: TransactionStatus,
  ) => {
    return (
      txStatus.symbol?.toLowerCase() ===
      getUnpeggedSymbol(pegAssetSymbol.toLowerCase()).toLowerCase()
    );
  };

  const tokenList = computed<TokenListItem[]>(() => {
    const pegList = pendingPegTxList.value;
    const query = state.searchQuery.toLowerCase();

    return config.assets
      .filter((asset: IAsset) => {
        return (
          asset.symbol.toLowerCase().indexOf(query) !== -1 ||
          asset.label.toLowerCase().indexOf(query) !== -1
        );
      })
      .map((asset: IAsset) => {
        const amount = store.wallet.sif.balances.find(
          ({ asset: { symbol } }) => {
            return asset.symbol.toLowerCase() === symbol.toLowerCase();
          },
        );

        // Get pegTxs for asset
        const pegTxs = pegList
          ? pegList.filter(txMatchesUnpegSymbol(asset.symbol))
          : [];

        // Is the asset from a supported network
        // TODO(ajoslin): remove
        const supported = getIsSupportedNetwork(asset);
        return {
          amount: !amount ? AssetAmount(asset, "0") : amount,
          asset,
          pegTxs,
          supported,
        };
      })
      .sort((a, b) => {
        if (a.asset.symbol === config.nativeAsset.symbol) return -1;
        if (b.asset.symbol === config.nativeAsset.symbol) return 1;
        return a.asset.symbol.localeCompare(b.asset.symbol);
      });
  });

  return {
    state,
    tokenList,
  };
};
