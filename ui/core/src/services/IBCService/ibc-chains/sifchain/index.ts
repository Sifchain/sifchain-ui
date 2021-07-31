import { NetworkEnv } from "../../../../config/getEnv";
import { NetEnvChainConfigLookup } from "../NetEnvChainConfigLookup";
import { SIFCHAIN_DEVNET_042_IBC } from "./sifchain-devnet-042-ibc";
import { SIFCHAIN_DEVNET_042 } from "./sifchain-devnet-042";
import { SIFCHAIN_TESTNET_042 } from "./sifchain-testnet-042-ibc";

export default <NetEnvChainConfigLookup>{
  [NetworkEnv.TESTNET_042_IBC]: SIFCHAIN_TESTNET_042,
  [NetworkEnv.DEVNET_042]: SIFCHAIN_DEVNET_042,
};
