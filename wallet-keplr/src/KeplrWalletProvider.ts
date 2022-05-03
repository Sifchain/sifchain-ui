import { toHex } from "@cosmjs/encoding";
import {
  BroadcastMode,
  BroadcastTxResult,
  isBroadcastTxFailure,
  isBroadcastTxSuccess,
  makeSignDoc,
  makeStdTx,
  StdTx,
} from "@cosmjs/launchpad";
import { Uint53 } from "@cosmjs/math";
import {
  EncodeObject,
  OfflineDirectSigner,
  OfflineSigner,
} from "@cosmjs/proto-signing";
import {
  IndexedTx,
  SigningStargateClient,
  StargateClient,
} from "@cosmjs/stargate";
import { parseLogs } from "@cosmjs/stargate/build/logs";
import { Keplr } from "@keplr-wallet/types";
import { Chain, Network } from "@sifchain/sdk";
import { WalletProviderContext } from "@sifchain/sdk/build/typescript/clients/wallets/WalletProvider";
import {
  NativeAminoTypes,
  NativeDexSignedTransaction,
  NativeDexTransaction,
} from "@sifchain/sdk/src/clients";
import { CosmosWalletProvider } from "@sifchain/sdk/src/clients/wallets";
import { isMobile as checkIsMobile } from "@walletconnect/browser-utils";
import { Buffer } from "buffer/";
import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";
import { PubKey } from "cosmjs-types/cosmos/crypto/secp256k1/keys";
import { SignMode } from "cosmjs-types/cosmos/tx/signing/v1beta1/signing";
import { AuthInfo, TxBody, TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { MsgTransfer } from "cosmjs-types/ibc/applications/transfer/v1/tx";
import Long from "long";
import { getKeplrProvider } from "./getKeplrProvider";
import { getWalletConnect, getWCKeplr } from "./getWcKeplr";

export type KeplrWalletProviderContext = WalletProviderContext & {
  chains: Chain[];
};
export class KeplrWalletProvider extends CosmosWalletProvider {
  wcKeplrPromise?: Promise<Keplr> = undefined;

  static create(context: KeplrWalletProviderContext) {
    return new KeplrWalletProvider(context);
  }

  constructor(public context: KeplrWalletProviderContext) {
    super(context);
  }

  onAccountChanged(callback: () => void) {
    try {
      window.addEventListener("keplr_keystorechange", callback);
      return () => window.removeEventListener("keplr_keystorechange", callback);
    } catch (e) {}
  }

  // Temporary mobile support
  // TODO: implement wallet switcher
  async getKeplr() {
    if (!(await this.shouldUseWalletConnect())) {
      return await getKeplrProvider();
    }

    if (this.wcKeplrPromise !== undefined) {
      return this.wcKeplrPromise;
    }

    this.wcKeplrPromise = getWCKeplr({
      sendTx: async (chainId, tx, mode) => {
        const chain = this.context.chains.find(
          (x) => x.chainConfig.chainId === chainId,
        )!;
        const ibcConfig = this.getIBCChainConfig(chain);

        const url = new URL("txs", ibcConfig.restUrl);
        url.searchParams.append("tx", JSON.stringify(tx));
        url.searchParams.append("mode", JSON.stringify(mode));

        const result = await fetch(url.toString(), {
          method: "post",
        }).then((x) => x.json());

        return Buffer.from(result.txhash, "hex");
      },
    });

    return this.wcKeplrPromise;
  }

  async isInstalled(chain: Chain) {
    const shouldUseWalletConnect = await this.shouldUseWalletConnect();
    return shouldUseWalletConnect || (window as any).keplr != null;
  }

  async hasConnected(chain: Chain) {
    if ((await this.shouldUseWalletConnect()) && !getWalletConnect().connected)
      return false;

    const chainConfig = this.getIBCChainConfig(chain);
    const keplr = await this.getKeplr();

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
    const keplr = await this.enableChain(chain);
    const sendingSigner = keplr?.getOfflineSigner(chainConfig.chainId);

    if (!sendingSigner)
      throw new Error(`Failed to get sendingSigner for ${chainConfig.chainId}`);

    return sendingSigner;
  }

  async getOfflineSignerAuto(chain: Chain) {
    const chainConfig = this.getIBCChainConfig(chain);
    const keplr = await this.enableChain(chain);
    const sendingSigner = (await this.shouldUseWalletConnect())
      ? keplr?.getOfflineSignerOnlyAmino(chainConfig.chainId)
      : await keplr?.getOfflineSignerAuto(chainConfig.chainId);

    if (sendingSigner === undefined)
      throw new Error(`Failed to get sendingSigner for ${chainConfig.chainId}`);

    return sendingSigner;
  }

  async tryConnectAll(...chains: Chain[]) {
    const keplr = await this.getKeplr();
    const chainIds = chains
      .filter((c) => c.chainConfig.chainType === "ibc")
      .map((c) => c.chainConfig.chainId);

    return keplr?.enable(chainIds);
  }

  async connect(chain: Chain) {
    const keplr = await this.enableChain(chain);
    const key = await keplr?.getKey(chain.chainConfig.chainId);

    const address = key?.bech32Address;

    if (!address) {
      const sendingSigner = await this.getSendingSigner(chain);
      return (await sendingSigner.getAccounts())[0]?.address;
    }

    if (!address) {
      throw new Error(
        `No address to connect to for chain ${chain.displayName}`,
      );
    }

    return address;
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

    const keplr = (await this.getKeplr())!;
    const key = await keplr?.getKey(chainConfig.chainId);
    const bech32Address = key!.bech32Address;

    const aminoMsgs = tx.msgs.map((x) => converter.toAmino(x));
    const aminoMsg = aminoMsgs[0];

    const protoMsg = {
      typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
      value: MsgTransfer.encode(
        MsgTransfer.fromPartial({
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
        }),
      ).finish(),
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

    const signedTx = TxRaw.encode({
      bodyBytes: TxBody.encode(
        TxBody.fromPartial({
          messages: [protoMsg],
          memo: signResponse.signed.memo,
        }),
      ).finish(),
      authInfoBytes: AuthInfo.encode(
        AuthInfo.fromPartial({
          signerInfos: [
            {
              publicKey: {
                typeUrl: "/cosmos.crypto.secp256k1.PubKey",
                value: PubKey.encode({
                  key: Buffer.from(
                    signResponse.signature.pub_key.value,
                    "base64",
                  ),
                }).finish(),
              },
              modeInfo: {
                single: {
                  mode: SignMode.SIGN_MODE_LEGACY_AMINO_JSON,
                },
              },
              sequence: Long.fromString(signResponse.signed.sequence),
            },
          ],
          fee: {
            amount: signResponse.signed.fee.amount as Coin[],
            gasLimit: Long.fromString(signResponse.signed.fee.gas),
          },
        }),
      ).finish(),
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

    const msgs = tx.msgs.map((x) => converter.toAmino(x));

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
    const keplr = await this.getKeplr();
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
    console.log("tx", tx);
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
    const keplr = await this.getKeplr();

    const txHashUInt8Array = await keplr!.sendTx(
      chainConfig.chainId,
      tx.signed as Uint8Array,
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

  private async enableChain(chain: Chain) {
    const chainConfig = this.getIBCChainConfig(chain);
    const keplr = await this.getKeplr();

    await keplr?.enable(chain.chainConfig.chainId);

    try {
      await keplr?.experimentalSuggestChain(chainConfig.keplrChainInfo);
    } catch (error) {
      console.error(error);
    }

    return keplr;
  }

  private async shouldUseWalletConnect() {
    const windowKeplr = await getKeplrProvider();

    return windowKeplr && checkIsMobile();
  }
}
