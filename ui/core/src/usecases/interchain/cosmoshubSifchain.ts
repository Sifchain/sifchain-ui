import { UsecaseContext } from "..";
import {
  IAssetAmount,
  Chain,
  TransactionStatus,
  Network,
} from "../../entities";
import {
  InterchainApi,
  ExecutableTransaction,
  ChainTransferTransaction,
} from "./_InterchainApi";
import { SubscribeToTx } from "../peg/utils/subscribeToTx";
import { SifchainChain, CosmoshubChain } from "../../services/ChainsService";
import { isSupportedEVMChain } from "../utils";
import { isBroadcastTxFailure } from "@cosmjs/stargate";
import { parseTxFailure } from "../../services/SifService/parseTxFailure";
import {
  findAttribute,
  Log,
  parseLog,
  parseRawLog,
} from "@cosmjs/stargate/build/logs";

const ETH_CONFIRMATIONS = 50;

export default function createCosmoshubSifchainApi(
  context: UsecaseContext,
  CosmoshubChain: CosmoshubChain,
  sifchainChain: SifchainChain,
) {
  return new CosmoshubSifchainInterchainApi(
    context,
    CosmoshubChain,
    sifchainChain,
  );
}

class CosmoshubSifchainInterchainApi
  extends InterchainApi
  implements InterchainApi {
  async prepareTransfer(
    assetAmount: IAssetAmount,
    fromAddress: string,
    toAddress: string,
  ) {
    return new ExecutableTransaction(
      async (executableTx: ExecutableTransaction) => {
        executableTx.emit("signing");
        try {
          const txSequence = await this.context.services.ibc.transferIBCTokens({
            sourceNetwork: assetAmount.asset.network,
            destinationNetwork: Network.SIFCHAIN,
            assetAmountToTransfer: assetAmount,
          });
          for (let tx of txSequence) {
            if (isBroadcastTxFailure(tx)) {
              this.context.services.bus.dispatch({
                type: "ErrorEvent",
                payload: {
                  message: "IBC Transfer Failed",
                },
              });
              executableTx.emit("tx_error", {
                state: tx.rawLog?.includes("out of gas")
                  ? "out_of_gas"
                  : "failed",
                memo: tx.rawLog || "",
                hash: tx.transactionHash,
              });
              return;
            } else {
              const logs = parseRawLog(tx.rawLog);

              // debugger;
              this.context.services.bus.dispatch({
                type: "PegTransactionPendingEvent",
                payload: {
                  hash: tx.transactionHash,
                },
              });
              executableTx.emit("sent", {
                state: "requested",
                hash: tx.transactionHash,
              });
              const sequence = findAttribute(
                logs,
                "send_packet",
                "packet_sequence",
              );
              const dstChannel = findAttribute(
                logs,
                "send_packet",
                "packet_dst_channel",
              );
              const dstPort = findAttribute(
                logs,
                "send_packet",
                "packet_dst_port",
              );
              const timeoutTimestampNanoseconds = findAttribute(
                logs,
                "send_packet",
                "packet_timeout_timestamp",
              );
              const timeoutTimestampMs =
                BigInt(timeoutTimestampNanoseconds.value as string) /
                BigInt(1000000);

              while (true) {
                await new Promise((r) => setTimeout(r, 1000));
                if (+timeoutTimestampMs.toString() < Date.now()) {
                  this.context.services.bus.dispatch({
                    type: "PegTransactionErrorEvent",
                    payload: {
                      message: "Timed out waiting for packet receipt.",
                      txStatus: {
                        state: "failed",
                        hash: tx.transactionHash,
                      },
                    },
                  });
                  break;
                }
                try {
                  const received = await this.context.services.ibc.checkIfPacketReceived(
                    Network.SIFCHAIN,
                    dstChannel.value,
                    dstPort.value,
                    sequence.value,
                  );
                  if (received) {
                    this.context.services.bus.dispatch({
                      type: "PegTransactionCompletedEvent",
                      payload: {
                        hash: tx.transactionHash,
                      },
                    });
                    return;
                  }
                } catch (e) {}
              }
              return new ChainTransferTransaction(
                this.fromChain.id,
                this.toChain.id,
                fromAddress,
                toAddress,
                tx.transactionHash,
                assetAmount,
              );
            }
          }
        } catch (err) {
          // "signing_error"?
          console.error(err);
          executableTx.emit("approve_error");
          return;
        }
      },
    );
  }

  async subscribeToTransfer(
    transferTx: ChainTransferTransaction,
  ): Promise<TransactionStatus> {
    throw "not implemented";
  }
}
