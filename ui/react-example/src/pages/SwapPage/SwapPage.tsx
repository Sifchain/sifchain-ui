import React, { useState } from 'react'
import { AssetAmount, formatAssetAmount, toBaseUnits } from '@sifchain/sdk'
import { sdk } from '../../sdk'
import { useSwapContext } from './context'
import { KeplrWalletProvider } from '@sifchain/sdk/src/clients/wallets'
import Layout from '../../components/Layout'
import { useWalletContext } from '../../modules/Wallet/context'

export default function SwapPage() {
  const {
    fromAsset,
    setFromAsset,
    toAsset,
    setToAsset,
    fromAmount,
    setFromAmount,
    toAmount,
    setToAmount,
    fromToPool,
    slippagePercent,
    setSlippagePercent,
    swapQuote,
    setSwapQuote,
  } = useSwapContext()

  const { accountState } = useWalletContext()

  const handleSwap = async () => {
    const wallet = new KeplrWalletProvider(sdk.context)
    const address = await wallet.connect(sdk.chains.sifchain)

    if (!swapQuote) throw new Error('no swap quote')

    const draft = await sdk.liquidity.swap.prepareSwapTx({
      address,
      fromAmount: AssetAmount(fromAsset, toBaseUnits(fromAmount, fromAsset)),
      toAsset,
      minimumReceived: swapQuote.minimumReceived,
    })
    const signed = await wallet.sign(sdk.chains.sifchain, draft)
    const res = await wallet.broadcast(sdk.chains.sifchain, signed)
  }

  const fromAmountInputRef = React.useRef<HTMLInputElement | null>(null)
  const toAmountInputRef = React.useRef<HTMLInputElement | null>(null)

  const onInputChange = (key: 'fromAmount' | 'toAmount', amount: string) => {
    amount = String(parseFloat(amount) || '0')

    const matchingAsset = key === 'fromAmount' ? fromAsset : toAsset

    if (fromToPool?.fromPool && fromToPool?.toPool) {
      const assetAmount = AssetAmount(matchingAsset, toBaseUnits(amount, matchingAsset))
      const quote = sdk.liquidity.swap.createSwapQuote(
        key === 'fromAmount'
          ? {
              ...fromToPool,
              slippagePercent,
              fromAmount: assetAmount,
            }
          : {
              ...fromToPool,
              slippagePercent,
              toAmount: assetAmount,
            },
      )

      setFromAmount(formatAssetAmount(quote.fromAmount))
      setToAmount(formatAssetAmount(quote.toAmount))
      setSwapQuote(quote)

      const otherInput = key === 'fromAmount' ? toAmountInputRef.current : fromAmountInputRef.current
      const otherValue = formatAssetAmount(key === 'fromAmount' ? quote.toAmount : quote.fromAmount)
      if (otherInput) otherInput.value = +otherValue !== 0 ? otherValue : ''
    }
  }

  const validationError =
    !swapQuote || swapQuote.fromAmount.equalTo('0') || swapQuote.toAmount.equalTo('0')
      ? 'Enter Amount'
      : fromAsset.symbol === toAsset.symbol
      ? 'Enter different from and to tokens'
      : swapQuote.flags.insufficientLiquidity
      ? 'Insufficient Liquidity'
      : swapQuote.fromAmount.greaterThan(
          accountState.sifchain.balanceLookup[swapQuote.fromAmount.symbol] || AssetAmount(swapQuote.fromAmount, '0'),
        )
      ? 'Not Enough ' + fromAsset.symbol.toUpperCase()
      : null

  // re-calculate amounts when assets or pools change
  React.useEffect(() => {
    if (!fromToPool) return
    // Don't recalculate from amount when pool changes if from is already focused.
    const keyToChange = document.activeElement === fromAmountInputRef.current ? 'toAmount' : 'fromAmount'
    onInputChange(keyToChange, keyToChange === 'fromAmount' ? fromAmount : toAmount)
  }, [fromToPool, slippagePercent])

  return (
    <Layout>
      <div className="mx-auto mt-8 border border-solid p-4 w-[500px]">
        <h3 className="text-xl font-bold">Swap</h3>
        <hr className="mt-4" />
        <div className="flex flex-col items-center w-full">
          <div className="flex w-full justify-between items-center">
            <b>From</b>
            <select
              className="bg-gray-200"
              onChange={ev => setFromAsset(sdk.chains.sifchain.lookupAssetOrThrow(ev.target.value))}
              value={fromAsset.symbol}
            >
              {sdk.chains.sifchain.assets.map(asset => (
                <option key={asset.symbol} value={asset.symbol}>
                  {asset.symbol} (
                  {formatAssetAmount(accountState.sifchain.balanceLookup[asset.symbol] || AssetAmount(asset, '0'))})
                </option>
              ))}
            </select>
          </div>
          <div className="flex w-full justify-between items-center">
            <b>
              Available:{' '}
              {formatAssetAmount(accountState.sifchain.balanceLookup[fromAsset.symbol] || AssetAmount(fromAsset, '0'))}
            </b>
            <input
              type="string"
              className="bg-gray-200"
              ref={fromAmountInputRef}
              placeholder="Enter Amount"
              onChange={e => onInputChange('fromAmount', e.target.value)}
            />
          </div>
          <button
            className="bg-gray-200 p-1 cursor-pointer"
            onClick={() => {
              setFromAsset(toAsset)
              setToAsset(fromAsset)
              if (fromAmountInputRef.current && toAmountInputRef.current) {
                let fromVal = fromAmountInputRef.current.value
                fromAmountInputRef.current.value = toAmountInputRef.current.value
                toAmountInputRef.current.value = fromVal
              }
            }}
          >
            Switch
          </button>
          <div className="flex w-full justify-between items-center">
            <b>To</b>
            <select
              className="bg-gray-200"
              onChange={ev => setToAsset(sdk.chains.sifchain.lookupAssetOrThrow(ev.target.value))}
              value={toAsset.symbol}
            >
              {sdk.chains.sifchain.assets.map(asset => (
                <option key={asset.symbol} value={asset.symbol}>
                  {asset.symbol} (
                  {formatAssetAmount(accountState.sifchain.balanceLookup[asset.symbol] || AssetAmount(asset, '0'))})
                </option>
              ))}
            </select>
          </div>
          <div className="flex w-full justify-between items-center">
            <b>
              Available:{' '}
              {formatAssetAmount(accountState.sifchain.balanceLookup[toAsset.symbol] || AssetAmount(toAsset, '0'))}
            </b>
            <input
              type="string"
              className="bg-gray-200"
              ref={toAmountInputRef}
              placeholder="Enter Amount"
              onChange={e => onInputChange('toAmount', e.target.value)}
            />
          </div>
        </div>
        <hr className="mb-4" />
        Slippage:
        <label>
          <input
            type="radio"
            name="slippage"
            className="ml-1"
            checked={slippagePercent === 0.5}
            onClick={() => setSlippagePercent(0.5)}
          />
          0.5%
        </label>
        <label>
          <input
            type="radio"
            name="slippage"
            className="ml-1"
            checked={slippagePercent === 1}
            onClick={() => setSlippagePercent(1)}
          />
          1%
        </label>
        <label>
          <input
            type="radio"
            name="slippage"
            checked={slippagePercent === 1.5}
            onClick={() => setSlippagePercent(1.5)}
          />
          1.5%
        </label>
        <hr />
        {!!swapQuote && (
          <ul>
            <li>
              Price: {swapQuote.fromToRatio} {fromAsset.displaySymbol.toUpperCase()} per{' '}
              {toAsset.displaySymbol.toUpperCase()}
            </li>
            <li>
              Minimum received: {formatAssetAmount(swapQuote.minimumReceived)}{' '}
              {swapQuote.minimumReceived.displaySymbol.toUpperCase()}
            </li>
            <li>Price impact: {swapQuote.priceImpact}%</li>
            <li>
              Liquidity Provider Fee: {formatAssetAmount(swapQuote.providerFee)}{' '}
              {swapQuote.providerFee.displaySymbol.toUpperCase()}
            </li>
          </ul>
        )}
        <hr />
        <button
          onClick={handleSwap}
          className={['text-lg bg-gray-200 p-1 w-full', !!validationError && 'bg-gray-400 cursor-not-allowed']
            .filter(Boolean)
            .join(' ')}
          disabled={!!validationError}
        >
          {validationError || 'Swap!'}
        </button>
      </div>
    </Layout>
  )
}
