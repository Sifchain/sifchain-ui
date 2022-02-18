import { DirectSecp256k1HdWallet, EncodeObject } from "@cosmjs/proto-signing";
import { BroadcastTxResult } from "@cosmjs/launchpad";
import { SigningStargateClient } from "@cosmjs/stargate";
import { stringToPath } from "@cosmjs/crypto";

import { TxRaw } from "@cosmjs/stargate/build/codec/cosmos/tx/v1beta1/tx";

import {
  NativeDexTransaction,
  NativeDexSignedTransaction,
  NativeDexClient,
} from "../../native";
import { AssetAmount, Chain } from "../../../entities";
import { WalletProviderContext } from "../../wallets/WalletProvider";
import { TokenRegistry } from "../../native/TokenRegistry";
import { CosmosWalletProvider } from "./CosmosWalletProvider";
import { toBaseUnits } from "../../../utils";

export type DirectSecp256k1HdWalletProviderOptions = {
  mnemonic: string;
};

export class DirectSecp256k1HdWalletProvider extends CosmosWalletProvider {
  static create(
    context: WalletProviderContext,
    options: DirectSecp256k1HdWalletProviderOptions,
  ) {
    return new DirectSecp256k1HdWalletProvider(context, options);
  }

  async isInstalled(chain: Chain) {
    return true;
  }

  constructor(
    public context: WalletProviderContext,
    private options: DirectSecp256k1HdWalletProviderOptions,
  ) {
    super(context);
    this.tokenRegistry = TokenRegistry(context);
  }

  async hasConnected(chain: Chain) {
    return false;
  }

  isChainSupported(chain: Chain) {
    return chain.chainConfig.chainType === "ibc";
  }

  canDisconnect(chain: Chain) {
    return false;
  }
  async disconnect(chain: Chain) {
    throw new Error("Cannot disconnect");
  }
  // inconsequential change for git commit
  async getSendingSigner(chain: Chain) {
    const chainConfig = this.getIBCChainConfig(chain);

    // cosmos = m/44'/118'/0'/0
    // const parts = [
    //   `m`,
    //   `44'`, // bip44,
    //   `${chainConfig.keplrChainInfo.bip44.coinType}'`, // coinType
    //   `0'`,
    //   `0`,
    // ];
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(
      this.options.mnemonic || "",
      {
        // hdPaths: [stringToPath(parts.join("/")) as any],
        prefix: chainConfig.keplrChainInfo.bech32Config.bech32PrefixAccAddr,
      },
    );
    return wallet;
  }

  async connect(chain: Chain) {
    const wallet = await this.getSendingSigner(chain);

    const [account] = await wallet.getAccounts();
    if (!account?.address) {
      throw new Error("No address to connect to");
    }
    return account.address;
  }

  async sign(chain: Chain, tx: NativeDexTransaction<EncodeObject>) {
    const chainConfig = this.getIBCChainConfig(chain);
    const signer = await this.getSendingSigner(chain);
    const nativeRegistry = NativeDexClient.getNativeRegistry();

    const stargate = await SigningStargateClient.connectWithSigner(
      chainConfig.rpcUrl,
      signer,
      {
        // the nativeRegistry technically returns a different version of the type than expected...
        // but it's fine. ignore the type error.
        // @ts-ignore
        registry: nativeRegistry,
      },
    );

    const nativeToken = await this.tokenRegistry.findAssetEntryOrThrow(
      chain.nativeAsset,
    );
    const fee = {
      amount: [
        {
          // 'uatom' for cosmos, 'rowan' for sifchain, etc
          denom: nativeToken.denom,
          amount: toBaseUnits("1", chain.nativeAsset),
        },
      ],
      gas: tx.fee.gas,
    };

    const signed = await stargate.sign(tx.fromAddress, tx.msgs, fee, tx.memo);
    return new NativeDexSignedTransaction(tx, signed);
  }

  async broadcast(chain: Chain, tx: NativeDexSignedTransaction<EncodeObject>) {
    const signed = tx.signed as TxRaw;
    if (signed.bodyBytes == null)
      throw new Error("Invalid signedTx, possibly it was not proto signed.");

    const chainConfig = this.getIBCChainConfig(chain);
    const signer = await this.getSendingSigner(chain);

    const stargate = await SigningStargateClient.connectWithSigner(
      chainConfig.rpcUrl,
      signer,
    );
    const result = await stargate.broadcastTx(
      Uint8Array.from(TxRaw.encode(signed).finish()),
    );
    return result as BroadcastTxResult;
  }
}
