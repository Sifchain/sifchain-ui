import { IAsset, Network } from "../../../entities";

const sifchainDevnetAssets: { assets: IAsset[] } = {
  assets: [
    {
      symbol: "uatom",
      decimals: 6,
      name: "Atom",
      network: Network.SIFCHAIN,
      label: "Atom",
      imageUrl:
        "https://assets.coingecko.com/coins/images/1481/small/cosmos_hub.png?1555657960",
      displaySymbol: "atom",
      homeNetwork: Network.COSMOSHUB,
    },
    {
      symbol: "uakt",
      decimals: 6,
      name: "Akash Token",
      network: Network.SIFCHAIN,
      label: "AKT",
      imageUrl:
        "https://assets.coingecko.com/coins/images/12785/small/akash-logo.png?1615447676",
      displaySymbol: "akt",
      homeNetwork: Network.AKASH,
    },
    {
      symbol: "udvpn",
      decimals: 6,
      name: "Sentinel",
      network: Network.SIFCHAIN,
      label: "Sentinel",
      imageUrl:
        "https://assets.coingecko.com/coins/images/14879/small/Sentinel_512X512.png?1622174499",
      displaySymbol: "dvpn",
      homeNetwork: Network.SENTINEL,
    },
  ],
};

export default sifchainDevnetAssets;
