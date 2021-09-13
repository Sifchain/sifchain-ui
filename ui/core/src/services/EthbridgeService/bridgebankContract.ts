import Web3 from "web3";
import { AbiItem } from "web3-utils";
import { IAsset } from "../../entities";
import fetch from "isomorphic-unfetch";

let abisPromise: Promise<AbiItem[]>;
function fetchBridgebankContractAbis(nativeChainId: string) {
  if (!abisPromise) {
    abisPromise = (async () => {
      const res = await fetch(
        `https://sifchain-changes-server.vercel.app/api/bridgebank-abis/${nativeChainId}`,
      );
      return res.json();
    })();
  }
  return abisPromise;
}

export async function getBridgeBankContract(
  web3: Web3,
  address: string,
  nativeChainId: string,
) {
  const abis = await fetchBridgebankContractAbis(nativeChainId);
  return new web3.eth.Contract(abis as AbiItem[], address);
}

const ETH_ADDRESS = "0x0000000000000000000000000000000000000000";

export async function bridgeBankFetchTokenAddress(
  web3: Web3,
  address: string,
  nativeChainId: string,
  // asset to fetch token address for
  asset: IAsset,
): Promise<string | undefined> {
  // const web3 = new Web3(createWeb3WsProvider());
  const bridgeBankContract = await getBridgeBankContract(
    web3,
    address,
    nativeChainId,
  );

  const possibleSymbols = [
    // IBC assets with dedicated decimal-precise contracts are uppercase
    asset.displaySymbol.toUpperCase(),
    // remove c prefix
    asset.symbol.replace(/^c/, "").toUpperCase(),
    // remove e prefix
    asset.symbol.replace(/^e/, ""),
    // display symbol goes before ibc denom because the dedicated decimal-precise contracts
    // utilize the display symbol
    asset.displaySymbol,
    asset.ibcDenom,
    asset.symbol,
    "e" + asset.symbol,
  ]
    .filter(Boolean)
    .filter((item, index, arr) => arr.indexOf(item) === index);
  for (let symbol of possibleSymbols) {
    // Fetch the token address from bridgebank
    let tokenAddress = await bridgeBankContract.methods
      .getBridgeToken(symbol)
      .call();

    // Token address is a hex number. If it is non-zero (not ethereum or empty) when parsed, return it.
    if (+tokenAddress) {
      return tokenAddress;
    }
    // If this is ethereum, and the token address is empty, return the ethereum address
    if (tokenAddress === ETH_ADDRESS && symbol?.endsWith("eth")) {
      return tokenAddress;
    }
  }
}
