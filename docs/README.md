# Sifchain Frontend Guide

Welcome to the Sifchain frontend codebase! Our frontend code is 100% open source, and we welcome all contributors. Feel free discuss in our communities

- Discord
- Telegram
- Github issues

## Stack

The Sifnode client is a Vue v3 app, we use;

- Typescript
- Webpack
- SCSS Loader
- A mixture of Vue template's and JSX
- Prettier
- Eslint
- Playwright
- Storybook

## Simple Setup

First of all you need is Keplr / Metamask installed. Generate a wallet for each and connect them to devnet and ropsten.

Run the yarn commands, pointed at devnet.

```
export VUE_APP_DEPLOYMENT=develop
export VUE_APP_ETHEREUM_ASSET_TAG=ethereum.mainnet
export VUE_APP_SIFCHAIN_ASSET_TAG=sifchain.mainnet

// In one tab
yarn app:serve

// In another tab
yarn core:watch
```

Open up your browser on [localhost:8080](localhost:8080)

Well done!

Later in the documentation there is more ways you can setup your environment

This will boot up the client with it putting at our hosted devnet, if you would like to point the client at prod, then run this command instead;

Make sure you point Keplr/Metamask at mainnet etc

## Full Setup

Runs the entire sifnode stack locally

Requirements:

- Docker

If you would like to test to run the entire stack locally. Use “yarn stack”.

# Changing Environments (Keplr/Metamask)

## Storybook Setup

```
yarn storybook
```
