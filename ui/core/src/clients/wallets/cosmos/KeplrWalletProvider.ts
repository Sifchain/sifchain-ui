import {
  Coin,
  QueryClient,
  setupAuthExtension,
  setupBankExtension,
  setupIbcExtension,
  SigningStargateClient,
  StargateClient,
} from "@cosmjs/stargate";
import { cosmos, ibc } from "@keplr-wallet/cosmos";
import fetch from "cross-fetch";
import { Uint53 } from "@cosmjs/math";
import pLimit from "p-limit";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { Chain } from "../../../entities";
import { WalletProviderContext } from "../WalletProvider";
import { toHex } from "@cosmjs/encoding";
import {
  OfflineSigner,
  OfflineDirectSigner,
  EncodeObject,
} from "@cosmjs/proto-signing";
import { CosmosWalletProvider } from "./CosmosWalletProvider";
import {
  makeSignDoc,
  makeStdTx,
  BroadcastMode,
  isBroadcastTxSuccess,
  isBroadcastTxFailure,
  StdTx,
} from "@cosmjs/launchpad";
import {
  NativeDexTransaction,
  NativeDexSignedTransaction,
} from "../../../services/utils/SifClient/NativeDexTransaction";
import { NativeAminoTypes } from "../../../services/utils/SifClient/NativeAminoTypes";
import { BroadcastTxResult } from "@cosmjs/launchpad";
import { parseLogs } from "@cosmjs/stargate/build/logs";
import { TxRaw } from "@cosmjs/stargate/build/codec/cosmos/tx/v1beta1/tx";
import getKeplrProvider from "../../../services/SifService/getKeplrProvider";
import DemerisSigningClient from "./EmerisSigningClient";
import Long from "long";
import { MsgTransfer } from "@terra-money/terra.proto/ibc/applications/transfer/v1/tx";

export class KeplrWalletProvider extends CosmosWalletProvider {
  static create(context: WalletProviderContext) {
    return new KeplrWalletProvider(context);
  }
  constructor(public context: WalletProviderContext) {
    super(context);
  }

  onAccountChanged(callback: () => void) {
    try {
      window.addEventListener("keplr_keystorechange", callback);
      return () => window.removeEventListener("keplr_keystorechange", callback);
    } catch (e) {}
  }

  async isInstalled(chain: Chain) {
    return (window as any).keplr != null;
  }

  async hasConnected(chain: Chain) {
    const chainConfig = this.getIBCChainConfig(chain);
    const keplr = await getKeplrProvider();
    try {
      await keplr?.getKey(chainConfig.keplrChainInfo.chainId);
      return true;
    } catch (error) {
      return false;
    }
  }

  isChainSupported(chain: Chain) {
    return chain.chainConfig.chainType === "ibc";
  }

  canDisconnect(chain: Chain) {
    return false;
  }
  async disconnect(chain: Chain) {
    throw new Error("Keplr wallets cannot disconnect");
  }

  async getSendingSigner(
    chain: Chain,
  ): Promise<OfflineSigner & OfflineDirectSigner> {
    const chainConfig = this.getIBCChainConfig(chain);
    const keplr = await getKeplrProvider();
    await keplr?.experimentalSuggestChain(chainConfig.keplrChainInfo);
    await keplr?.enable(chainConfig.chainId);
    const sendingSigner = keplr?.getOfflineSigner(chainConfig.chainId);

    if (!sendingSigner)
      throw new Error(`Failed to get sendingSigner for ${chainConfig.chainId}`);

    return sendingSigner;
  }

