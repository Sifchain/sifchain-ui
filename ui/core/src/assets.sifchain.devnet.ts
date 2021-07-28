import { IAsset, Network } from "./entities";

const sifchainDevnetAssets: { assets: IAsset[] } = {
  assets: [
    {
      symbol:
        "ibc/287EE075B7AADDEB240AFE74FA2108CDACA50A7CCD013FA4C1FCD142AFA9CA9A",
      decimals: 6,
      name: "Cosmos",
      network: Network.SIFCHAIN,
      label: "Photon",
      imageUrl:
        "https://s2.coinmarketcap.com/static/img/coins/200x200/3794.png",
      displaySymbol: "photon",
    },
  ],
};

export default sifchainDevnetAssets;
