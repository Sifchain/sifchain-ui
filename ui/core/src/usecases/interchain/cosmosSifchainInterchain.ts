import { UsecaseContext } from "..";
import {
  IAssetAmount,
  TransactionStatus,
  Network,
  Chain,
} from "../../entities";
import {
  InterchainApi,
  ExecutableTransaction,
  SifchainInterchainTx,
  InterchainParams,
  IBCInterchainTx,
} from "./_InterchainApi";
import { SifchainChain, CosmoshubChain } from "../../services/ChainsService";
import { isBroadcastTxFailure } from "@cosmjs/launchpad";
import { findAttribute, parseLogs, Log } from "@cosmjs/launchpad/build/logs";
import { createIteratorSubject } from "../../utils/iteratorSubject";

import { parseTxFailure } from "../../services/SifService/parseTxFailure";

export class CosmosSifchainInterchainApi {
  constructor(public context: UsecaseContext) {}

  async estimateFees(params: InterchainParams) {
    return this.context.services.ibc.estimateFees(params);
  }

  transfer(params: InterchainParams) {
    return this.context.services.ibc.transfer(params);
  }

  subscribeToTransfer(tx: BridgeTx): AsyncGenerator<TransactionStatus> {
    return this.context.services.ibc.subscribeToTransfer(tx);
  }
}
