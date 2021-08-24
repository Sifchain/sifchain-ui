import {
  Chain,
  Network,
  AssetAmount,
  IAssetAmount,
  getChainsService,
} from "../../entities";
import { BaseChain } from "./_BaseChain";

export class SifchainChain extends BaseChain implements Chain {}
