# @sifchain/wallet-keplr

The KeplrWalletProvider for @sifchain/sdk.

### Usage

```ts
import { createSdk, NetworkEnv } from '@sifchain/sdk'

const sdk = createSdk(NetworkEnv.TESTNET)
const wallet = new KeplrWalletProvider(sdk.context)

const sifAddress = await wallet.connect(sdk.chains.sifchain)
```