  async tryConnectAll(...chains: Chain[]) {
    const keplr = await getKeplrProvider();
    const chainIds = chains
      .filter((c) => c.chainConfig.chainType === "ibc")
      .map((c) => c.chainConfig.chainId);

    // @ts-ignore
    return keplr?.enable(chainIds);
  }
  async connect(chain: Chain) {
    // try to get the address quietly
    const keplr = await getKeplrProvider();
    const chainConfig = this.getIBCChainConfig(chain);
    await keplr?.experimentalSuggestChain(chainConfig.keplrChainInfo);
    const key = await keplr?.getKey(chain.chainConfig.chainId);
    let address = key?.bech32Address;
    // if quiet get fails, try to enable the wallet
    if (!address) {
      const sendingSigner = await this.getSendingSigner(chain);
      address = (await sendingSigner.getAccounts())[0]?.address;
    }
    // if enabling & quiet get fails, throw.
    // if quiet get fails, try to enable the wallet
    if (!address) {
      const sendingSigner = await this.getSendingSigner(chain);
      address = (await sendingSigner.getAccounts())[0]?.address;
    }

    if (!address) {
      throw new Error(
        `No address to connect to for chain ${chain.displayName}`,
      );
    }

    return address;
    // console.log("txhash!", txhash);
    // f
  }

  async sign(chain: Chain, tx: NativeDexTransaction<EncodeObject>) {
    const chainConfig = this.getIBCChainConfig(chain);
    const stargate = await StargateClient.connect(chainConfig.rpcUrl);

    const signingStargate = await SigningStargateClient.connectWithSigner(
      chainConfig.rpcUrl,
      await this.getSendingSigner(chain),
      {},
    );

    const demerisClient = new DemerisSigningClient(
      await Tendermint34Client.connect(chainConfig.rpcUrl),
      // @ts-ignore
      await this.getSendingSigner(chain),
      {},
    );

    const account = await stargate.getAccount(tx.fromAddress || "");
    const fee = {
      amount: [tx.fee.price],
      gas: tx.fee.gas,
    };

    const converter = new NativeAminoTypes();

    const protoMsgs = tx.msgs.map((message) => {
      if (message.typeUrl === "/ibc.applications.transfer.v1.MsgTransfer") {
        return {
          type_url: message.typeUrl,
          value: ibc.applications.transfer.v1.MsgTransfer.encode(
            // @ts-ignore
            message,
          ).finish(),
        };
      } else {
        return message;
      }
    });
    console.log(
      "decoded",
      ibc.applications.transfer.v1.MsgTransfer.decode(protoMsgs[0].value),
    );
    const aminoMsgs = tx.msgs.map(converter.toAmino.bind(converter));

    console.log(tx.msgs);
    if (
      !account ||
      (typeof account?.accountNumber !== "number" &&
        typeof account?.sequence === "number")
    ) {
      throw new Error(
        `This account (${tx.fromAddress}) does not yet exist on-chain. Please send some funds to it before proceeding.`,
      );
    }

    // const signedTx = await demerisClient.signWMeta(
    //   account.address,
    //   tx.msgs,
    //   fee,
    //   tx.memo,
    //   {
    //     accountNumber: account.accountNumber,
    //     sequence: account.sequence,
    //     chainId: chainConfig.chainId,
    //   },
    // );

    const keplr = (await getKeplrProvider())!;
    const signDoc = makeSignDoc(
      aminoMsgs,
      fee,
      chainConfig.chainId,
      tx.memo || "",
      account!.accountNumber.toString(),
      account!.sequence.toString(),
    );
    keplr.defaultOptions = {
      sign: {
        preferNoSetFee: false,
        preferNoSetMemo: true,
      },
    };
    const signResponse = await keplr.signAmino(
      chainConfig.chainId,
      account.address,
      signDoc,
    );

    const signedTx = cosmos.tx.v1beta1.TxRaw.encode({
      bodyBytes: cosmos.tx.v1beta1.TxBody.encode({
        messages: protoMsgs,
        memo: signResponse.signed.memo,
      }).finish(),
      authInfoBytes: cosmos.tx.v1beta1.AuthInfo.encode({
        signerInfos: [
          {
            publicKey: {
              type_url: "/cosmos.crypto.secp256k1.PubKey",
              value: cosmos.crypto.secp256k1.PubKey.encode({
                key: Buffer.from(
                  signResponse.signature.pub_key.value,
                  "base64",
                ),
              }).finish(),
            },
            modeInfo: {
              single: {
                mode:
                  cosmos.tx.signing.v1beta1.SignMode
                    .SIGN_MODE_LEGACY_AMINO_JSON,
              },
            },
            sequence: Long.fromString(signResponse.signed.sequence),
          },
        ],
        fee: {
          amount: signResponse.signed.fee.amount as cosmos.base.v1beta1.ICoin[],
          gasLimit: Long.fromString(signResponse.signed.fee.gas),
        },
      }).finish(),
      signatures: [Buffer.from(signResponse.signature.signature, "base64")],
    }).finish();

    return new NativeDexSignedTransaction(tx, signedTx);
  }

