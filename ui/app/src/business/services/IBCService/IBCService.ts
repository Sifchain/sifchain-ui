import { IBCBridge } from "@sifchain/sdk/src/clients/bridges/IBCBridge/IBCBridge";
import type { IBCBridgeContext as _IBCServiceContext } from "@sifchain/sdk/src/clients/bridges/IBCBridge/IBCBridge";
import { Network, IBCChainConfig } from "@sifchain/sdk";
import { useChains } from "@/hooks/useChains";
import { KeplrWalletProvider } from "@sifchain/wallet-keplr";

export type IBCServiceContext = _IBCServiceContext;

// NOTE(ajoslin): this is deprecated, most functionality is moved to IBCBridge
// debug functions only left here or functions with old signatures
export class IBCService extends IBCBridge {
  static create(context: IBCServiceContext) {
    return new IBCService(context);
  }

  keplrProvider?: KeplrWalletProvider;
  setKeplrProvider(keplrProvider: KeplrWalletProvider) {
    this.keplrProvider = keplrProvider;
  }

  async logIBCNetworkMetadata() {
    const allClients = [];
    const destinationNetwork = Network.SIFCHAIN;
    let chainConfig: IBCChainConfig;

    try {
      // if (destinationNetwork === Network.REGEN) throw "";
      chainConfig = this.loadChainConfigByNetwork(destinationNetwork);
    } catch (e) {
      // continue;
    }
    await this.keplrProvider!.connect(useChains().get(destinationNetwork));
    const queryClient = await this.loadQueryClientByNetwork(destinationNetwork);
    const allChannels = await queryClient.ibc.channel.allChannels();
    let clients = await Promise.all(
      allChannels.channels.map(async (channel) => {
        try {
          const parsedClientState = await fetch(
            `${chainConfig.restUrl}/ibc/core/connection/v1beta1/connections/${channel.connectionHops[0]}/client_state`,
          ).then((r) => r.json());

          // console.log(parsedClientState);
          // const allAcks = await queryClient.ibc.channel.allPacketAcknowledgements(
          //   channel.portId,
          //   channel.channelId,
          // );
          const channelId = channel.channelId;
          const counterpartyChannelId = channel.counterparty!.channelId;
          const counterPartyChainId =
            parsedClientState.identified_client_state.client_state.chain_id;

          const counterpartyConfig =
            this.loadChainConfigByChainId(counterPartyChainId);
          const counterpartyQueryClient = await this.loadQueryClientByNetwork(
            counterpartyConfig.network,
          );
          const counterpartyConnection =
            await counterpartyQueryClient.ibc.channel.channel(
              "transfer",
              counterpartyChannelId,
            );

          return {
            srcChainId: chainConfig.chainId,
            destChainId: counterPartyChainId,
            // ackCount: allAcks.acknowledgements.length,
            srcCxn: channel.connectionHops[0],
            destCxn: counterpartyConnection.channel?.connectionHops[0],
            srcChannel: channelId,
            destChannel: counterpartyChannelId,
          };
        } catch (e) {
          console.error(e);
          return;
        }
      }),
    );
    allClients.push(...clients.filter((c) => c));
    console.log(destinationNetwork.toUpperCase());
    console.table(
      clients.filter((c) => {
        return true;
      }),
    );

    const tokenRegistryEntries = await this.tokenRegistry.load();
    console.log("Sifchain Connections: ");
    console.log(
      JSON.stringify(
        allClients.filter((clientA) => {
          return tokenRegistryEntries.some(
            (e) =>
              e.ibcChannelId === clientA!.srcChannel &&
              e.ibcCounterpartyChannelId === clientA!.destChannel,
          );
        }),
        null,
        2,
      ),
    );
    // for (let clientA of allClients.filter((c) =>
    //   c.chainId.includes("sifchain"),
    // )) {
    //   for (let clientB of allClients) {
    //     if (
    //       clientA.counterPartyChainId === clientB.chainId &&
    //       clientA?.channelId === clientB.counterpartyChannelId &&
    // tokenRegistryEntries.some(
    //   (e) =>
    //     e.ibcChannelId === clientA.channelId &&
    //     e.ibcCounterpartyChannelId === clientA.counterpartyChannelId,
    // )
    //     ) {
    //       connections.push({
    //         srcChainId: clientA.chainId,
    //         destChainId: clientB.chainId,
    //         srcCxn: clientA.connection,
    //         dstCxn: clientB.connection,
    //         srcChannel: clientA.channelId,
    //         destChannel: clientB.channelId,
    //       });
    //     }
    //   }
    // }
  }
}

export default function createIBCService(context: IBCServiceContext) {
  return IBCService.create(context);
}
