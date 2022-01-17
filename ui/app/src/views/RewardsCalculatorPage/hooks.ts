import { Network } from "@sifchain/sdk";

import { accountStore } from "@/store/modules/accounts";
import { useRowanPrice } from "@/componentsLegacy/RowanPrice/useRowanPrice";
import { formatAssetAmount } from "@/componentsLegacy/shared/utils";

/**
 * Returns a given token's balance based on its Symbol and Network
 *
 * @param tokenSymbol
 * @param options - { network: Network.SIFCHAIN, strict: false }
 */
export function useTokenBalance(
  tokenSymbol: string,
  options = { network: Network.SIFCHAIN, strict: false },
) {
  const { balances } = accountStore.state[options.network];

  const rawBalance = balances.find(({ asset }) =>
    options.strict
      ? asset.symbol === tokenSymbol
      : asset.symbol.toUpperCase().includes(tokenSymbol.toUpperCase()),
  );

  return rawBalance;
}

export function useRewardsCalculatorData(
  tokenInSymbol = "ROWAN",
  tokenInNetwork = Network.SIFCHAIN,
) {
  const rawBalance = useTokenBalance(tokenInSymbol, {
    network: tokenInNetwork,
    strict: false,
  });

  const tokenInBalance = rawBalance ? formatAssetAmount(rawBalance) : "0.00";

  return {
    tokenInSymbol,
    tokenInBalance,
    tokenOutPriceAsync: useRowanPrice(),
    tokenOutSymbol: tokenInSymbol,
    apr: "12.5",
  };
}
