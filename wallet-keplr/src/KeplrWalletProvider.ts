import {
  IndexedTx,
  SigningStargateClient,
  StargateClient,
} from "@cosmjs/stargate";
import { cosmos, ibc } from "@keplr-wallet/cosmos";
import { AminoMsg } from "@cosmjs/amino";

import { Chain, Network } from "@sifchain/sdk";
import {
  NativeAminoTypes,
  NativeDexSignedTransaction,
  NativeDexTransaction,
} from "@sifchain/sdk/src/clients";
import {
  CosmosWalletProvider,
  WalletProviderContext,
} from "@sifchain/sdk/src/clients/wallets";

import { toHex } from "@cosmjs/encoding";
import {
  BroadcastMode,
  BroadcastTxResult,
  makeSignDoc,
  makeStdTx,
  StdTx,
} from "@cosmjs/launchpad";
import {
  EncodeObject,
  OfflineDirectSigner,
  OfflineSigner,
} from "@cosmjs/proto-signing";
import { parseRawLog } from "@cosmjs/stargate/build/logs";

import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { getKeplrProvider } from "./getKeplrProvider";

import Long from "long";

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

    if (!keplr) {
      throw new Error("Keplr not installed");
    }

    await keplr.experimentalSuggestChain(chainConfig.keplrChainInfo);
    await keplr.enable(chainConfig.chainId);
    const sendingSigner = keplr.getOfflineSigner(chainConfig.chainId);

    if (!sendingSigner)
      throw new Error(`Failed to get sendingSigner for ${chainConfig.chainId}`);

    return sendingSigner;
  }

  async getOfflineSignerAuto(chain: Chain) {
    const chainConfig = this.getIBCChainConfig(chain);
    const keplr = await getKeplrProvider();
    const sendingSigner = await keplr?.getOfflineSignerAuto(
      chainConfig.chainId,
    );

    if (sendingSigner === undefined)
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

  /*
   * After 0.44 upgrade, external chains don't accept Amino tx broadcasts.
   * To make this work, we sign an amino tx (since Ledger requires Amino),
   * then we broadcast a protobuf tx body with the extracted amino signature.
   * This is ONLY required for IBC imports right now and our protobuf-encoding
   * IBC function is not working so we manually write it for IBC.
   */
  async signIbcImport(chain: Chain, tx: NativeDexTransaction<EncodeObject>) {
    const chainConfig = this.getIBCChainConfig(chain);
    const stargate = await StargateClient.connect(chainConfig.rpcUrl);

    const account = await stargate.getAccount(tx.fromAddress || "");
    const fee = {
      amount: [tx.fee.price],
      gas: tx.fee.gas,
    };

    const converter = new NativeAminoTypes();

    const keplr = (await getKeplrProvider())!;
    const key = await keplr?.getKey(chainConfig.chainId);
    const bech32Address = key!.bech32Address;

    const aminoMsgs: AminoMsg[] = tx.msgs.map(
      converter.toAmino.bind(converter),
    );
    const [aminoMsg] = aminoMsgs;

    const protoMsg = {
      type_url: "/ibc.applications.transfer.v1.MsgTransfer",
      value: ibc.applications.transfer.v1.MsgTransfer.encode({
        sourcePort: aminoMsg.value.source_port,
        sourceChannel: aminoMsg.value.source_channel,
        token: aminoMsg.value.token,
        sender: aminoMsg.value.sender,
        receiver: aminoMsg.value.receiver,
        timeoutHeight: {
          revisionNumber: Long.fromString(
            aminoMsg.value.timeout_height.revision_number,
          ),
          revisionHeight: Long.fromString(
            aminoMsg.value.timeout_height.revision_height,
          ),
        },
      }).finish(),
    };

    if (
      !account ||
      (typeof account?.accountNumber !== "number" &&
        typeof account?.sequence === "number")
    ) {
      throw new Error(
        `This account (${tx.fromAddress}) does not yet exist on-chain. Please send some funds to it before proceeding.`,
      );
    }

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
      bech32Address,
      signDoc,
    );

    const signedTx = cosmos.tx.v1beta1.TxRaw.encode({
      bodyBytes: cosmos.tx.v1beta1.TxBody.encode({
        messages: [protoMsg],
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
                mode: cosmos.tx.signing.v1beta1.SignMode
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

  async sign(chain: Chain, tx: NativeDexTransaction<EncodeObject>) {
    if (
      tx.msgs[0]?.typeUrl === "/ibc.applications.transfer.v1.MsgTransfer" &&
      chain.network !== Network.SIFCHAIN
    ) {
      if (tx.msgs.length > 1) {
        throw new Error(
          "Cannot send batched tx for import, please send only 1 import message as tx",
        );
      }
      return this.signIbcImport(chain, tx);
    }
    const chainConfig = this.getIBCChainConfig(chain);
    const stargate = await StargateClient.connect(chainConfig.rpcUrl);

    const converter = new NativeAminoTypes();

    const msgs: AminoMsg[] = tx.msgs.map(converter.toAmino.bind(converter));

    const fee = {
      amount: [tx.fee.price],
      gas: tx.fee.gas,
    };
    const account = await stargate.getAccount(tx.fromAddress || "");
    if (
      typeof account?.accountNumber !== "number" &&
      typeof account?.sequence === "number"
    ) {
      throw new Error(
        `This account (${tx.fromAddress}) does not yet exist on-chain. Please send some funds to it before proceeding.`,
      );
    }
    const keplr = await getKeplrProvider();

    if (!keplr) {
      throw new Error("No keplr provider found");
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const signDoc = makeSignDoc(
      msgs,
      fee,
      chainConfig.chainId,
      tx.memo || "",
      account?.accountNumber.toString() || "",
      account?.sequence.toString() || "",
    );
    const key = await keplr?.getKey(chainConfig.chainId);
    let bech32Address = key?.bech32Address;
    const defaultKeplrOpts = keplr!.defaultOptions;
    keplr!.defaultOptions = {
      sign: {
        preferNoSetFee: false,
        preferNoSetMemo: true,
      },
    };
    const signResponse = await keplr!.signAmino(
      chainConfig.chainId,
      bech32Address || "",
      signDoc,
    );
    keplr!.defaultOptions = defaultKeplrOpts;
    const signedTx = makeStdTx(signResponse.signed, signResponse.signature);
    return new NativeDexSignedTransaction(tx, signedTx);
  }

  async broadcast(chain: Chain, tx: NativeDexSignedTransaction<EncodeObject>) {
    // Broadcast EncodeObject
    if ((tx.signed as TxRaw).authInfoBytes) {
      const chainConfig = this.getIBCChainConfig(chain);
      const signer = await this.getSendingSigner(chain);

      const stargate = await SigningStargateClient.connectWithSigner(
        chainConfig.rpcUrl,
        signer,
      );
      const result = await stargate.broadcastTx(
        Uint8Array.from(TxRaw.encode(tx.signed as TxRaw).finish()),
      );
      return result as BroadcastTxResult;
    } else if (
      !(tx.signed instanceof Uint8Array) &&
      !(tx.signed as StdTx).msg
    ) {
      throw new Error("Invalid signedTx, must be Uint8Array or TxRaw or StdTx");
    }

    const chainConfig = this.getIBCChainConfig(chain);
    const keplr = await getKeplrProvider();

    const txHashUInt8Array = await keplr!.sendTx(
      chainConfig.chainId,
      tx.signed as Uint8Array | StdTx,
      BroadcastMode.Sync,
    );
    const txHashHex = toHex(txHashUInt8Array).toUpperCase();

    const stargate = await StargateClient.connect(chainConfig.rpcUrl);
    let resultRaw: IndexedTx | null = null;
    let triesRemaining = 5;

    while (!resultRaw && triesRemaining-- > 0) {
      resultRaw = await stargate.getTx(txHashHex);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    if (!resultRaw || !resultRaw.hash?.match(/^([0-9A-F][0-9A-F])+$/)) {
      console.error("INVALID TXHASH IN RESULT", resultRaw);
      throw new Error(
        "Received ill-formatted txhash. Must be non-empty upper-case hex",
      );
    }

    return !!resultRaw.code
      ? {
          height: resultRaw.height,
          transactionHash: resultRaw.hash,
          code: resultRaw.code,
          rawLog: resultRaw.rawLog,
        }
      : {
          logs: parseRawLog(resultRaw.rawLog),
          rawLog: resultRaw.rawLog || "",
          transactionHash: resultRaw.hash,
        };
  }
}
