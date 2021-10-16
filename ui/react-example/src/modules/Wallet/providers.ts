import { KeplrWalletProvider, MetamaskWalletProvider } from '@sifchain/sdk/src/clients/wallets'
import { sdk } from '../../sdk'

export const keplrProvider = new KeplrWalletProvider(sdk.context)

export const metamaskProvider = new MetamaskWalletProvider(sdk.context)

if (typeof window !== 'undefined') {
  metamaskProvider.onChainChanged(() => window.location.reload())
  metamaskProvider.onAccountChanged(() => window.location.reload())
  keplrProvider.onAccountChanged(() => window.location.reload())
}
