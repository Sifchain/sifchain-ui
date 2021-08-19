import { NetworkEnv } from "../getEnv";
import { JsonChainConfig, Network } from "../../entities";

export type NetworkChainsLookup = Record<Network, JsonChainConfig>;

export type NetEnvChainsLookup = Record<NetworkEnv, NetworkChainsLookup>;
