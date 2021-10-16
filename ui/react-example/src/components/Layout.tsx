import Tippy from '@tippyjs/react'
import React from 'react'
import { NavLink } from 'react-router-dom'
import { useWalletContext } from '../modules/Wallet/context'
import WalletPicker from '../modules/Wallet/WalletPicker'

export default function Layout(props: { children: any }) {
  const { accountState } = useWalletContext()
  return (
    <div className="absolute inset-0 flex">
      <div className="w-[300px] p-4 border-r border-solid bg-gray-200 flex flex-col items-center justify-between">
        <section>
          <h1 className="text-xl font-bold">Sifchain Provider</h1>
          <section className="flex-col mt-6">
            <NavLink to="balances" className="block mt-2 underline" activeClassName="text-blue-500">
              Balances
            </NavLink>
            <NavLink to="swap" className="block mt-2 underline" activeClassName="text-blue-500">
              Swap
            </NavLink>
          </section>
        </section>
        <section>
          <Tippy interactive maxWidth="none" trigger="click" content={<WalletPicker />}>
            <button>Wallets ({Object.values(accountState).filter(s => s.connected).length})</button>
          </Tippy>
        </section>
      </div>
      <div className="flex-1">{props.children}</div>
    </div>
  )
}
