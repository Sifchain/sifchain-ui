import { BroadcastTxFailure, SigningStargateClient } from "@cosmjs/stargate";
import { IBCChainConfig } from "./IBCChainConfig";
import {
  Amount,
  Asset,
  AssetAmount,
  IAssetAmount,
  Network,
} from "../../entities";
import { loadConnectionByChainIds } from "./loadConnectionByChainIds";
import getKeplrProvider from "../SifService/getKeplrProvider";
import { IWalletService } from "../IWalletService";
import { parseRawLog } from "@cosmjs/stargate/build/logs";
import {
  QueryClient,
  setupBankExtension,
  setupIbcExtension,
  setupAuthExtension,
} from "@cosmjs/stargate/build/queries";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { QueryClientImpl } from "@cosmjs/stargate/build/codec/cosmos/distribution/v1beta1/query";
import { ValueOp } from "@cosmjs/stargate/build/codec/tendermint/crypto/proof";
import { setupMintExtension } from "@cosmjs/launchpad";
import { QueryDenomTraceResponse } from "@cosmjs/stargate/build/codec/ibc/applications/transfer/v1/query";
import { getNetworkEnv, NetworkEnv } from "../../config/getEnv";
import { chainConfigByNetworkEnv } from "./ibc-chains";
import { fetch } from "cross-fetch";
// const GAIA_ENDPOINT = `http://a941f6afd0d994a57979ffbaf284d2c0-95f50faefa055d52.elb.us-west-2.amazonaws.com:26657`;
// const SIFCHAIN_ENDPOINT = `https://rpc-devnet-042-ibc.sifchain.finance/`;

export interface IBCServiceContext {
  // applicationNetworkEnvironment: NetworkEnv;
  assets: Asset[];
}

export class IBCService {
  denomLookup: Record<Network, Record<string, string>> = {
    ethereum: {},
    cosmoshub: {},
    sifchain: {},
  };
  constructor(private context: IBCServiceContext) {}
  static create(context: IBCServiceContext) {
    return new this(context);
  }

  private loadChainConfigByNetwork(network: Network): IBCChainConfig {
    this.context;

    // @ts-ignore
    const env = NetworkEnv.TESTNET_042_IBC;
    const chainConfig = chainConfigByNetworkEnv[env][network];
    if (!chainConfig) {
      throw new Error(`No chain config for network ${network}`);
    }
    return chainConfig;
  }

  async loadQueryClientByNetwork(network: Network) {
    const destChainConfig = await this.loadChainConfigByNetwork(network);
    const tendermintClient = await Tendermint34Client.connect(
      destChainConfig.rpcUrl,
    );

    const queryClient = QueryClient.withExtensions(
      tendermintClient,
      setupIbcExtension,
      setupBankExtension,
      setupAuthExtension,
    );
    return queryClient;
  }
  async loadDestinationChainTxBySourceChainTxHash(
    sourceChainTxHash: string,
    sourceNetwork: Network,
    destinationNetwork: Network,
  ) {
    // const wallet = await this.createWalletByNetwork(sourceNetwork);
    const queryClient = await this.loadQueryClientByNetwork(destinationNetwork);
    queryClient;
    const allChannels = await queryClient.ibc.channel.allChannels();
    const clients = await Promise.all(
      allChannels.channels.map(async (channel) => {
        const parsedClientState = await fetch(
          `${
            this.loadChainConfigByNetwork(destinationNetwork).restUrl
          }/ibc/core/connection/v1beta1/connections/${
            channel.connectionHops[0]
          }/client_state`,
        ).then((r) => r.json());

        // const allAcks = await queryClient.ibc.channel.allPacketAcknowledgements(
        //   channel.portId,
        //   channel.channelId,
        // );

        return {
          chainId:
            parsedClientState.identified_client_state.client_state.chain_id,
          // ackCount: allAcks.acknowledgements.length,
          connection: channel.connectionHops[0],
          channelId: channel.channelId,
          counterpartyChannelId: channel.counterparty?.channelId,
        };
      }),
    );
    console.table(
      clients.filter((c) => {
        if (destinationNetwork === Network.COSMOSHUB) {
          return c.chainId.includes("sifchain");
        }
        return true;
      }),
    );
    const allCxns = await Promise.all(
      (await queryClient.ibc.connection.allConnections()).connections.map(
        async (cxn) => {
          return {
            cxn,
          };
        },
      ),
    );
    console.log({ sourceNetwork, allChannels, allCxns, clients });

    // const tx = await wallet.client.getTx(sourceChainTxHash);
    // parseRawLog(tx?.rawLog);
  }

