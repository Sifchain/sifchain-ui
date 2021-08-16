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
    {
      symbol: "unyan",
      decimals: 6,
      name: "Nyan",
      network: Network.SIFCHAIN,
      label: "Nyan",
      imageUrl:
        "https://assets.coingecko.com/coins/images/5135/small/IRIS.png?1557999365",
      displaySymbol: "nyan",
      homeNetwork: Network.IRIS,
    },
  ],
};

export default sifchainDevnetAssets;
