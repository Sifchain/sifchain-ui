var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
import { Network, Asset } from "../entities";
import { getMetamaskProvider } from "../clients/wallets/ethereum/getMetamaskProvider";
/**
 * Convert asset config to label with appropriate capitalization
 */
function parseLabel(a) {
  if (a.network === Network.SIFCHAIN) {
    return a.symbol.indexOf("c") === 0
      ? "c" + a.symbol.slice(1).toUpperCase()
      : a.symbol.toUpperCase();
  }
  // network is ethereum
  return a.symbol === "erowan" ? "eROWAN" : a.symbol.toUpperCase();
}
function parseAsset(a) {
  return Asset(
    Object.assign(Object.assign({}, a), {
      displaySymbol: a.displaySymbol || a.symbol,
      label: parseLabel(a),
    }),
  );
}
export function parseAssets(configAssets) {
  return configAssets.map(parseAsset);
}
export function parseConfig(
  config,
  assets,
  chainConfigsByNetwork,
  peggyCompatibleCosmosBaseDenoms,
) {
  var _a;
  const nativeAsset = assets.find((a) => a.symbol === config.nativeAsset);
  if (!nativeAsset)
    throw new Error(
      "No nativeAsset defined for chain config:" + JSON.stringify(config),
    );
  const bridgetokenContractAddress =
    (_a = assets.find((token) => token.symbol === "erowan")) === null ||
    _a === void 0
      ? void 0
      : _a.address;
  const sifAssets = assets
    .filter((asset) => asset.network === "sifchain")
    .map((sifAsset) => {
      return {
        coinDenom: sifAsset.symbol,
        coinDecimals: sifAsset.decimals,
        coinMinimalDenom: sifAsset.symbol,
      };
    });
  return {
    peggyCompatibleCosmosBaseDenoms,
    chains: [],
    chainConfigsByNetwork: chainConfigsByNetwork,
    sifAddrPrefix: config.sifAddrPrefix,
    sifApiUrl: config.sifApiUrl,
    sifWsUrl: config.sifWsUrl,
    sifRpcUrl: config.sifRpcUrl,
    sifChainId: config.sifChainId,
    cryptoeconomicsUrl: config.cryptoeconomicsUrl,
    blockExplorerUrl: config.blockExplorerUrl,
    getWeb3Provider:
      config.web3Provider === "metamask"
        ? getMetamaskProvider
        : () =>
            __awaiter(this, void 0, void 0, function* () {
              return config.web3Provider;
            }),
    assets,
    nativeAsset,
    bridgebankContractAddress: config.bridgebankContractAddress,
    bridgetokenContractAddress,
    keplrChainConfig: Object.assign(
      Object.assign({}, config.keplrChainConfig),
      {
        rest: config.sifApiUrl,
        rpc: config.sifRpcUrl,
        chainId: config.sifChainId,
        currencies: sifAssets,
      },
    ),
  };
}
//# sourceMappingURL=parseConfig.js.map
