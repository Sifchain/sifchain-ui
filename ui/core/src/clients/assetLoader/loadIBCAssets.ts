// import { loadSanitizedRegistryEntries } from "./utils";
// import { IAsset, Network } from "../../entities";
// import { mapRegistryEntryToNativeAsset } from "./loadNativeAssets";
// import {
//   chainConfigsByChainId,
//   chainConfigByNetworkEnv,
// } from "../../config/chains";
// import { NetworkEnv } from "../../config/getEnv";
// import TokenRegistryService from "../../services/TokenRegistryService";

// export type IBCAssetLoadParams = {
//   sifRpcUrl: string;
//   network: Network;
// };

// export const createIbcDenom = async (message: string) => {
//   const msgUint8 = new TextEncoder().encode(message); // encode as (utf-8) Uint8Array

//   if (typeof crypto === "undefined") {
//     global.crypto = require("crypto").webcrypto as typeof crypto;
//   }
//   const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8); // hash the message
//   const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
//   const hashHex = hashArray
//     .map((b) => b.toString(16).padStart(2, "0"))
//     .join(""); // convert bytes to hex string

//   const result = "ibc/" + hashHex.toUpperCase();

//   console.log(message, result);
//   return result;
// };

// export default async function loadIBCChainAssets(params: IBCAssetLoadParams) {
//   const entries = await loadSanitizedRegistryEntries(params);
//   return entries.map((entry) => ({
//     ...mapRegistryEntryToNativeAsset(entry),
//     network: params.network,
//     // ibcDenom for external networks must be defined at runtime when found in wallet
//     // There are just too many potential paths available for assets to arrive.
//     ibcDenom: undefined,
//   }));
// }
