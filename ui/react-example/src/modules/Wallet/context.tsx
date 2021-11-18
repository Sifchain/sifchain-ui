import { Chain, IAssetAmount, Network } from '@sifchain/sdk'
import React, { createContext, useContext, useMemo, useState } from 'react'
import { sdk } from '../../sdk'
import { keplrProvider, metamaskProvider } from './providers'

type WalletState = {
  address: string
  connected: boolean
  balances: IAssetAmount[]
  balanceLookup: Record<string, IAssetAmount>
}

const connectedKey = (chain: Chain) => 'connected_' + chain.network

const useWalletData = () => {
  const [accountState, setState] = useState(
    Object.values(sdk.chains).reduce((acc, chain) => {
      acc[chain.network] = {
        address: '',
        connected: false,
        balances: [],
        balanceLookup: {},
      }
      return acc
    }, {} as Record<Network, WalletState>),
  )

  React.useEffect(() => {
    Object.values(sdk.chains).forEach(chain => {
      if (localStorage[connectedKey(chain)]) {
        connect(chain)
      }
    })
  }, [])

  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout
    if (accountState.sifchain.connected) {
      ;(async function run() {
        await updateBalances(sdk.chains.sifchain)
        timeoutId = setTimeout(run, 5000)
      })()
    }
    return () => clearTimeout(timeoutId)
  }, [accountState.sifchain.connected])

  const connect = React.useCallback(async (chain: Chain) => {
    const provider = chain.chainConfig.chainType === 'ibc' ? keplrProvider : metamaskProvider

    const address = await provider.connect(chain)
    localStorage[connectedKey(chain)] = true
    updateChainState(chain, { connected: true, address })
    return address
  }, [])

  const updateChainState = React.useCallback((chain: Chain, update: Partial<WalletState>) => {
    setState(state => ({
      ...state,
      [chain.network]: {
        ...state[chain.network],
        ...update,
      },
    }))
  }, [])

  const updateBalances = React.useCallback(
    async (chain: Chain) => {
      if (!accountState[chain.network].connected) return
      const provider = chain.chainConfig.chainType === 'ibc' ? keplrProvider : metamaskProvider
      const balances = await provider.fetchBalances(chain, accountState[chain.network].address)
      updateChainState(chain, {
        balances,
        balanceLookup: balances.reduce((acc, balance) => {
          acc[balance.symbol] = balance
          return acc
        }, {} as Record<string, IAssetAmount>),
      })
      return balances
    },
    [accountState],
  )

  const value = {
    accountState,
    connect,
    updateBalances,
  }

  return useMemo(() => value, Object.values(value))
}

// @ts-ignore
const WalletContext = createContext<ReturnType<typeof useWalletData>>({})

export const useWalletContext = () => React.useContext(WalletContext)

export const WalletProvider = (props: { children: any }) => {
  const data = useWalletData()

  return <WalletContext.Provider value={data}>{props.children}</WalletContext.Provider>
}
