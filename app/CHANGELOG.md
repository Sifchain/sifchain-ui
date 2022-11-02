## Release 2022.11.4

- Margin APR’s on Pool Stats page

## Release 2022.09.17

- Margin APR’s on Pool Stats page

## Release 2022.09.16

- Margin trading release
- 3rd party charting integration
- Margin APR’s on Pool page

## Release 2022.09.13

- Remove PMTP rate from sidebar
- Preparations for margin release

## Release 2022.08.31

- Swap fee updates to a 0.3% flat-fee instead of a slip-based fee.
- Auto-hide pool stats < $10k

## Release 2022.08.21

- Compatibility with cosmos sdk 0.45

## Release 2022.08.04

- Auto-hide pools < $10k
- Preparations for margin
- Removed rewards page

## Release 2022.06.08

- Add OSQTH token
- Add COMDEX token

## Release 2022.05.26

- Fix ethereum assetlist configuration for tokens missing 'homeNetwork'

## Release 2022.05.24

- Enable cancelling unbonding requests
- Re-enable UST and LUNA
- Fix pool share & pool value display

## Release 2022.05.12

- Decommission UST and LUNA

## Release 2022.05.09

- Add more information about price impact on Swap's confirmation step
- Include "pool composition" information to Add Liquidity widget

## Release 2022.05.02

- Fix Terra Station integration

## Release 2022.04.30

- Fix EVMOS chain display decimals

## Release 2022.04.27

- Add EVMOS chain

## Release 2022.04.27

- Add unbonding period disclaimer to relevant components
- Fix transaction cancellation error on Add Liquidity page

## Release 2022.04.26

- Remove mentions to old rewards programs on `Pool` page
- Improved remote caching

## Release 2022.04.24

- Fix ethereum imports
- Temporarily disable adding liquidity asymetrically

## Release 2022.04.22

- Fix unbonding liquidity

## Release 2022.04.21

- Fix add liquidity 'Pool Equally' ratio
- Improved PMTP 'minimum received' estimate based on price impact and slippage
- Security updates to cosmjs as web3.js

## Release 2022.04.19

- Sif’s Ascension and PMTP are now live!
- Rewards will be auto-distributed back into the pools at every block
- All liquidity is now subject to 7-day unbonding periods
- PMTP governance rates are listed above the token price on the DEX - click on the PMTP icon for additional information
- chore/security patches:
  - Fix decimal formatting of ibc tokens on 'Unbond liquidity' page
  - Fix decimal formatting of ibc tokens on 'Unbonding request' section on 'Pools' page
  - Remove keplr provider websocket dependency

## Release 2022.04.06

- Fixed display of individual 'Dispensed rewards' by rewards program

## Release 2022.04.05

- Fixed display of 'Dispensed rewards' on rewards page

## Release 2022.04.04

- Fixed issue processing add liquidity transactions

## Release 2022.03.31

- Fixed issue with swap modal disappearing

## Release 2022.03.30

- Performance improvements of pools, pool stats, and rewards pages
  - Updated field names for clarity around auto-claims (Total pending rewards vs Claimed - pending dispensation, Time until next dispensation vs Time remaining to claim, and Pending rewards vs claimable reward)
  - Pool TVL now displayed in place of Pool Depth (displays total value of all assets in the pool instead of only displaying the non-ROWAN asset)

## Release 2022.03.03

- SDK/Sifchain.js
- Balance page updates
  - Defaults to only show balances > 0, new toggle to show all vs hide 0 balances, improved searching and scrolling
- Rewards calculator
  - Available within the More section of the menu, allows users to view potential returns over time with inputs for rowan principle amount, current rowan price, apr, future rowan price, and time (weeks)

## Release 2022.02.03

- An issue was discovered that caused bonus pool (v4) selections to be sorted alphabetically, misaligning the rank weights. The voting period has been reset & extended until 2/8 at 12pm PST.

## Release 2022.01.29

- Added voting UI for Pools of the People governance

## Release 2022.01.06

- Ledger imports working again

## Release 2022.01.03

