import { stringToPath } from "@cosmjs/crypto";
// import { IbcClient, Link } from "@confio/relayer/build";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import {
  GasPrice,
  parseCoins,
  SigningCosmosClient,
  StdSignDoc,
} from "@cosmjs/launchpad";
// @ts-ignore
import Keystation from "@cosmostation/keystation-es6";
import {
  MsgSendEncodeObject,
  SigningStargateClient,
  StargateClient,
} from "@cosmjs/stargate";
import Long from "long";
import getKeplrProvider from "../SifService/getKeplrProvider";
import { AccountStore, ChainInfoInner } from "@keplr-wallet/stores";
import { SifUnSignedClient } from "../utils/SifClient";
import { TxMsgData } from "@cosmjs/stargate/build/codec/cosmos/base/abci/v1beta1/abci";
import {
  SignDoc,
  TxRaw,
} from "@cosmjs/stargate/build/codec/cosmos/tx/v1beta1/tx";

const GAIA_ENDPOINT = `http://a941f6afd0d994a57979ffbaf284d2c0-95f50faefa055d52.elb.us-west-2.amazonaws.com:26657`;
const SIFCHAIN_ENDPOINT = `https://rpc-devnet-042.sifchain.finance/`;

export class IBCService {
  static async sendIBCtransaction({
    sendingChainId,
    receivingChainId,
  }: {
    sendingChainId: string;
    receivingChainId: string;
  }) {
    const keplr = await getKeplrProvider();
    await keplr?.experimentalSuggestChain(
      require("../../config.atom.testnet.json").keplrChainConfig,
    );
    await keplr?.experimentalSuggestChain(
      require("../../config.devnet.json").keplrChainConfig,
    );
    await keplr?.enable(sendingChainId);
    const sendingSigner = await keplr?.getOfflineSigner(sendingChainId);
    if (!sendingSigner) throw new Error("No sending signer");
    const [fromAccount] = (await sendingSigner?.getAccounts()) || [];
    if (!fromAccount) {
      throw new Error("No account found for sending signer");
    }
    const recievingSigner = await keplr?.getOfflineSigner(receivingChainId);
    if (!recievingSigner) throw new Error("No recieving signer");
    const [toAccount] = (await recievingSigner?.getAccounts()) || [];
    if (!toAccount) throw new Error("No account found for recieving signer");
    // const msg39 = {
    //   type: "/ibc.applications.transfer.v1.MsgTransfer",
    //   value: {
    //     sourcePort: "transfer",
    //     sourceChannel: "channel-0",
    //     sender: fromAccount.address,
    //     receiver: toAccount.address,
    //     timeoutTimestamp: Long.fromString(
    //       new Date().getTime() + 60000 + "000000",
    //     ),
    //     token: {
    //       denom: "cosmos",
    //       amount: "1",
    //     },
    //   },
    // };
    const fee = {
      amount: [],
      gas: "200000",
    };
    // const cosmJS39 = new SigningCosmosClient(
    //   "https://lcd-cosmoshub.keplr.app/rest",
    //   fromAccount.address,
    //   {
    //     ...sendingSigner,
    //     sign(signerAddress: string, signDoc: StdSignDoc) {
    //       return sendingSigner?.signAmino?.(signerAddress, signDoc);
    //     },
    //   },
    // );
    // cosmJS39.signAndBroadcast([msg42], fee);
    // const cosmJS = new StargateClient(
    //       undefined,
    //         "https://lcd-cosmoshub.keplr.app/rest",
    //         fromAccount.address,
    //         sendingSigner
    //     );
    const sendingStargateClient = await SigningStargateClient?.connectWithSigner(
      GAIA_ENDPOINT,
      sendingSigner,
    );
    const receivingStargateClient = await SigningStargateClient?.connectWithSigner(
      SIFCHAIN_ENDPOINT,
      recievingSigner,
    );
    await keplr?.enable(receivingChainId);
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
