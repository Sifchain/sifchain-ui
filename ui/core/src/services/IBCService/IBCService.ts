import { BroadcastTxFailure, SigningStargateClient } from "@cosmjs/stargate";
import { IBCChainConfig } from "./IBCChainConfig";
import {
  Amount,
  Asset,
  AssetAmount,
  IAssetAmount,
  Network,
} from "../../entities";
import * as chainConfigs from "./ibc-chains";
import { loadConnectionByChainIds } from "./loadConnectionByChainIds";
import getKeplrProvider from "../SifService/getKeplrProvider";
import { IWalletService } from "../IWalletService";

// const GAIA_ENDPOINT = `http://a941f6afd0d994a57979ffbaf284d2c0-95f50faefa055d52.elb.us-west-2.amazonaws.com:26657`;
// const SIFCHAIN_ENDPOINT = `https://rpc-devnet-042-ibc.sifchain.finance/`;

function hello<T>() {}

export interface IBCServiceContext {
  // applicationNetworkEnvironment: NetworkEnv;
  assets: Asset[];
}

export class IBCService {
  constructor(private context: IBCServiceContext) {}
  static create(context: IBCServiceContext) {
    return new this(context);
  }

  private loadChainConfigByNetwork(network: Network): IBCChainConfig {
    console.warn(`
      ONLY COMPATIBLE W/ DEVNET CURRENTLY. NEED TO FILTER BY 'NetworkEnv'
    `);
    const chainConfig = Object.values(chainConfigs).find(
      (c) => c.network === network,
    );
    if (!chainConfig) {
      throw new Error(`No chain config for network ${network}`);
    }
    return chainConfig;
  }

  async createWalletByNetwork(network: Network) {
    const keplr = await getKeplrProvider();
    const sourceChain = this.loadChainConfigByNetwork(network);
    await keplr?.experimentalSuggestChain(sourceChain.keplrChainInfo);
    await keplr?.enable(sourceChain.chainId);
    const sendingSigner = await keplr?.getOfflineSigner(sourceChain.chainId);
    if (!sendingSigner)
      throw new Error("No sending signer for " + sourceChain.chainId);
    const sendingStargateClient = await SigningStargateClient?.connectWithSigner(
      sourceChain.rpcUrl,
      sendingSigner,
    );
    const addresses = (await sendingSigner.getAccounts()).map(
      (acc) => acc.address,
    );
    const balances = await sendingStargateClient.getAllBalances(addresses[0]);
    const assetAmounts: IAssetAmount[] = [];
    for (let asset of this.context.assets) {
      const balance = balances.find((bal) => bal.denom === asset.ibcDenom);
      if (balance) {
        assetAmounts.push(AssetAmount(asset, Amount(balance.amount)));
      }
    }
    console.log(balances);
    return {
      client: sendingStargateClient,
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
    await keplr?.enable(sourceChain.chainId);
    const sendingSigner = await keplr?.getOfflineSigner(sourceChain.chainId);
    if (!sendingSigner) throw new Error("No sending signer");
    const [fromAccount] = (await sendingSigner?.getAccounts()) || [];
    if (!fromAccount) {
      throw new Error("No account found for sending signer");
    }
    const recievingSigner = await keplr?.getOfflineSigner(
      destinationChain.chainId,
    );
    if (!recievingSigner) throw new Error("No recieving signer");
    const [toAccount] = (await recievingSigner?.getAccounts()) || [];
    if (!toAccount) throw new Error("No account found for recieving signer");

    const sendingStargateClient = await SigningStargateClient?.connectWithSigner(
      sourceChain.rpcUrl,
      sendingSigner,
    );

    const { channelId } = await loadConnectionByChainIds({
      sourceChainId: sourceChain.chainId,
      counterpartyChainId: destinationChain.chainId,
    });

    await keplr?.enable(destinationChain.chainId);

    const brdcstTxRes = await sendingStargateClient?.sendIbcTokens(
      fromAccount.address,
      toAccount.address,
      {
        denom: params.assetAmountToTransfer.asset.symbol,
        amount: params.assetAmountToTransfer.toBigInt().toString(),
      },
      "transfer",
      channelId,
      undefined,
      Math.floor(Date.now() / 1000 + 1000),
    );
    console.log({ brdcstTxRes });
    return brdcstTxRes;
  }
}

export default function createIBCService(context: IBCServiceContext) {
  return IBCService.create(context);
}
