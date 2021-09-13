import ethereumAssets from "./ethereum/assets.ethereum.mainnet.json";
import sifAssets from "./sifchain/assets.sifchain.mainnet";
import { IAsset } from "../../entities";

console.log(JSON.stringify(run(), null, 2));

function run() {
  const lookup: Record<string, Partial<IAsset>> = {};
  [...sifAssets.assets].forEach((asset) => {
    lookup[asset.symbol.toLowerCase()] = {
      imageUrl: asset.imageUrl,
      decommissioned: asset.decommissioned || undefined,
      decommissionReason: asset.decommissionReason || undefined,
    };
  });

  return lookup;
}
