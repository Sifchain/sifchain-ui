import { NetworkEnv } from "../../getEnv";
import { NetEnvChainConfigLookup } from "../NetEnvChainConfigLookup";
import { EVMOS_MAINNET } from "./evmos-mainnet";

export default <NetEnvChainConfigLookup>{
  [NetworkEnv.LOCALNET]: EVMOS_MAINNET,
  [NetworkEnv.MAINNET]: EVMOS_MAINNET,
};