  async createWalletByNetwork(network: Network) {
    const keplr = await getKeplrProvider();
    const sourceChain = this.loadChainConfigByNetwork(network);
    await keplr?.experimentalSuggestChain(sourceChain.keplrChainInfo);
    await keplr?.enable(sourceChain.chainId);
    const sendingSigner = await keplr?.getOfflineSigner(sourceChain.chainId);
    if (!sendingSigner)
      throw new Error("No sending signer for " + sourceChain.chainId);
    const stargate = await SigningStargateClient?.connectWithSigner(
      sourceChain.rpcUrl,
      sendingSigner,
    );

    const addresses = (await sendingSigner.getAccounts()).map(
      (acc) => acc.address,
    );
    const queryClient = await this.loadQueryClientByNetwork(network);
    const balances = await stargate.getAllBalances(addresses[0]);
    const assetAmounts: IAssetAmount[] = [];

    for (let balance of balances) {
      try {
        let symbol = balance.denom;
        let denomTrace: QueryDenomTraceResponse | null = null;
        if (balance.denom.startsWith("ibc/")) {
          denomTrace = await queryClient.ibc.transfer.denomTrace(
            balance.denom.split("/")[1],
          );
          symbol = denomTrace.denomTrace?.baseDenom ?? symbol;
          this.denomLookup[sourceChain.network as Network][symbol] =
            balance.denom;
        }

        let asset =
          this.context.assets.find(
            (a) => a.symbol === symbol && a.network == network,
          ) || symbol;

        if (typeof asset === "object" && balance.denom.startsWith("ibc/")) {
          asset = {
            ...asset,
            ibcDenom: balance.denom,
          };
        }
        const assetAmount = AssetAmount(asset, balance?.amount);
        assetAmounts.push(assetAmount);
        if (network === Network.COSMOSHUB) {
          console.table([
            {
              denom: balance.denom,
              amount: balance.amount,
              symbol,
              trace: denomTrace,
            },
          ]);
        }
      } catch (e) {
        console.error(e);
      }
    }
    return {
      client: stargate,
      addresses,
      balances: assetAmounts,
    };
  }
  async transferIBCTokens(params: {
    sourceNetwork: Network;
    destinationNetwork: Network;
    assetAmountToTransfer: IAssetAmount;
  }) {
    const sourceChain = this.loadChainConfigByNetwork(params.sourceNetwork);
    const destinationChain = this.loadChainConfigByNetwork(
      params.destinationNetwork,
    );
    const keplr = await getKeplrProvider();
    await keplr?.experimentalSuggestChain(sourceChain.keplrChainInfo);
    await keplr?.experimentalSuggestChain(destinationChain.keplrChainInfo);
    await keplr?.enable(destinationChain.chainId);
    const recievingSigner = await keplr?.getOfflineSigner(
      destinationChain.chainId,
    );
    if (!recievingSigner) throw new Error("No recieving signer");
    const [toAccount] = (await recievingSigner?.getAccounts()) || [];
    if (!toAccount) throw new Error("No account found for recieving signer");

    await keplr?.enable(sourceChain.chainId);
    const sendingSigner = await keplr?.getOfflineSigner(sourceChain.chainId);
    if (!sendingSigner) throw new Error("No sending signer");
    console.log(
      `${params.sourceNetwork}/${await sendingSigner
        .getAccounts()
        .then(([a]) => a.address)} -> ${
        params.destinationNetwork
      }/${await recievingSigner.getAccounts().then(([a]) => a.address)}`,
    );
    const [fromAccount] = (await sendingSigner?.getAccounts()) || [];
    if (!fromAccount) {
      throw new Error("No account found for sending signer");
    }

    const sendingStargateClient = await SigningStargateClient?.connectWithSigner(
      sourceChain.rpcUrl,
      sendingSigner,
    );

    const { channelId } = await loadConnectionByChainIds({
      sourceChainId: sourceChain.chainId,
      counterpartyChainId: destinationChain.chainId,
    });

    const symbol = params.assetAmountToTransfer.asset.symbol;
    debugger;
    const brdcstTxRes = await sendingStargateClient?.sendIbcTokens(
      fromAccount.address,
      toAccount.address,
      {
        denom:
          this.denomLookup[sourceChain.network as Network][symbol] || symbol,
        // denom: symbol,
        amount: params.assetAmountToTransfer.toBigInt().toString(),
      },
      "transfer",
      channelId,
      undefined,
      Math.floor(Date.now() / 1000 + 60 * 60),
    );
    console.log({ brdcstTxRes });
    return brdcstTxRes;
  }
}

export default function createIBCService(context: IBCServiceContext) {
  return IBCService.create(context);
}
