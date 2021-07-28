import { ChainInfo } from "@keplr-wallet/types";
import { IBCChannelStore } from "@keplr-wallet/stores";
import { Network } from "../../../entities";

export interface IBCChainConfig {
  network: Network;
  chainId: string;
  rpcUrl: string;
  restUrl: string;
  keplrChainInfo: ChainInfo;
}
