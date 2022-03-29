"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        Object.defineProperty(o, k2, {
          enumerable: true,
          get: function () {
            return m[k];
          },
        });
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __exportStar =
  (this && this.__exportStar) ||
  function (m, exports) {
    for (var p in m)
      if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p))
        __createBinding(exports, m, p);
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.networkChainCtorLookup = void 0;
const chains_1 = require("../clients/chains");
const __1 = require("..");
exports.networkChainCtorLookup = {
  [__1.Network.SIFCHAIN]: chains_1.SifchainChain,
  [__1.Network.ETHEREUM]: chains_1.EthereumChain,
  [__1.Network.COSMOSHUB]: chains_1.CosmoshubChain,
  [__1.Network.IRIS]: chains_1.IrisChain,
  [__1.Network.AKASH]: chains_1.AkashChain,
  [__1.Network.SENTINEL]: chains_1.SentinelChain,
  [__1.Network.CRYPTO_ORG]: chains_1.CryptoOrgChain,
  [__1.Network.PERSISTENCE]: chains_1.PersistenceChain,
  [__1.Network.REGEN]: chains_1.RegenChain,
  [__1.Network.OSMOSIS]: chains_1.OsmosisChain,
  [__1.Network.TERRA]: chains_1.TerraChain,
  [__1.Network.JUNO]: chains_1.JunoChain,
  [__1.Network.IXO]: chains_1.IxoChain,
  [__1.Network.BAND]: chains_1.BandChain,
  [__1.Network.LIKECOIN]: chains_1.LikecoinChain,
  [__1.Network.EMONEY]: chains_1.EmoneyChain,
  [__1.Network.STARNAME]: chains_1.StarnameChain,
};
__exportStar(require("./chains"), exports);
__exportStar(require("./native"), exports);
//# sourceMappingURL=index.js.map
