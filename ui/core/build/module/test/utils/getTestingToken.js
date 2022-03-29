import localethereumassets from "../../config/networks/ethereum/assets.ethereum.localnet.json";
import localsifassets from "../../config/networks/sifchain/assets.sifchain.localnet";
import { parseAssets } from "../../utils/parseConfig";
import { Asset } from "../../entities";
const assets = [...localethereumassets.assets, ...localsifassets.assets];
export function getTestingToken(tokenSymbol) {
  const supportedTokens = parseAssets(assets).map((asset) => {
    Asset.set(asset.symbol, asset);
    return asset;
  });
  const asset = supportedTokens.find(
    ({ symbol }) => symbol.toUpperCase() === tokenSymbol.toUpperCase(),
  );
  if (!asset) throw new Error(`${tokenSymbol} not returned`);
  return asset;
}
export function getTestingTokens(tokens) {
  return tokens.map(getTestingToken);
}
export function getBalance(balances, symbol) {
  const bal = balances.find(
    ({ asset }) => asset.symbol.toUpperCase() === symbol.toUpperCase(),
  );
  if (!bal) throw new Error("Symbol not found in balances");
  return bal;
}
//# sourceMappingURL=getTestingToken.js.map
