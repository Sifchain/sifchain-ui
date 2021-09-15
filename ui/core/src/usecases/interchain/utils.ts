import { IBCInterchainTx } from "./_InterchainApi";
import { TransactionStatus, Network, IBCChainConfig } from "../../entities";
import { findAttribute } from "@cosmjs/stargate/build/logs";
import { UsecaseContext } from "../";
import { SigningStargateClient } from "@cosmjs/stargate";
import Long from "long";

export function IBCTransferSubscriber(context: UsecaseContext) {
  return {
    subscribe,
  };
  async function* subscribe(
    tx: IBCInterchainTx,
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
    const timeoutHeight = findAttribute(
      logs,
      "send_packet",
      "packet_timeout_height",
    );

    // timeoutHeight comes back from logs in format with `1-` in front sometimes.
    // i.e.: {value: '1-2048035'}
    let timeoutHeightValue = parseInt(
      timeoutHeight.value.split("-")[1] || timeoutHeight.value,
    );

    const receivingSigner = await context.services.wallet.keplrProvider.getSendingSigner(
      tx.toChain,
    );

    const config = tx.toChain.chainConfig as IBCChainConfig;
    const receivingStargateClient = await SigningStargateClient?.connectWithSigner(
      config.rpcUrl,
      receivingSigner,
    );

    while (true) {
      await new Promise((r) => setTimeout(r, 5000));

      const blockHeight = await receivingStargateClient.getHeight();
      if (blockHeight >= timeoutHeightValue) {
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
