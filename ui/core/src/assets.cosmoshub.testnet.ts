import { IAsset, Network } from "./entities";

export const cosmoshubTestnetAssets: { assets: IAsset[] } = {
  assets: [
    {
      symbol: "uphoton",
      decimals: 6,
      label: "PHOTON",
      imageUrl:
        "https://assets.coingecko.com/coins/images/279/small/cosmos.png?1595348880",
      name: "Cosmos",
      network: Network.COSMOSHUB,
    },
  ],
};
