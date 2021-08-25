import { useCore } from "./useCore";
import { computed, Ref } from "vue";
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
import { InterchainTx } from "@sifchain/sdk/src/usecases/interchain/_InterchainApi";

export type TokenListItem = {
  amount: IAssetAmount;
  asset: IAsset;
  pendingImports: {
    transactionStatus: TransactionStatus;
    interchainTx: InterchainTx;
  }[];
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

        const assetTransfers = pendingTransfers.filter((transfer) => {
          return (
            transfer.interchainTx.toChain.network === asset.network &&
            isLikeSymbol(transfer.interchainTx.assetAmount.symbol, asset.symbol)
          );
        });

        return {
          amount: !amount ? AssetAmount(asset, "0") : amount,
          asset,
          pendingImports: assetTransfers,
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
