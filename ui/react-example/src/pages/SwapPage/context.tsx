import React from 'react'
import { IAsset, Pool } from '@sifchain/sdk'
import { DEFAULT_SWAP_SLIPPAGE_PERCENT } from '@sifchain/sdk/src/clients/liquidity/SwapClient'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router'
import { sdk } from '../../sdk'

// @ts-ignore
const SwapContext = createContext<ReturnType<typeof useSwapPageData>>({})

export const useSwapContext = () => useContext(SwapContext)

const defaultFromAsset =
  sdk.chains.sifchain.lookupAsset('uatom') ||
  sdk.chains.sifchain.lookupAsset('uphoton') ||
  sdk.chains.sifchain.lookupAssetOrThrow('ceth')

const defaultToAsset = sdk.chains.sifchain.lookupAssetOrThrow('rowan')

const useSwapPageData = () => {
  const [fromAsset, setFromAsset] = useState(defaultFromAsset)
  const [toAsset, setToAsset] = useState(defaultToAsset)
  const [fromAmount, setFromAmount] = useState('0')
  const [toAmount, setToAmount] = useState('0')
  const [pools, setPools] = useState<Pool[]>([])
  const [fromToPool, setFromToPool] = useState<{ fromPool: Pool; toPool: Pool } | null>(null)
  const [slippagePercent, setSlippagePercent] = useState(DEFAULT_SWAP_SLIPPAGE_PERCENT)
  const [swapQuote, setSwapQuote] = useState<ReturnType<typeof sdk.liquidity.swap.createSwapQuote> | null>(null)

  useEffect(() => {
    setFromToPool(sdk.liquidity.swap.findSwapFromToPool({ fromAsset, toAsset, pools }))
  }, [pools, fromAsset, toAsset])

  const value = {
    fromAsset,
    setFromAsset,
    toAsset,
    setToAsset,
    fromAmount,
    setFromAmount,
    toAmount,
    setToAmount,
    slippagePercent,
    setSlippagePercent,
    fromToPool,
    swapQuote,
    setSwapQuote,
    setPools,
  }
  return useMemo(() => value, Object.values(value))
}

export const SwapPageProvider = (props: { children: any }) => {
  const data = useSwapPageData()
  const location = useLocation()

  const locationKey = location.key
  const setPools = data.setPools
  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    if (true || location.pathname.startsWith('/swap')) {
      ;(async function run() {
        data.setPools(await sdk.liquidity.fetchAllPools())
        timeoutId = setTimeout(run, 10_000)
      })()
    }
    return () => clearTimeout(timeoutId)
  }, [locationKey, setPools])

  return <SwapContext.Provider value={data}>{props.children}</SwapContext.Provider>
}