- Added rowan balance in navigation sidebar
- increased download speed by 1000x
- Displayed "export" by default on balances page
- Restyled row borders (no more white dashes)
- Optimized "connected" and "danger" colors for eye appeal
- Added an easter egg for the first person to read this
  - Mnemonic: credit spray elite grass immense evidence daughter play swift cruel warfare pottery daring flash educate heart direct wheat outdoor jump odor regular ocean road

## Release 2022.01.02

- Added Reward Claim Countdown Timer
- Softened color scheme to decrease eye strain
- Updated price ticker design to be inline with navigation sidebar design
- Moved documentation tab to "more" section
- Added Stakely.io faucet link that appears when Rowan balance < 0.5

## Release 2021.11.04

- Enabled E-Money

  - EEUR
  - NGM

- Sif's Bonus Pool - EEUR:
  - Import EEUR
  - Pool EEUR
  - Earn Rowan

## Release 2021.10.29\

- Enabled OH token from oh.finance

## Release 2021.10.27

- Enabled Terra via Terra Station Wallet: UST, LUNA
- Sif's Bonus Pools for UST and LUNA

## Release 2021.10.20

- Enabled OSMO
- Sif's Bonus Pool - OSMO:
  - Import OSMO
  - Pool OSMO
  - Earn Rowan

## Release 2021.10.12

- Enabled Ethereum & ERC20 IBC exports for the first time on Cosmos!
- Enabled IXO
- Sif's Bonus Pool - IXO:
  - Import IXO
  - Pool IXO
  - Earn Rowan

## Release 2021.10.05

- Enabled JUNØ
- Sif's Bonus Pool - 1M Rowan. 2 weeks. 3 steps.
  - Import JUNØ
  - Pool JUNØ
  - Earn Rowan

## Release 2021.10.03

- Welcomed the Sif's Harvest Liquidity Mining Program
  - All pools.
  - 6 weeks
  - 40 Million Rowan in Rewards

## Release 2021.10.01

- Enabled
  - BTSG - BitSong
  - QUICK - QuickSwap
  - LDO - Lido DAO
  - RAIL - Railgun
  - POND - Marlin
  - DINO - DinoSwap
  - UFO - UFO Gaming

## Release 2021.09.17

- Ledger Nano X and Ledger Nano S are now supported!
- Added more notifications for successful actions throughout the DEX.

## Release 2021.09.16

- Enabled
  - UST - Terra USD
  - FRAX - Frax
  - FXS - Frax Share
  - ZCX - Unizen
  - DON - Don-key
  - METIS - Metis Token
  - KFT - Knit Finance
  - ZCN - 0chain
  - SAITO - SAITO
  - DFYN - DFYN Token
  - DNXC - DinoX Coin
  - ERN - @EthernityChain $ERN Token
  - POLS - PolkastarterToken
  - AXS - Axie Infinity Shard
  - MATIC - Matic Token
  - TOKE - Tokemak

## Release 2021.09.13

- We added 'Your Pool Value' to the Pool page. This shows your current value in that pool in USD if you were to withdraw your liquidity in a 50/50 split among both assets in that pool.
- Swap: We are now showing the price of the swap in both directions within the swap modal.
- Prices are automatically updated in the Swap Modal every 10 seconds.
- Upgraded performance on the Pool page.
- Fixed a bug where users would click on 'max' during add liqudity and they would get an insufficent funds message.

## Release 2021.09.10

- Enabled Cosmos to Ethereum exports for AKT, ATOM, XPRT, IRIS, and REGEN!
- Cosmos Ethereum pools available on Uniswap and Sushiswap

## Release 2021.09.09

- Re-enabled LEASH imports
- Fixed issue preventing certain Ethereum exports

## Release 2021.09.08

- Enabled the ability to claim your .42 liquidity mining rewards!

## Release 2021.09.02

- Enabled Regen & Crypto.org!

## Release 2021.08.30

- Enabled IRISnet & Persistence chains. Can now import/export IRIS and XPRT.
- Added Reward APY to the Pool screen.
- The arbitrage coloring was backwards! This has been fixed and a tooltip has been added for explanation.
- This changelog! Reference here to see new additions to the DEX.
