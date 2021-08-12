import { IAsset, Network } from "../../../entities";

const sifchainDevnetAssets: { assets: IAsset[] } = {
  assets: [
    {
      symbol: "uphoton",
      decimals: 6,
      name: "Cosmos",
      network: Network.SIFCHAIN,
      label: "Photon",
      imageUrl:
        "https://assets.coingecko.com/coins/images/1481/small/cosmos_hub.png?1555657960",
      displaySymbol: "photon",
      homeNetwork: Network.COSMOSHUB,
    },
  ],
};

export default sifchainDevnetAssets;
