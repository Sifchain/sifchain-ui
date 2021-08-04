import { IAsset, Network } from "../../../entities";

const cosmoshubTestnetAssets: { assets: IAsset[] } = {
  assets: [
    {
      displaySymbol: "photon",
      symbol: "uphoton",
      ibcDenom: "uphoton",
      decimals: 6,
      label: "PHOTON",
      imageUrl:
        "https://assets.coingecko.com/coins/images/1481/small/cosmos_hub.png?1555657960",
      name: "Cosmos",
      network: Network.COSMOSHUB,
      homeNetwork: Network.COSMOSHUB,
    },
  ],
};

export default cosmoshubTestnetAssets;
