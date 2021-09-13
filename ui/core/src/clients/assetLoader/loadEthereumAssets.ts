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

export type EthereumAssetLoadParams = {
  sifRpcUrl: string;
  sifChainId: string;
  bridgebankContractAddress: string;
  getWeb3Provider: () => Promise<provider>;
};

export const ethSymbolLookup: Record<string, string> = {
  cdaofi: "DAOfi",
  csusd: "sUSD",
  rowan: "EROWAN",
};

export default async function loadEthereumAssets(
  params: EthereumAssetLoadParams,
) {
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

      const ethSymbol =
        ethSymbolLookup[nativeAsset.symbol] ||
        symbolWithoutPrefix(nativeAsset.symbol).toUpperCase();

      let lockAddress;
      if (nativeAsset.homeNetwork === Network.ETHEREUM) {
        lockAddress = await bridgeContract.methods
          .getLockedTokenAddress(ethSymbol)
          .call();
      }

      let bridgeAddress;
      if (!+lockAddress) {
        bridgeAddress = await bridgeBankFetchTokenAddress(
          web3,
          params.bridgebankContractAddress,
          params.sifChainId,
          nativeAsset,
        );
      }

      const ethAssetHomeNetwork =
        ethSymbol === "EROWAN" ? Network.ETHEREUM : nativeAsset.homeNetwork;

      if (bridgeAddress || lockAddress) {
        const ethAsset = {
          address: lockAddress && !!+lockAddress ? lockAddress : bridgeAddress,
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
