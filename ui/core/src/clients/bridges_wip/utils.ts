import { IBCBridgeTx } from "./Bridge";
import { TransactionStatus, Network } from "../../entities";
import { findAttribute } from "@cosmjs/stargate/build/logs";

export function IBCTransferSubscriber() {
  return {
    subscribe,
  };
  async function* subscribe(
    tx: IBCBridgeTx,
  ): AsyncGenerator<TransactionStatus> {
    // Filter out non-ibc tx from logs like fee transfers
    const logs = tx.meta?.logs?.filter((item) =>
      item.events.some((ev) => ev.type === "ibc_transfer"),
    );
    if (!logs) return;

    yield {
      state: "accepted",
      hash: tx.hash,
    };

    const sequence = findAttribute(logs, "send_packet", "packet_sequence");
    const dstChannel = findAttribute(logs, "send_packet", "packet_dst_channel");
    const dstPort = findAttribute(logs, "send_packet", "packet_dst_port");
    const timeoutTimestampNanoseconds = findAttribute(
      logs,
      "send_packet",
      "packet_timeout_timestamp",
    );
    const timeoutTimestampMs =
      BigInt(timeoutTimestampNanoseconds.value as string) / BigInt(1000000);

    while (true) {
      await new Promise((r) => setTimeout(r, 1000));
      if (+timeoutTimestampMs.toString() < Date.now()) {
        yield {
          state: "failed",
          hash: tx.hash,
          memo: "Timed out waiting for packet receipt",
        };
        break;
      }
      try {
        const received = await context.services.ibc.checkIfPacketReceived(
          tx.toChain.network,
          dstChannel.value,
          dstPort.value,
          sequence.value,
        );
        if (received) {
          yield {
            state: "completed",
            hash: tx.hash,
          };
          return;
        }
      } catch (e) {}
    }
  }
}
