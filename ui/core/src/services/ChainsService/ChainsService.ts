import {
  IAsset,
  JsonChainConfig,
  Chain,
  Network,
  setChainsService,
} from "../../entities";
import {
  SifchainChain,
  EthereumChain,
  CosmoshubChain,
  AkashChain,
  IrisChain,
  SentinelChain,
} from "./chains";
import { NetworkChainsLookup } from "../../config/chains/NetEnvChainsLookup";

export * from "./chains";

export type AnyChain =
  | SifchainChain
  | EthereumChain
  | CosmoshubChain
  | IrisChain
  | AkashChain
  | SentinelChain;

export type ChainsServiceContext = {
  assets: IAsset[];
  chains: NetworkChainsLookup;
};

const networkChainCtorLookup = {
  [Network.SIFCHAIN]: SifchainChain,
  [Network.ETHEREUM]: EthereumChain,
  [Network.COSMOSHUB]: CosmoshubChain,
  [Network.IRIS]: IrisChain,
  [Network.AKASH]: AkashChain,
  [Network.SENTINEL]: SentinelChain,
};

export class ChainsService {
  private _list: Chain[] = [];
  private map: Map<Network, AnyChain> = new Map();

  addChain(chain: AnyChain) {
    this._list.push(chain);
    this.map.set(chain.network, chain);
  }

  findChainAssetMatch(match: Partial<IAsset>) {
    const matchKeys = Object.keys(match) as Array<keyof IAsset>;
    let chain, asset: IAsset;
    for (chain of this.list()) {
      for (asset of chain.assets) {
        const isMatch = matchKeys.every((key) => asset[key] === match[key]);
        if (isMatch) return { asset, chain };
      }
    }
  }
  findChainAssetMatchOrThrow(
    match: Partial<IAsset>,
  ): {
    chain: Chain;
    asset: IAsset;
  } {
    const result = this.findChainAssetMatch(match);
    if (!result) {
      throw new Error(
        `No matching chain + asset found for ${JSON.stringify(match)}`,
      );
    }
    return result;
  }

  constructor(p: {
    assets: IAsset[];
    chains: Record<Network, JsonChainConfig>;
  }) {
    Object.keys(networkChainCtorLookup).forEach((network) => {
      const n = network as Network;
      this.addChain(
        new networkChainCtorLookup[n]({
          assets: p.assets,
          chainConfig: p.chains[n],
        }),
      );
    });
    setChainsService(this);
  }

  list() {
    return this._list;
  }
  get(network: Network): AnyChain {
    const chain = this.map.get(network);
    if (!chain) throw new Error("Chain not found for " + network);
    return chain;
  }
}

export default function createChainsService(c: ChainsServiceContext) {
  return new ChainsService(c);
}
