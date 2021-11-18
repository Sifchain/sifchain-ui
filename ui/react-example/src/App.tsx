import React from 'react'
import SwapPage from './pages/SwapPage/SwapPage'
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom'
import { SwapPageProvider } from './pages/SwapPage/context'
import { WalletProvider } from './modules/Wallet/context'

function App() {
  return (
    <BrowserRouter>
      <SwapPageProvider>
        <WalletProvider>
          <Switch>
            <Route path="/swap">
              <SwapPage />
              <Redirect from="*" to="/swap" />
            </Route>
          </Switch>
        </WalletProvider>
      </SwapPageProvider>
    </BrowserRouter>
  )
}

export default App
