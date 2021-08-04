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
        "https://s2.coinmarketcap.com/static/img/coins/200x200/3794.png",
      displaySymbol: "photon",
      homeNetwork: Network.COSMOSHUB,
    },
  ],
};

export default sifchainDevnetAssets;
