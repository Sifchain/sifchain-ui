import { NetworkEnv, createSdk } from '@sifchain/sdk'

export const sdk = createSdk({
  environment: NetworkEnv.DEVNET,
})
