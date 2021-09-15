import {
  getBridgeBankContract,
  bridgeBankFetchTokenAddress,
} from "../../services/EthbridgeService/bridgebankContract";
import Web3 from "web3";
import { provider } from "web3-core";
import { IAsset, Network } from "../../entities";
import { chainConfigsByChainId } from "../../config/chains";
import { assetMetadataLookup } from "./assetMetadata";
import {
  loadSanitizedRegistryEntries,
  getRegistryEntryHomeNetwork,
} from "./utils";
import { mapRegistryEntryToNativeAsset } from "./loadNativeAssets";
import { symbolWithoutPrefix } from "./utils";
import { NetworkEnv } from "../../config/getEnv";
import { assetAddressesByNetworkEnv } from "./assetAddresses";

export type EthereumAssetLoadParams = {
  sifRpcUrl: string;
  sifChainId: string;
  bridgebankContractAddress: string;
  getWeb3Provider: () => Promise<provider>;
  networkEnv: NetworkEnv;
};

export const ethSymbolLookup: Record<string, string> = {
  cdaofi: "DAOfi",
  csusd: "sUSD",
  rowan: "EROWAN",
};

export default async function loadEthereumAssets(
  params: EthereumAssetLoadParams,
) {
  const assetAddressLookup = assetAddressesByNetworkEnv[params.networkEnv];
  const entries = await loadSanitizedRegistryEntries(params);

  const web3 = new Web3(await params.getWeb3Provider());
  const bridgeContract = await getBridgeBankContract(
    web3,
    params.bridgebankContractAddress,
    params.sifChainId,
  );

  const ethAssets: IAsset[] = [];

  for (let entry of entries) {
    try {
      const nativeAsset = mapRegistryEntryToNativeAsset(entry);

      // We can't actually reliably retrieve asset addresses from peggy for assets that have never been exported before...
      // This means that we do need to record addresses per NetworkEnv.
      const ethSymbol =
        ethSymbolLookup[nativeAsset.symbol] ||
        symbolWithoutPrefix(nativeAsset.symbol).toUpperCase();

      let address: string | undefined =
        assetAddressLookup[ethSymbol.toLowerCase()];

      if (!address && ethSymbol !== "ETH") {
        if (nativeAsset.homeNetwork === Network.ETHEREUM) {
          address = await bridgeContract.methods
            .getLockedTokenAddress(ethSymbol)
            .call();
        }
        if (!address || !+address) {
          address = await bridgeBankFetchTokenAddress(
            web3,
            params.bridgebankContractAddress,
            params.sifChainId,
            nativeAsset,
          );
        }
      }

      const ethAssetHomeNetwork =
        ethSymbol === "EROWAN" ? Network.ETHEREUM : nativeAsset.homeNetwork;

      if (ethSymbol === "ETH" || (address && !!+address)) {
        const ethAsset = {
          address: ethSymbol === "ETH" ? undefined : address,
          ...nativeAsset,
          ...assetMetadataLookup[ethSymbol.toLowerCase()],
          symbol: ethSymbol,
          network: Network.ETHEREUM,
          homeNetwork: ethAssetHomeNetwork,
        };
        ethAssets.push(ethAsset);
      }
    } catch (error) {
      console.log("skip", entry);
      console.error(error);
      continue;
    }
  }

  return ethAssets;
}
