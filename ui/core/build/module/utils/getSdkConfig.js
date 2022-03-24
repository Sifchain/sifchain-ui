import { profileLookup, getConfig } from "../";
export const getSdkConfig = (params) => {
    const { tag, ethAssetTag, sifAssetTag } = profileLookup[params.environment];
    if (typeof tag == "undefined")
        throw new Error("environment " + params.environment + " not found");
    return getConfig(tag, sifAssetTag, ethAssetTag);
};
//# sourceMappingURL=getSdkConfig.js.map