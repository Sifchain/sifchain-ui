"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSdkConfig = void 0;
const __1 = require("../");
const getSdkConfig = (params) => {
  const { tag, ethAssetTag, sifAssetTag } =
    __1.profileLookup[params.environment];
  if (typeof tag == "undefined")
    throw new Error("environment " + params.environment + " not found");
  return (0, __1.getConfig)(tag, sifAssetTag, ethAssetTag);
};
exports.getSdkConfig = getSdkConfig;
//# sourceMappingURL=getSdkConfig.js.map
