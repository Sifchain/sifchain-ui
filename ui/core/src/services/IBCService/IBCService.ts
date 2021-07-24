import { SigningStargateClient } from "@cosmjs/stargate";
import getKeplrProvider from "../SifService/getKeplrProvider";

import { IBCChainConfig } from "ibc-chains/IBCChainConfig";
import { IAssetAmount } from "entities";

// const GAIA_ENDPOINT = `http://a941f6afd0d994a57979ffbaf284d2c0-95f50faefa055d52.elb.us-west-2.amazonaws.com:26657`;
// const SIFCHAIN_ENDPOINT = `https://rpc-devnet-042.sifchain.finance/`;

export class IBCService {
  static async sendIBCtransaction(params: {
    sendingChain: IBCChainConfig;
    receivingChain: IBCChainConfig;
    assetAmountToTransfer: IAssetAmount;
  }) {
    const keplr = await getKeplrProvider();
    await keplr?.experimentalSuggestChain(params.sendingChain.keplrChainInfo);
    await keplr?.experimentalSuggestChain(params.receivingChain.keplrChainInfo);
    await keplr?.enable(params.sendingChain.chainId);
    const sendingSigner = await keplr?.getOfflineSigner(
      params.sendingChain.chainId,
    );
    if (!sendingSigner) throw new Error("No sending signer");
    const [fromAccount] = (await sendingSigner?.getAccounts()) || [];
    if (!fromAccount) {
      throw new Error("No account found for sending signer");
    }
    const recievingSigner = await keplr?.getOfflineSigner(
      params.receivingChain.chainId,
    );
    if (!recievingSigner) throw new Error("No recieving signer");
    const [toAccount] = (await recievingSigner?.getAccounts()) || [];
    if (!toAccount) throw new Error("No account found for recieving signer");

    const sendingStargateClient = await SigningStargateClient?.connectWithSigner(
      params.sendingChain.rpcUrl,
      sendingSigner,
    );

    const receivingStargateClient = await SigningStargateClient?.connectWithSigner(
      params.receivingChain.rpcUrl,
      recievingSigner,
    );
    await keplr?.enable(params.receivingChain.chainId);
    const brdcstTxRes__fromSifchain = await receivingStargateClient
      ?.sendIbcTokens(
        toAccount.address,
        fromAccount.address,
        {
          denom: "rowan",
          amount: "1040000000000000000",
        },
        "transfer",
        "channel-0",
        undefined,
        Math.floor(Date.now() / 1000 + 1000),
      )
      .catch((e) => e);

    const brdcstTxRes__fromCosmos = await sendingStargateClient
      ?.sendIbcTokens(
        fromAccount.address,
        toAccount.address,
        {
          denom: "uphoton",
          amount: "1",
        },
        "transfer",
        "channel-53",
        undefined,
        Math.floor(Date.now() / 1000 + 1000),
      )
      .catch((e) => e);
    console.log({ brdcstTxRes__fromSifchain, brdcstTxRes__fromCosmos });
  }
}
