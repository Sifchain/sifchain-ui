# @sifchain/wallet-xdefi

The XdefiWalletProvider for @sifchain/sdk.

### Usage

```ts
import { createSdk, NetworkEnv } from '@sifchain/sdk'

const sdk = createSdk(NetworkEnv.TESTNET)
const wallet = new XdefiWalletProvider(sdk.context)

const terraAddress = await wallet.connect(sdk.chains.terra)
```
