Idea for React API for frontend:

```ts
import { useSifchain } from "sifchain/react";

// keys === Object.keys(store) and determine reactivity
const [
  store, // store is immutable
  api, // api has all the usecase methods collected on an object
  bus, // bus can be used for global notifications
] = useSifchain(...keys);

// Keys
type Key =
  | "address"
  | "ethAddress"
  | "ethChainId"
  | "ethIsConnected"
  | "ethTxStatus"
  | "isConnected"
  | "lpPools"
  | "lpUserData"
  | "pools"
  | "vsUserData";

type Store = { [k: Key]: any };

api.addLiquidity();
api.removeLiquidity();
api.swap();
api.import();
api.export();
api.claim();
api.isSupportedNetwork();
api.connectWallet();
api.disconnectWallet();
api.calculateAddLiquidity();
api.calculateRemoveLiquidity();
api.calculateSwap();

bus.onAny();
bus.on();
bus.emit();
```

Also no real reason we can't provide a very similar API to Vue

```ts
import { useSifchain } from "sifchain/vue";

const [store, api, bus] = useSifchain();

// Keys
type Key =
  | "address"
  | "ethAddress"
  | "ethChainId"
  | "ethIsConnected"
  | "ethTxStatus"
  | "isConnected"
  | "lpPools"
  | "lpUserData"
  | "pools"
  | "vsUserData";

type Store = { [k: Key]: any };

api.addLiquidity();
api.removeLiquidity();
api.swap();
api.import();
api.export();
api.claim();
api.isSupportedNetwork();
api.connectWallet();
api.disconnectWallet();
api.calculateAddLiquidity();
api.calculateRemoveLiquidity();
api.calculateSwap();

bus.onAny();
bus.on();
bus.emit();
```

For Angular we can expose an RxJS stream that streams state changes.

```ts
import api from "sifchain/angular";

api.addLiquidity();
api.removeLiquidity();
api.swap();
api.import();
api.export();
api.claim();
api.isSupportedNetwork();
api.connectWallet();
api.disconnectWallet();
api.calculateAddLiquidity();
api.calculateRemoveLiquidity();
api.calculateSwap();

api.$store()
api.$bus()
```
