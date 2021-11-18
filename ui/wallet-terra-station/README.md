# @sifchain/wallet-terra-station

The TerraStationWalletProvider for @sifchain/sdk.

### Usage

```ts
import { createSdk, NetworkEnv } from '@sifchain/sdk'

const sdk = createSdk(NetworkEnv.TESTNET)
const wallet = new TerraStationWalletProvider(sdk.context)

const terraAddress = await wallet.connect(sdk.chains.terra)
```
