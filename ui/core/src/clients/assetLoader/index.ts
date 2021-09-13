import loadEthereumAssets, {
  EthereumAssetLoadParams,
} from "./loadEthereumAssets";
import loadNativeAssets, { NativeAssetLoadParams } from "./loadNativeAssets";
import { Network, IAsset } from "../../entities";
import { NetworkEnv } from "../../config/getEnv";
import { configMapByNetworkEnv } from "../../config/getConfig";

type LoadAssetParams = EthereumAssetLoadParams & NativeAssetLoadParams;

type AssetLoader = (params: LoadAssetParams) => Promise<IAsset[]>;

export const loadAssets = async (
  networkEnv: NetworkEnv,
  getWeb3Provider: EthereumAssetLoadParams["getWeb3Provider"],
) => {
  const config = configMapByNetworkEnv[networkEnv];

  const params = {
    networkEnv,
    getWeb3Provider,
    ...config,
  };

  return {
    native: await loadNativeAssets(params),
    ethereum: await loadEthereumAssets(params),
  };
};
