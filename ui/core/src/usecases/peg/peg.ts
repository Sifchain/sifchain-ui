import { isBroadcastTxFailure } from "@cosmjs/stargate";
import {
  findAttribute,
  Log,
  parseLog,
  parseRawLog,
} from "@cosmjs/stargate/build/logs";
import { parseTxFailure } from "../../services/SifService/parseTxFailure";
import { PegConfig } from ".";
import { IAssetAmount, Network, TransactionStatus } from "../../entities";
import { Services } from "../../services";
import { Store } from "../../store";
import { isSupportedEVMChain } from "../utils";
import { isOriginallySifchainNativeToken } from "./utils/isOriginallySifchainNativeToken";
import { SubscribeToTx as SubscribeToTxDep } from "./utils/subscribeToTx";

type PegServices = {
  ethbridge: Pick<
    Services["ethbridge"],
    "burnToSifchain" | "lockToSifchain" | "approveBridgeBankSpend"
  >;
  bus: Pick<Services["bus"], "dispatch">;
  ibc: Pick<Services["ibc"], "transferIBCTokens" | "checkIfPacketReceived">;
};

type PegStore = Pick<Store, "wallet" | "tx">;

export type PegApproveStartedEvent = { type: "approve_started" };
export type PegApprovedEvent = { type: "approved" };
export type PegSentEvent = { type: "sent"; tx: TransactionStatus };
export type PegTxError = { type: "tx_error"; tx: TransactionStatus };
export type PegApproveError = { type: "approve_error" };
export type PegSigningEvent = { type: "signing" };
export type PegEvent =
  | PegApproveStartedEvent
  | PegApprovedEvent
  | PegSigningEvent
  | PegSentEvent
  | PegTxError
  | PegApproveError;