  async sendTx(
    chain: Chain,
    tx: StdTx | Uint8Array,
    mode: BroadcastMode,
  ): Promise<string> {
    const chainConfig = this.getIBCChainConfig(chain);

    const isProtoTx = Buffer.isBuffer(tx) || tx instanceof Uint8Array;

    const body = isProtoTx
      ? {
          tx_bytes: Buffer.from(tx as any).toString("base64"),
          mode: (() => {
            switch (mode) {
              case "async":
                return "BROADCAST_MODE_ASYNC";
              case "block":
                return "BROADCAST_MODE_BLOCK";
              case "sync":
                return "BROADCAST_MODE_SYNC";
              default:
                return "BROADCAST_MODE_UNSPECIFIED";
            }
          })(),
        }
      : {
          tx,
          mode: "block",
        };

    try {
      const url = `${chainConfig.restUrl}${
        isProtoTx ? "/cosmos/tx/v1beta1/txs" : "/txs"
      }`;
      console.log("url", url);
      const res = await fetch(url, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const json = await res.json();

      const txResponse = isProtoTx ? json["tx_response"] : json;

      if (txResponse.code != null && txResponse.code !== 0) {
        throw new Error(txResponse["raw_log"]);
      }

      return txResponse.txhash;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async broadcast(chain: Chain, tx: NativeDexSignedTransaction<EncodeObject>) {
    const signed = tx.signed as Uint8Array;
    // if (!signed.msg)
    //   throw new Error("Invalid signedTx, possibly it was not amino signed.");

    const chainConfig = this.getIBCChainConfig(chain);
    const keplr = await getKeplrProvider();

    const txHashHex = await this.sendTx(chain, signed, BroadcastMode.Block);

    // const txHashUInt8Array = await keplr!.sendTx(
    //   chainConfig.chainId,
    //   signed,
    //   BroadcastMode.Block,
    // );
    // const txHashHex = toHex(txHashUInt8Array).toUpperCase();

    // const signingStargate = await SigningStargateClient.connectWithSigner(
    //   chainConfig.rpcUrl,
    //   await this.getSendingSigner(chain),
    //   {},
    // );
    // const res = await signingStargate.broadcastTx(signed);
    // const txHashHex = res.transactionHash;

    const stargate = await StargateClient.connect(chainConfig.rpcUrl);
    const resultRaw = await stargate.getTx(txHashHex);

    if (!resultRaw || !resultRaw.hash?.match(/^([0-9A-F][0-9A-F])+$/)) {
      console.error("INVALID TXHASH IN RESULT", resultRaw);
      throw new Error(
        "Received ill-formatted txhash. Must be non-empty upper-case hex",
      );
    }
    const result: BroadcastTxResult = {
      ...resultRaw,
      logs: JSON.parse(resultRaw.rawLog),
      height: resultRaw.height,
      transactionHash: resultRaw.hash,
    };
    if (isBroadcastTxSuccess(result)) {
      result.logs.forEach((log) => {
        // @ts-ignore
        log.msg_index = 0;
        // @ts-ignore
        log.log = "";
      });
    }

    return isBroadcastTxFailure(result)
      ? {
          height: Uint53.fromString(result.height + "").toNumber(),
          transactionHash: result.transactionHash,
          code: result.code,
          rawLog: result.rawLog || "",
        }
      : {
          logs: result.logs ? parseLogs(result.logs) : [],
          rawLog: result.rawLog || "",
          transactionHash: result.transactionHash,
          data: result.data,
        };
  }
}
