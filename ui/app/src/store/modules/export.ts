import { useChains, useChainsList, useNativeChain } from "@/hooks/useChains";
import { useCore } from "@/hooks/useCore";
import {
  AppCookies,
  Asset,
  getEnv,
  getNetworkEnv,
  IAsset,
  IAssetAmount,
  Network,
  NetworkEnv,
} from "@sifchain/sdk";
import { BridgeEvent } from "@sifchain/sdk/src/clients/bridges/BaseBridge";
import {
  Permission,
  RegistryEntry,
} from "../../../../core/src/generated/proto/sifnode/tokenregistry/v1/types";
import { Vuextra } from "../Vuextra";
import { accountStore } from "./accounts";
import { flagsStore } from "./flags";
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
      const NATIVE_TOKEN_IBC_EXPORTS_ENABLED = flagsStore.state.ibcForEthTokens;
      const asset = Asset(state.draft.symbol);
      const isExternalIBCAsset = ![Network.ETHEREUM, Network.SIFCHAIN].includes(
        asset.homeNetwork,
      );
      const isPeggyWhitelistedIBCAsset = useCore()!.config.peggyCompatibleCosmosBaseDenoms.has(
        asset.symbol,
      );

      const registryEntry = registry.find((e) => e.baseDenom === asset.symbol);

      return (
        useChainsList()
          .filter(
            (c) => c.network !== Network.SIFCHAIN && !c.chainConfig.hidden,
          )
          // Disallow IBC export of ethereum & sifchain-native tokens
          .filter((n) => {
            // If it's from IBC network, of course you can export it anywhere.
            if (isExternalIBCAsset) return true;

            // Yep, you can export to eth (unless the next .filter below catches you).
            if (n.network === Network.ETHEREUM) return true;

            // Otherwise, only allow exporting to all networks token has permission.
            return (
              NATIVE_TOKEN_IBC_EXPORTS_ENABLED &&
              registryEntry?.permissions.includes(Permission.IBCEXPORT)
            );
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
    setDraft(nextDraft: Partial<ExportDraft>) {
      Object.assign(state.draft, nextDraft);
    },
    setUnpegEvent(unpegEvent: BridgeEvent | undefined) {
      state.draft.unpegEvent = unpegEvent;
    },
  }),
  actions: (ctx) => ({
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
