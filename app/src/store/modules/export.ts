import { Asset, IAssetAmount, IBCChainConfig, Network } from "@sifchain/sdk";
import { BridgeEvent } from "@sifchain/sdk/src/clients/bridges/BaseBridge";
import {
  Permission,
  RegistryEntry,
} from "@sifchain/sdk/src/generated/proto/sifnode/tokenregistry/v1/types";

import { useChains, useChainsList, useNativeChain } from "~/hooks/useChains";
import { useCore } from "~/hooks/useCore";
import { Vuextra } from "~/store/Vuextra";

import { accountStore } from "./accounts";
import { flagsStore, isChainFlaggedDisabled } from "./flags";
import { runTransfer } from "./import";

export type ExportDraft = {
  amount: string;
  network: Network;
  symbol: string;
  unpegEvent: BridgeEvent | undefined;
};

type State = {
  draft: ExportDraft;
};

let registry: RegistryEntry[] = [];

useCore()
  .services.tokenRegistry.load()
  .then((r) => (registry = r));

export const exportStore = Vuextra.createStore({
  name: "export",
  options: {
    devtools: true,
  },
  state: {
    draft: {
      amount: "0",
      network: Network.ETHEREUM,
      symbol: "eth",
      unpegEvent: undefined,
    },
  } as State,
  getters: (state) => ({
    chains() {
      const IBC_ETHEREUM_ENABLED = flagsStore.state.peggyForCosmosTokens;
      const ERC20_IBC_TRANSFERS_ENABLED = flagsStore.state.ibcForEthTokens;
      const asset = Asset(state.draft.symbol);

      const isPeggyWhitelistedIBCAsset =
        useCore().config.peggyCompatibleCosmosBaseDenoms.has(asset.symbol);

      const registryEntry = registry.find((e) => e.baseDenom === asset.symbol);

      const visibleChains = useChainsList().filter(
        (c) =>
          c.network !== Network.SIFCHAIN &&
          !c.chainConfig.hidden &&
          !isChainFlaggedDisabled(c),
      );

      // ERC-20 Assets (And Rowan)
      // These can be exported back to ETH and to chains with erc20 transfers enabled.
      if (
        ERC20_IBC_TRANSFERS_ENABLED &&
        registryEntry?.permissions.includes(Permission.IBCEXPORT) &&
        (asset.symbol === useNativeChain().nativeAsset.symbol ||
          asset.homeNetwork === Network.ETHEREUM)
      ) {
        return visibleChains.filter((chain) => {
          if (chain.network === Network.ETHEREUM) return true;

          const ibcConfig = chain.chainConfig as IBCChainConfig;
          return ibcConfig.features?.erc20Transfers;
        });
      }

      // IBC assets
      // If it's from IBC network, you can export it to its home network.
      return visibleChains.filter((chain) => {
        if (chain.network === Network.ETHEREUM) {
          return isPeggyWhitelistedIBCAsset && IBC_ETHEREUM_ENABLED;
        }
        return chain.network === asset.homeNetwork;
      });
    },
  }),
  mutations: (state) => ({
    setDraft(nextDraft: Partial<ExportDraft>) {
      Object.assign(state.draft, nextDraft);
    },
    setUnpegEvent(unpegEvent: BridgeEvent | undefined) {
      state.draft.unpegEvent = unpegEvent;
    },
  }),
  actions: () => ({
    async runExport(payload: { assetAmount: IAssetAmount }) {
      if (!payload.assetAmount.amount.greaterThan("0")) return;
      runTransfer(
        {
          fromChain: useNativeChain(),
          fromAddress: accountStore.state.sifchain.address,
          toChain: useChains().get(self.state.draft.network),
          toAddress:
            accountStore.state[self.state.draft.network as Network].address,
          assetAmount: payload.assetAmount,
        },
        self.setUnpegEvent,
      );
    },
  }),

  modules: [],
});

const self = exportStore;
