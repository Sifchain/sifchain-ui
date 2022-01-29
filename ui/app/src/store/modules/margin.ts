import { useNativeChain } from "@/hooks/useChains";
import { useCore } from "@/hooks/useCore";
import { Amount, AssetAmount, Pool, Pool as PoolEntity } from "@sifchain/sdk";
import { NativeDexClient } from "@sifchain/sdk/src/clients";
import * as CLPV1Types from "@sifchain/sdk/src/generated/proto/sifnode/clp/v1/types";
import * as MarginV1Types from "@sifchain/sdk/src/generated/proto/sifnode/margin/v1/types";
import { RegistryEntry } from "@sifchain/sdk/src/generated/proto/sifnode/tokenregistry/v1/types";
import { Vuextra } from "../Vuextra";
import { accountStore } from "./accounts";

let nativeDexClientPromise: Promise<NativeDexClient>;
const loadNativeDexClient = async () => {
  if (!nativeDexClientPromise) {
    nativeDexClientPromise = NativeDexClient.connectByChain(useNativeChain());
  }
  return nativeDexClientPromise;
};

let registry: RegistryEntry[] = [];
useCore()
  .services.tokenRegistry.load()
  .then((r) => (registry = r));

export const marginStore = Vuextra.createStore({
  name: "margin",
  options: {
    devtools: true,
  },
  state: {
    positions: [] as MarginV1Types.MTP[],
    pools: [] as CLPV1Types.Pool[],
  },
  getters: (state) => ({
    poolEntities() {
      return state.pools
        .map((pool) => {
          const externalSymbol = pool.externalAsset?.symbol;
          const entry = registry.find(
            (item) =>
              item.denom === externalSymbol ||
              item.baseDenom === externalSymbol,
          );
          if (!entry) return null;

          const asset = useNativeChain().findAssetWithLikeSymbol(
            entry.baseDenom,
          );

          if (!asset) return null;

          return PoolEntity(
            AssetAmount(useNativeChain().nativeAsset, pool.nativeAssetBalance),
            AssetAmount(asset, pool.externalAssetBalance),
            Amount(pool.poolUnits),
          );
        })
        .filter((item) => item != null) as PoolEntity[];
    },
    stablePool() {
      return state.pools
        .filter((a, b) => {
          const symbol = a.externalAsset?.symbol.toLowerCase() || "";
          return symbol.includes("ust") || symbol.includes("usd");
        })
        .sort((a, b) => {
          return (
            parseInt(a.externalAssetBalance) - parseInt(b.externalAssetBalance)
          );
        })[0];
    },
  }),
  actions: (ctx) => ({
    async fetchPools() {
      const client = await loadNativeDexClient();
      const res = await client.query.clp.GetPools({});
      if (
        !res.pools.find((p) =>
          p.externalAsset?.symbol.toLowerCase().includes("usdt"),
        )
      ) {
        const newPools = res.pools.concat({
          nativeAssetBalance: "2872432812156104395293623",
          externalAssetBalance: "238478998483",
          poolUnits: "745906538481591062324326",
          externalLiabilities: "0",
          externalCustody: "0",
          nativeLiabilities: "0",
          nativeCustody: "0",
          health: "0",
          interestRate: "0",
          externalAsset: {
            symbol: "cusdt",
          },
        } as CLPV1Types.Pool);
        marginStore.setPools(newPools);
      } else {
        marginStore.setPools(res.pools);
      }
    },
    async fetchAccountPositions() {
      const client = await loadNativeDexClient();
      if (accountStore.state.sifchain.address) {
        const res = await client.query.margin.GetPositionsForAddress({
          address: accountStore.state.sifchain.address,
        });
        marginStore.setPositions(res.mtps);
      }
    },
  }),
  mutations: (state) => ({
    setPools(pools: CLPV1Types.Pool[]) {
      state.pools = pools;
    },
    setPositions(positions: MarginV1Types.MTP[]) {
      state.positions = positions;
    },
  }),
  modules: [],
  async init() {},
});
