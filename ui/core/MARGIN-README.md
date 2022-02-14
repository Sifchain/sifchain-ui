# Margin Spin Up

This branch is made to run locally against the `feature/margin-1` branch of sifnode.

To get good init scripts + tokenregistry for `cusdt`, `rowan`, and `ceth`, check out `feature/margin-1-ajoslin`

### Getting sifnode up

Clone sifnode, cd in, check out `feature/margin-1` branch, then run `./scripts/init.sh`. Then, enable the REST api via setting `enable = true` under `[api]` in `~/.sifnoded/config/app.toml`.

Then start sifnode via `./scripts/run.sh`.

Finally, create the first pool, rowan+ceth: 
```
sifnoded tx clp create-pool --from sif --keyring-backend test --symbol ceth --nativeAmount 200000000000000000 --externalAmount 2000000000000000 --fees 100000000000000000rowan --chain-id localnet -y
```

Now you will be able to run the sifchain ui against localnet via `http://localhost:8080?_env=localnet`.

### Local Env: Running it with UI!

#### Gotta Proxy

Unfortunately, the Sifnode APIs do *not* have CORs enabled. So to call your local sifnode APIs from the browser, you will need to proxy them.

We already have a proxy server set up at `https://github.com/sifchain/proxies`. Clone that, `yarn` and run `vc dev`. Now you will have a proxy server running at port 3000. This proxy server already has configuration to point at your local node.

#### User interface time?!

Take the mnemonic from sifnode's `scripts/init.sh` at the top, add it to Keplr, and switch to that account.

The local chain will be set up with `cusdt`, `rowan`, and `ceth`.

These are enough assets to test margin.

Now go to http://localhost:8080/#/margin and you should be set!

