# @sifchain/wallet-metamask

The MetamaskWalletProvider for @sifchain/sdk.

### Usage

```ts
import { createSdk, NetworkEnv } from '@sifchain/sdk'

const sdk = createSdk(NetworkEnv.TESTNET)
const wallet = new MetamaskWalletProvider(sdk.context)

const ethAddress = await wallet.connect(sdk.chains.ethereum)
```
