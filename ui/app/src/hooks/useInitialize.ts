import { Asset, Network } from "@sifchain/sdk";
import { computed } from "@vue/reactivity";
import { useCore } from "./useCore";
import { useSubscription } from "./useSubscrition";
import { rootStore } from "@/store";
import { watch } from "vue";
import { accountStore } from "@/store/modules/accounts";
import { getTokenIconUrl } from "@/utils/getTokenIconUrl";
import { getTokenContract } from "../../../core/src/services/EthbridgeService/tokenContract";
import { convertImageUrlToDataUrl } from "@/utils/convertImageUrlToDataUrl";
import { useChains } from "./useChains";
import {
  BridgeTx,
  bridgeTxEmitter,
} from "@sifchain/sdk/src/clients/bridges/BaseBridge";
import { useFaucet } from "./useFaucet";

const mirrorToCore = (network: Network) => {
  const data = accountStore.state[network];

  useCore().store.wallet.set(network, {
    ...useCore().store.wallet.get(network),
    isConnected: data.connected,
    balances: data.balances,
    address: data.address,
  });
};

// NOTE(ajoslin): we only want to auto-connect to a wallet/chain if the user has
// connected before. First time user connects, we persist it to localStorage.
// If and only if that value is in localStorage on load, auto try to connect the wallet on load.
// This prevents many Keplr connect popups from showing on load for each network.
// NOTE(mccallofthewild): Above behavior is now deprecated for keplr wallet, as the getKey method
// now exists. Will auto-query balances.
const persistConnected = {
  get: (network: Network) => {
    return (
      useCore().services.storage.getItem(`walletConnected_${network}`) ===
      "true"
    );
  },
  set: (network: Network) => {
    return useCore().services.storage.setItem(
      `walletConnected_${network}`,
      "true",
    );
  },
};

let connectAll = () => {
  const core = useCore();
  if (core.services.storage.getItem("hasRejectedConnectAll") === "true") {
    return;
  }
  core.services?.wallet.tryConnectAllWallets().catch((e) => {
    core.services.storage.setItem("hasRejectedConnectAll", "true");
  });
};
export function useInitialize() {
  connectAll();
  connectAll = () => {};

  useFaucet();

  const { usecases, store, services, config } = useCore();

  services.wallet.metamaskProvider.onChainChanged(() =>
    window.location.reload(),
  );
  services.wallet.metamaskProvider.onAccountChanged(() =>
    window.location.reload(),
  );
  services.wallet.keplrProvider.onAccountChanged(() =>
    window.location.reload(),
  );

  // this is low pri... but we want it semi quick
  setTimeout(() => {
    usecases.clp.syncPools.syncPublicPools();
  }, 500);

  services.ethbridge
    .addEthereumAddressToPeggyCompatibleCosmosAssets()
    .then(() => {
      async function generateUniswapWhitelist() {
        const whitelist = {
          name: "Sifchain",
          logoURI: getTokenIconUrl(
            Asset("rowan"),
            `https://dex-sifchain-finance.ipns.dweb.link/`,
          )?.replace("/public/", ""),
          keywords: ["peggy", "pegged assets", "cosmos ecosystem"],
          tags: {},
          timestamp: new Date().toISOString(),
          tokens: [
            ...(
              await Promise.all(
                [...config.peggyCompatibleCosmosBaseDenoms].map(
                  async (denom) => {
                    const web3 = await services.wallet.metamaskProvider.getWeb3();
                    const asset = config.assets.find(
                      (a) =>
                        a.network === Network.ETHEREUM && a.symbol === denom,
                    );
                    if (!asset) return;
                    const addressOfToken = await services.ethbridge.fetchTokenAddress(
                      asset,
                    );
                    const tokenContract = new web3.eth.Contract(
                      await fetch(
                        `https://gist.githubusercontent.com/veox/8800debbf56e24718f9f483e1e40c35c/raw/f853187315486225002ba56e5283c1dba0556e6f/erc20.abi.json`,
                      ).then((r) => r.json()),
                      addressOfToken || "",
                    );
                    const symbol = await tokenContract.methods.symbol().call();
                    const decimals = await tokenContract.methods
                      .decimals()
                      .call();
                    const name = await tokenContract.methods.name().call();
                    const imageUrl = getTokenIconUrl(
                      asset,
                      "https://dex-sifchain-finance.ipns.dweb.link/",
                    )?.replace("/public/", "");
                    if (!imageUrl) return;
                    const item = {
                      chainId: 1,
                      address: addressOfToken,
                      symbol,
                      name,
                      decimals: +decimals,
                      tags: [],
                      logoURI: imageUrl,
                    };
                    return item;
                  },
                ),
              )
            ).filter((a) => !!a),
          ],
          version: {
            major: 1,
            minor: 0,
            patch: 0,
          },
        };
        console.log(JSON.stringify(whitelist, null, 2));
      }
      // generateUniswapWhitelist();
    });

  // Support legacy code that uses sif service getState().
  watch(
    accountStore.state.sifchain,
    (storeState) => {
      const state = services.sif.getState();

      if (storeState.connected && !state.connected) {
        accountStore.updateBalances(Network.SIFCHAIN);
        accountStore.pollBalances(Network.SIFCHAIN);

        usecases.interchain.txManager.loadSavedTransferList(storeState.address);
      }

      state.balances = storeState.balances;
      state.address = storeState.address;
      state.connected = storeState.connected;
      state.accounts = [storeState.address];
    },
    { deep: true },
  );

  for (const network of Object.values(Network)) {
    if (useChains().get(network).chainConfig.hidden) continue;
    accountStore.actions.loadIfConnected(network);
    watch(
      accountStore.refs[network].computed(),
      (value) => {
        if (value.connected) {
          persistConnected.set(network);
          mirrorToCore(network);
        }
      },
      {
        deep: true,
      },
    );
    if (
      persistConnected.get(network) &&
      !accountStore.state[network].connected
    ) {
      accountStore.actions.load(network);
    }
  }

  bridgeTxEmitter.on("tx_sent", (tx: BridgeTx) => {
    accountStore.updateBalances(tx.toChain.network);
    accountStore.updateBalances(tx.fromChain.network);
  });
  bridgeTxEmitter.on("tx_complete", (tx: BridgeTx) => {
    accountStore.updateBalances(tx.toChain.network);
    accountStore.updateBalances(tx.fromChain.network);
  });

  // useSubscription(
  //   computed(() => store.wallet.get(Network.SIFCHAIN).address),
  //   () => usecases.reward.subscribeToRewardData("vs"),
  // );
  // useSubscription(
  //   computed(() => store.wallet.get(Network.SIFCHAIN).address),
  //   () => usecases.reward.subscribeToRewardData("lm"),
  // );

  // useSubscription(
  //   computed(() => store.wallet.get(Network.SIFCHAIN).lmUserData),
  //   usecases.reward.notifyLmMaturity,
  // );
  // useSubscription(
  //   computed(() => store.wallet.get(Network.SIFCHAIN).vsUserData),
  //   usecases.reward.notifyVsMaturity,
  // );
}
