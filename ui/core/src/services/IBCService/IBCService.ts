import { SigningStargateClient } from "@cosmjs/stargate";
import getKeplrProvider from "../SifService/getKeplrProvider";

import { IBCChainConfig } from "ibc-chains/IBCChainConfig";
import { IAssetAmount } from "entities";
import { loadConnectionByChainIds } from "./loadConnectionByChainIds";

// const GAIA_ENDPOINT = `http://a941f6afd0d994a57979ffbaf284d2c0-95f50faefa055d52.elb.us-west-2.amazonaws.com:26657`;
// const SIFCHAIN_ENDPOINT = `https://rpc-devnet-042.sifchain.finance/`;

export class IBCService {
  static async transferIBCTokens(params: {
    sourceChain: IBCChainConfig;
    destinationChain: IBCChainConfig;
    assetAmountToTransfer: IAssetAmount;
  }) {
    const keplr = await getKeplrProvider();

    await keplr?.experimentalSuggestChain(params.sourceChain.keplrChainInfo);
    await keplr?.experimentalSuggestChain(
      params.destinationChain.keplrChainInfo,
    );
    await keplr?.enable(params.sourceChain.chainId);
    const sendingSigner = await keplr?.getOfflineSigner(
      params.sourceChain.chainId,
    );
    if (!sendingSigner) throw new Error("No sending signer");
    const [fromAccount] = (await sendingSigner?.getAccounts()) || [];
    if (!fromAccount) {
      throw new Error("No account found for sending signer");
    }
    const recievingSigner = await keplr?.getOfflineSigner(
      params.destinationChain.chainId,
    );
    if (!recievingSigner) throw new Error("No recieving signer");
    const [toAccount] = (await recievingSigner?.getAccounts()) || [];
    if (!toAccount) throw new Error("No account found for recieving signer");

    const sendingStargateClient = await SigningStargateClient?.connectWithSigner(
      params.sourceChain.rpcUrl,
      sendingSigner,
    );

    const { channelId } = await loadConnectionByChainIds({
      sourceChainId: params.sourceChain.chainId,
      counterpartyChainId: params.destinationChain.chainId,
    });

    await keplr?.enable(params.destinationChain.chainId);

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
    brdcstTxRes.transactionHash;
  }
}
