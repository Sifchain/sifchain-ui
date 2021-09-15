import { NetworkEnv } from "../../../config/getEnv";
import mainnet from "./mainnet";
import testnet042Ibc from "./testnet-042-ibc";
import devnet from "./devnet";
import testnet from "./testnet";

// We can't actually retrieve asset addresses from peggy for assets that have never been exported before...
// This means that we do need to record addresses per NetworkEnv.
export const assetAddressesByNetworkEnv: Record<
  NetworkEnv,
  Record<string, string>
> = {
  [NetworkEnv.LOCALNET]: devnet,
  [NetworkEnv.DEVNET]: devnet,
  [NetworkEnv.DEVNET_042]: devnet,
  [NetworkEnv.TESTNET]: testnet,
  [NetworkEnv.TESTNET_042_IBC]: testnet042Ibc,
  [NetworkEnv.MAINNET]: mainnet,
};