export function Peg(
  services: PegServices,
  store: PegStore,
  config: PegConfig,
  SubscribeToTx = SubscribeToTxDep,
) {
  return async function* peg(
    assetAmount: IAssetAmount,
    network: Network = Network.ETHEREUM,
  ): AsyncGenerator<PegEvent> {
    console.log("pegging", assetAmount.asset, network);

    if (network === Network.COSMOSHUB) {
      yield { type: "signing" };
      try {
        const txSequence = await services?.ibc.transferIBCTokens({
          sourceNetwork: assetAmount.asset.network,
          destinationNetwork: Network.SIFCHAIN,
          assetAmountToTransfer: assetAmount,
        });
        for (let tx of txSequence) {
          if (isBroadcastTxFailure(tx)) {
            services.bus.dispatch({
              type: "ErrorEvent",
              payload: {
                message: "IBC Transfer Failed",
              },
            });
            yield {
              type: "tx_error",
              tx: parseTxFailure({
                ...tx,
                rawLog: tx.rawLog || "",
              }),
            };
          } else {
            const logs = parseRawLog(tx.rawLog);
            /* 
              [
                  {
                      "msg_index": 0,
                      "log": "",
                      "events": [
                          {
                              "type": "ibc_transfer",
                              "attributes": [
                                  {
                                      "key": "sender",
                                      "value": "cosmos1dfr0fuqlx5uppvhx6fl20fd2d95am2ezpqf30c"
                                  },
                                  {
                                      "key": "receiver",
                                      "value": "sif1dfr0fuqlx5uppvhx6fl20fd2d95am2ezyax8qn"
                                  }
                              ]
                          },
                          {
                              "type": "message",
                              "attributes": [
                                  {
                                      "key": "action",
                                      "value": "transfer"
                                  },
                                  {
                                      "key": "sender",
                                      "value": "cosmos1dfr0fuqlx5uppvhx6fl20fd2d95am2ezpqf30c"
                                  },
                                  {
                                      "key": "module",
                                      "value": "ibc_channel"
                                  },
                                  {
                                      "key": "module",
                                      "value": "transfer"
                                  }
                              ]
                          },
                          {
                              "type": "send_packet",
                              "attributes": [
                                  {
                                      "key": "packet_data",
                                      "value": "{\"amount\":\"100000000\",\"denom\":\"uphoton\",\"receiver\":\"sif1dfr0fuqlx5uppvhx6fl20fd2d95am2ezyax8qn\",\"sender\":\"cosmos1dfr0fuqlx5uppvhx6fl20fd2d95am2ezpqf30c\"}"
                                  },
                                  {
                                      "key": "packet_timeout_height",
                                      "value": "0-0"
                                  },
                                  {
                                      "key": "packet_timeout_timestamp",
                                      "value": "1628395271000000000"
                                  },
                                  {
                                      "key": "packet_sequence",
                                      "value": "1512"
                                  },
                                  {
                                      "key": "packet_src_port",
                                      "value": "transfer"
                                  },
                                  {
                                      "key": "packet_src_channel",
                                      "value": "channel-86"
                                  },
                                  {
                                      "key": "packet_dst_port",
                                      "value": "transfer"
                                  },
                                  {
                                      "key": "packet_dst_channel",
                                      "value": "channel-0"
                                  },
                                  {
                                      "key": "packet_channel_ordering",
                                      "value": "ORDER_UNORDERED"
                                  },
                                  {
                                      "key": "packet_connection",
                                      "value": "connection-163"
                                  }
                              ]
                          },
                          {
                              "type": "transfer",
                              "attributes": [
                                  {
                                      "key": "recipient",
                                      "value": "cosmos16r7am2cje5xfwtkzdtd5249txuc50jkvhvqag0"
                                  },
                                  {
                                      "key": "sender",
                                      "value": "cosmos1dfr0fuqlx5uppvhx6fl20fd2d95am2ezpqf30c"
                                  },
                                  {
                                      "key": "amount",
                                      "value": "100000000uphoton"
                                  }
                              ]
                          }
                      ]
                  }
              ]
            */
            // debugger;
            services.bus.dispatch({
              type: "PegTransactionPendingEvent",
              payload: {
                hash: tx.transactionHash,
              },
            });
            yield {
              type: "sent",
              tx: {
                hash: tx.transactionHash,
                memo: "Transaction Completed",
                state: "completed",
              },
            };
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
                services.bus.dispatch({
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
                const received = await services.ibc.checkIfPacketReceived(
                  Network.SIFCHAIN,
                  dstChannel.value,
                  dstPort.value,
                  sequence.value,
                );
                if (received) {
                  services.bus.dispatch({
                    type: "PegTransactionCompletedEvent",
                    payload: {
                      hash: tx.transactionHash,
                    },
                  });
                  return;
                }
              } catch (e) {}
            }
          }
        }
      } catch (err) {
        // "signing_error"?
        yield { type: "approve_error" };
      }
      return;
    }
    if (
      assetAmount.asset.network === Network.ETHEREUM &&
      !isSupportedEVMChain(store.wallet.eth.chainId)
    ) {
      services.bus.dispatch({
        type: "ErrorEvent",
        payload: {
          message: "EVM Network not supported!",
        },
      });
      return {
        type: "tx_error",
        tx: {
          hash: "",
          state: "failed",
        },
      };
    }

    if (assetAmount.symbol !== "eth") {
      yield { type: "approve_started" };
      const address = store.wallet.eth.address;
      try {
        await services.ethbridge.approveBridgeBankSpend(address, assetAmount);
      } catch (err) {
        return yield {
          type: "approve_error",
        };
      }
      yield { type: "approved" };
    }

    yield { type: "signing" };

    const subscribeToTx = SubscribeToTx({ services, store });

    const lockOrBurnFn = isOriginallySifchainNativeToken(assetAmount.asset)
      ? services.ethbridge.burnToSifchain
      : services.ethbridge.lockToSifchain;

    const tx = await new Promise<TransactionStatus>((resolve) => {
      const pegTx = lockOrBurnFn(
        store.wallet.sif.address,
        assetAmount,
        config.ethConfirmations,
      );
      subscribeToTx(pegTx);

      pegTx.onTxHash((hash) => {
        resolve({
          hash: hash.txHash,
          memo: "Transaction Accepted",
          state: "accepted",
        });
      });
    });

    yield { type: "sent", tx };
  };
}
