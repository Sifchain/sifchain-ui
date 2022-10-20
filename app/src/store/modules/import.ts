import { useChainsList, useChains, useNativeChain } from "~/hooks/useChains";
import { useCore } from "~/hooks/useCore";
import { Asset, IAssetAmount, Network } from "@sifchain/sdk";
import {
  BridgeEvent,
  BridgeParams,
} from "@sifchain/sdk/src/clients/bridges/BaseBridge";
import { Vuextra } from "../Vuextra";
import { accountStore } from "./accounts";
import {
  flagsStore,
  isAssetFlaggedDisabled,
  isChainFlaggedDisabled,
} from "./flags";

export type ImportDraft = {
  amount: string;
  network: Network;
  symbol: string;
  pegEvent: BridgeEvent | undefined;
};

type State = {
  draft: ImportDraft;
  pendingPegEvents: [string, BridgeEvent][];
};
export const importStore = Vuextra.createStore({
  name: "import",
  options: {
    devtools: true,
  },
  state: {
    draft: {
      amount: "0",
      network: Network.ETHEREUM,
      symbol: "eth",
      pegEvent: undefined,
    },
  } as State,
  getters: (state) => ({
    chains() {
      const IBC_ETHEREUM_ENABLED = flagsStore.state.peggyForCosmosTokens;
      const ERC20_IBC_TRANSFERS_ENABLED = flagsStore.state.ibcForEthTokens;
      const asset = Asset(state.draft.symbol);
      const isExternalIBCAsset = ![Network.ETHEREUM, Network.SIFCHAIN].includes(
        asset.homeNetwork,
      );
      const isPeggyWhitelistedIBCAsset =
        useCore().config.peggyCompatibleCosmosBaseDenoms.has(asset.symbol);
      return (
        useChainsList()
          .filter(
            (c) =>
              c.network !== Network.SIFCHAIN &&
              !c.chainConfig.hidden &&
              !isChainFlaggedDisabled(c),
          )
          // Disallow IBC export of ethereum & sifchain-native tokens
          .filter((n) => {
            if (ERC20_IBC_TRANSFERS_ENABLED) {
              // return all tokens when native IBC exports are enabled
              return true;
            } else {
              // if IBC exports are disabled
              if (
                // if it's rowan or an etherem token
                !isExternalIBCAsset
              ) {
                // only show ethereum network
                return n.network === Network.ETHEREUM;
              } else {
                // let them export any IBC token to any IBC network
                return true;
              }
            }
          })
          .filter((c) => {
            if (isExternalIBCAsset && c.network === Network.ETHEREUM) {
              // if it's a peggy-whitelisted IBC token and IBC ethereum is enabled
              return isPeggyWhitelistedIBCAsset && IBC_ETHEREUM_ENABLED;
            }
            return true;
          })
      );
    },
  }),
  mutations: (state) => ({
    setDraft(nextDraft: Partial<ImportDraft>) {
      if ("network" in nextDraft)
        nextDraft.network = nextDraft.network || Network.ETHEREUM;
      Object.assign(state.draft, nextDraft);
    },
    setPegEvent(pegEvent: BridgeEvent | undefined) {
      state.draft.pegEvent = pegEvent;
    },
  }),
  actions: (ctx) => ({
    async runImport(payload: { assetAmount: IAssetAmount }) {
      if (!payload.assetAmount.amount.greaterThan("0")) return;
      runTransfer(
        {
          fromChain: useChains().get(self.state.draft.network),
          fromAddress:
            accountStore.state[self.state.draft.network as Network].address,
          toChain: useNativeChain(),
          toAddress: accountStore.state.sifchain.address,
          assetAmount: payload.assetAmount,
        },
        self.setPegEvent,
      );
    },
  }),

  modules: [],
});

const self = importStore;

export const runTransfer = async (
  params: BridgeParams,
  onBridgeEvent: (ev: BridgeEvent) => void,
) => {
  if (!params.assetAmount || !params.assetAmount.greaterThan("0")) {
    throw new Error("Please provide an amount");
  }
  if (isAssetFlaggedDisabled(params.assetAmount.asset)) {
    throw new Error(`Asset ${params.assetAmount.asset.symbol} is not enabled!`);
  }

  const bridge = useCore().usecases.interchain(
    params.fromChain,
    params.toChain,
  );
  onBridgeEvent({ type: "approve_started" });
  try {
    await bridge.approveTransfer(params);
    onBridgeEvent({ type: "approve_started" });
  } catch (error) {
    return onBridgeEvent({
      type: "approve_error",
      tx: {
        state: "failed",
        hash: "",
        memo: (error as Error).message,
      },
    });
  }
  onBridgeEvent({ type: "signing" });
  try {
    const tx = await bridge.transfer(params);
    onBridgeEvent({
      type: "sent",
      tx: {
        hash: tx.hash,
        state: "accepted",
      },
    });
  } catch (error) {
    onBridgeEvent({
      type: "tx_error",
      tx: {
        hash: "",
        state: "failed",
        memo: (error as Error).message,
      },
    });
  }
};
