import {
  encodeSecp256k1Pubkey,
  makeSignDoc as makeSignDocAmino,
  OfflineAminoSigner,
  StdFee,
} from "@cosmjs/amino";
import { fromBase64 } from "@cosmjs/encoding";
import { Int53 } from "@cosmjs/math";
import {
  EncodeObject,
  encodePubkey,
  makeAuthInfoBytes,
} from "@cosmjs/proto-signing";
import { SignMode } from "@cosmjs/proto-signing/build/codec/cosmos/tx/signing/v1beta1/signing";
import { AminoTypes, SigningStargateClientOptions } from "@cosmjs/stargate";
import { SignerData, SigningStargateClient } from "@cosmjs/stargate";
import { TxRaw } from "@cosmjs/stargate/build/codec/cosmos/tx/v1beta1/tx";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { OfflineSigner } from "@cosmjs/launchpad/build/signer";
import { NativeAminoTypes } from "../../../services/utils/SifClient/NativeAminoTypes";

interface DemerisSigning {
  exposedSigner: OfflineAminoSigner;
  signWMeta: (
    signerAddress: string,
    messages: readonly EncodeObject[],
    fee: StdFee,
    memo: string,
    signerData: SignerData,
  ) => Promise<Uint8Array>;
}

export default class DemerisSigningClient
  extends SigningStargateClient
  implements DemerisSigning {
  exposedSigner: OfflineAminoSigner;
  constructor(
    tmClient: Tendermint34Client | undefined,
    signer: OfflineSigner,
    options: SigningStargateClientOptions,
  ) {
    super(tmClient, signer, options);
    this.exposedSigner = signer;
  }
  async signWMeta(
    signerAddress: string,
    messages: readonly EncodeObject[],
    fee: StdFee,
    memo = "",
    { accountNumber, sequence, chainId }: SignerData,
  ): Promise<Uint8Array> {
    const accountFromSigner = (await this.exposedSigner.getAccounts()).find(
      (account) => account.address === signerAddress,
    );
    if (!accountFromSigner) {
      throw new Error("Failed to retrieve account from signer");
    }
    const aminoTypes = new NativeAminoTypes();
    const pubkey = encodePubkey(
      encodeSecp256k1Pubkey(accountFromSigner.pubkey),
    );
    const signMode = SignMode.SIGN_MODE_LEGACY_AMINO_JSON;
    const msgs = messages.map((msg) => aminoTypes.toAmino(msg));

    const signDoc = makeSignDocAmino(
      msgs,
      fee,
      chainId,
      memo,
      accountNumber,
      sequence,
    );
    const { signature, signed } = await this.exposedSigner.signAmino(
      signerAddress,
      signDoc,
    );
    const signedTxBody = {
      messages: signed.msgs.map((msg) => aminoTypes.fromAmino(msg)),
      memo: signed.memo,
    };

    // @ts-ignore
    const signedTxBodyEncodeObject: TxBodyEncodeObject = {
      typeUrl: "/cosmos.tx.v1beta1.TxBody",
      value: signedTxBody,
    };
    const signedTxBodyBytes = this.registry.encode(signedTxBodyEncodeObject);
    const signedGasLimit = Int53.fromString(signed.fee.gas).toNumber();
    const signedSequence = Int53.fromString(signed.sequence).toNumber();
    const signedAuthInfoBytes = makeAuthInfoBytes(
      [pubkey],
      signed.fee.amount,
      signedGasLimit,
      signedSequence,
      signMode,
    );
    const txRaw: TxRaw = TxRaw.fromPartial({
      bodyBytes: signedTxBodyBytes,
      authInfoBytes: signedAuthInfoBytes,
      signatures: [fromBase64(signature.signature)],
    });

    const enc = TxRaw.encode(txRaw);
    const dec = TxRaw.encode(TxRaw.decode(enc.finish())).finish();
    return dec;
  }
}
