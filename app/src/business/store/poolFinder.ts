import { Ref, toRefs } from "vue";
import { Asset, IAsset, Pool, Network } from "@sifchain/sdk";
import { createPoolKey } from "@sifchain/sdk/src/utils/pool";

import type { Store } from "./index";
import type { AccountPool } from "./pools";

export const createPoolFinder =
  (s: Store) => (a: IAsset | string, b: IAsset | string) => {
    const $a = typeof a === "string" ? Asset.get(a) : a;
    const $b = typeof b === "string" ? Asset.get(b) : b;

    const pools = toRefs(s.pools);

    const key = createPoolKey($a, $b);

    const poolRef = pools[key] as Ref<Pool> | undefined;
    return poolRef ?? null;
  };

export const createAccountPoolFinder =
  (s: Store) => (a: IAsset | string, b: IAsset | string) => {
    const $a = typeof a === "string" ? Asset.get(a) : a;
    const $b = typeof b === "string" ? Asset.get(b) : b;

    const accountpools = toRefs(
      s.accountpools[s.wallet.get(Network.SIFCHAIN).address] || {},
    );

    const key = createPoolKey($a, $b);

    const accountPoolRef = accountpools[key] as Ref<AccountPool> | undefined;
    return accountPoolRef ?? null;
  };
