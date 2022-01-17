import { Network } from "@sifchain/sdk";

import { accountStore } from "@/store/modules/accounts";
import { useRowanPrice } from "@/componentsLegacy/RowanPrice/useRowanPrice";
import { formatAssetAmount } from "@/componentsLegacy/shared/utils";
import { useAsyncDataCached } from "@/hooks/useAsyncDataCached";

/**
 * Returns a given token's balance based on its Symbol and Network
 *
 * @param tokenSymbol
 * @param options - { network: Network.SIFCHAIN, strict: false }
 */
export function useTokenBalanceAsync(
  tokenSymbol: string,
  options = { network: Network.SIFCHAIN, strict: false },
) {
  return useAsyncDataCached(
    "useTokenBalanceAsync",
    async () => {
      if (!accountStore.refs.sifchain.connected) {
        console.log("not connected");
      }
      const { balances } = accountStore.state[options.network];

      const balance = balances.find(({ asset }) => {
        return asset.symbol.toLowerCase().includes(tokenSymbol.toLowerCase());
      });
      if (!balance) return;

      return balance;
    },
    [accountStore.refs[options.network].balances.computed()],
  );
}

export function useRewardsCalculatorData(
  tokenInSymbol = "ROWAN",
  tokenInNetwork = Network.SIFCHAIN,
) {
  return {
    tokenInSymbol,
    tokenInBalanceAsync: useTokenBalanceAsync(tokenInSymbol, {
      network: tokenInNetwork,
      strict: false,
    }),
    tokenOutPriceAsync: useRowanPrice(),
    tokenOutSymbol: tokenInSymbol,
    apr: "12.5",
  };
}
