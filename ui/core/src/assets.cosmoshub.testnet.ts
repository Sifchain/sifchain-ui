import { IAsset, Network } from "./entities";

const cosmoshubTestnetAssets: { assets: IAsset[] } = {
  assets: [
    {
      displaySymbol: "photon",
      symbol: "uphoton",
      ibcDenom: "uphoton",
      decimals: 6,
      label: "PHOTON",
      imageUrl:
        "https://assets.coingecko.com/coins/images/279/small/cosmos.png?1595348880",
      name: "Cosmos",
      network: Network.COSMOSHUB,
    },
  ],
};

export default cosmoshubTestnetAssets;
