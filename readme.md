<p align="center"><a href="https://dex.sifchain.finance" target="_blank" rel="noopener noreferrer"><img src="https://raw.githubusercontent.com/Sifchain/.github/main/assets/Sifchain%20Logo.svg"/>
</a></p>
<p align="center">
⚡️ <b>T H E &nbsp;&nbsp; O M N I C H A I N &nbsp;&nbsp; J A V A S C R I P T &nbsp;&nbsp;  L I B R A R Y</b> ⚡️
</p>
<p align="center">
  <b>
  FRONTEND 🤝 TRADING BOTS 🤝 ARBITRAGE
  </b>
</p>
<hr>

## ✨ Links

### 📖 [Documentation](https://github.com/Sifchain/sifchain-ui/tree/develop/core#getting-started)

_Learn how to use Sifchain.js._

### 🖼 [Frontend](https://github.com/Sifchain/sifchain-ui/tree/develop/app)

_Sifchain's User Interface_

## Development

| script                   | description                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------------- |
| `yarn dev`               | Run the view app in development mode hotloading changes                                     |
| `yarn build`             | Build a deployable app to the `app/dist` folder                                             |
| `yarn start`             | Serve the deployable app from the `app/dist` folder                                         |
| `yarn test`              | Run unit and integration tests                                                              |
| `yarn test --tag [tag]`  | Run unit and integration tests against a particular tag (develop/master/sifnode commit etc) |
| `yarn stack`             | Run backing services based on the latest sifnode release                                    |
| `yarn lint`              | Lint the code                                                                               |
| `yarn lint --quick`      | Quick lint staged code (mainly used in our pre-commit hook)                                 |
| `yarn e2e`               | Run end to end tests against code built in `app/dist`                                       |
| `yarn e2e --debug`       | Run end to end tests in debug mode against the `dev` server. (Good for writing tests)       |
| `yarn e2e --tag [tag]`   | Run end to end tests against a particular tag (develop/master/sifnode commit etc)           |
| `yarn storybook`         | Launch storybook                                                                            |
| `yarn storybook --build` | Build storybook to the `storybook-static` folder                                            |
| `yarn advance`           | Advance the blockchain by the given amount of blocks. Eg. `yarn advance 51`                 |

Running a command with the `--help` flag will display a help message explaining what the command does.

## Deployment

See ./app/README.md.

## Testing against environments

Attaching a query string var `_env` will set cookies to point your build to any environment you want:

| url                                  | env                    |
| ------------------------------------ | ---------------------- |
| http://localhost:8080?_env=mainnet  | MAINNET                |
| http://localhost:8080?_env=testnet  | TESTNET                |
| http://localhost:8080?_env=devnet   | DEVNET                 |
| http://localhost:8080?_env=localnet | LOCALNET               |
| http://localhost:8080?_env=\_       | DEFAULT (Based on url) |

We recommend using bookmarklets:

| name     | location                                                               |
| -------- | ---------------------------------------------------------------------- |
| CLEAR    | `javascript:(() => {l=location;l.href=l.pathname+'?_env=_'})()`        |
| MAINNET  | `javascript:(() => {l=location;l.href=l.pathname+'?_env=mainnet'})()`  |
| TESTNET  | `javascript:(() => {l=location;l.href=l.pathname+'?_env=testnet'})()`  |
| DEVNET   | `javascript:(() => {l=location;l.href=l.pathname+'?_env=devnet'})()`   |
| LOCALNET | `javascript:(() => {l=location;l.href=l.pathname+'?_env=localnet'})()` |
