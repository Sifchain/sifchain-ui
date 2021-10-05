// This is an attempt to follow Rudi's new usecase WIP pattern
import getKeplrProvider from "../../services/SifService/getKeplrProvider";
import { NativeDexClient } from "../../services/utils/SifClient/NativeDexClient";
import { DistributionType } from "../../generated/proto/sifnode/dispensation/v1/types";
import { Services } from "../../services";
import { coins, isBroadcastTxFailure } from "@cosmjs/stargate";
import { parseTxFailure } from "../../services/SifService/parseTxFailure";
import { MsgCreateUserClaim } from "../../generated/proto/sifnode/dispensation/v1/tx";
import { TransactionStatus } from "../../entities/Transaction";
import { Network } from "../../entities";
type PickDispensation = Pick<Services["dispensation"], "claim">;
type PickSif = Services["sif"];

export type ClaimArgs = {
  dispensation: PickDispensation;
  sif: PickSif;
  chains: Services["chains"];
};
type RewardProgramName = "COSMOS_IBC_REWARDS_V1" | "harvest";

export function Claim({ dispensation, sif, chains }: ClaimArgs) {
  return async ({
    rewardProgramName,
    ...params
  }: {
    claimType: DistributionType;
    fromAddress: string;
    rewardProgramName: RewardProgramName;
  }): Promise<TransactionStatus> => {
    if (!params) throw "You forgot claimType and fromAddress";
    const memo = `program=${rewardProgramName}`;
    const keplrProvider = await getKeplrProvider();
    if (!keplrProvider) throw new Error("keplr not enabled");
    const client = await sif.loadNativeDexClient();
    const tx = client.tx.dispensation.CreateUserClaim(
      {
        userClaimAddress: params.fromAddress,
        userClaimType: params.claimType,
      },
      sif.getState().address,
      undefined,
      memo,
    );
    const signer = await keplrProvider.getOfflineSigner(
      chains.get(Network.SIFCHAIN).chainConfig.chainId,
    );
    const signed = await client.sign(tx, signer);
    const sent = await client.broadcast(signed);
    const parsed = client.parseTxResult(sent);
    return parsed;
  };
}
