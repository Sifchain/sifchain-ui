import { Ref } from "vue";
import { computed, ComputedRef } from "@vue/reactivity";
import { IAsset, IAssetAmount, Network, Store } from "@sifchain/sdk";

type WalletResult = { balances: ComputedRef<IAssetAmount[]> };

export function useWallet(store: Store): WalletResult {
  const balances = computed(() => store.wallet.sif.balances);

  return { balances };
}

export function getNetworkBalances(store: Store, network?: Network) {
  switch (network) {
    case Network.SIFCHAIN: {
      return store.wallet.sif.balances;
    }
    case Network.ETHEREUM: {
      return store.wallet.eth.balances;
    }
    case Network.COSMOSHUB: {
      return store.wallet.cosmoshub.balances;
    }
  }
}

// export function useAssetBalance(store: Store, asset: Ref<IAsset>) {
//   let { balances } = useNetworkWallet(store, ref(asset.value.network));
//   return computed(() => {
//     return balances.value.find(
//       (amount) => amount.asset.symbol === asset.value.symbol,
//     );
//   });
// }
