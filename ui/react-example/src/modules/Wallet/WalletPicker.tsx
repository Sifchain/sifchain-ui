import React from 'react'
import { sdk } from '../../sdk'
import { useWalletContext } from './context'
import { keplrProvider, metamaskProvider } from './providers'

export default function WalletPicker() {
  const { accountState, connect } = useWalletContext()

  return (
    <div className="w-[400px]">
      {Object.values(sdk.chains).map(chain => (
        <div key={chain.network} className="border border-solid my-1 px-1" onClick={() => connect(chain)}>
          {chain.displayName}
          <br />
          {accountState[chain.network].connected ? accountState[chain.network].address : 'Connect'}
        </div>
      ))}
    </div>
  )
}
