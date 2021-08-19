// import { CosmosWalletProvider, WalletConnectionState } from "./types";
// import { Chain, Network, Wallet } from "../../entities";
// import { OfflineSigner } from "@cosmjs/proto-signing";
// import getKeplrProvider from "services/SifService/getKeplrProvider";

// export class KeplrWalletProvider extends CosmosWalletProvider {
//   supportedProtocols = [
//     Network.AKASH,
//     Network.COSMOSHUB,
//     Network.IRIS,
//     Network.SENTINEL,
//     Network.SIFCHAIN,
//   ];

//   getSendingSigner(chain: Chain): Promise<OfflineSigner> {
//     throw new Error("Method not implemented.");
//   }
//   isLoaded(chain: Chain): Promise<boolean> {
//     throw new Error("Method not implemented.");
//   }
//   async load(chain: Chain) {
//     const keplr = await getKeplrProvider();
//     const sourceChain = this.loadChainConfigByNetwork(network);
//     await keplr?.experimentalSuggestChain(sourceChain.keplrChainInfo);
//     await keplr?.enable(sourceChain.chainId);
//     const sendingSigner = await keplr?.getOfflineSigner(sourceChain.chainId);
//     if (!sendingSigner)
//       throw new Error("No sending signer for " + sourceChain.chainId);
//     const stargate = await SigningStargateClient?.connectWithSigner(
//       sourceChain.rpcUrl,
//       sendingSigner,
//       {
//         gasLimits: {
//           send: 80000,
//           ibcTransfer: 120000,
//           delegate: 250000,
//           undelegate: 250000,
//           redelegate: 250000,
//           // The gas multiplication per rewards.
//           withdrawRewards: 140000,
//           govVote: 250000,
//         },
//       },
//     );
//   }
//   unload(chain: Chain): Promise<void> {
//     throw new Error("Method not implemented.");
//   }
//   fetchBalances(state: {
//     chain: import("../..").Chain;
//     provider: import("./types").WalletProvider;
//     balances: import("../..").IAssetAmount[];
//     address: string;
//   }): Promise<import("../..").IAssetAmount[]> {
//     throw new Error("Method not implemented.");
//   }
//   fetchAndEmitChangedBalances(state: {
//     chain: import("../..").Chain;
//     provider: import("./types").WalletProvider;
//     balances: import("../..").IAssetAmount[];
//     address: string;
//   }): Promise<import("../..").IAssetAmount[] | undefined> {
//     throw new Error("Method not implemented.");
//   }
// }
