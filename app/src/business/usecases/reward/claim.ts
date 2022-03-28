// This is an attempt to follow Rudi's new usecase WIP pattern
import { DistributionType } from "@sifchain/sdk/src/generated/proto/sifnode/dispensation/v1/types";
import { Services } from "../../services";
import { TransactionStatus, Network } from "@sifchain/sdk";
type PickDispensation = Pick<Services["dispensation"], "claim">;
type PickSif = Services["sif"];

export type ClaimArgs = {
  dispensation: PickDispensation;
  sif: PickSif;
  chains: Services["chains"];
  wallet: Services["wallet"];
};
type RewardProgramName = "COSMOS_IBC_REWARDS_V1" | "harvest";

export function Claim({ dispensation, wallet, sif, chains }: ClaimArgs) {
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

    const address = await wallet.keplrProvider.connect(chains.nativeChain);
    if (!address) throw new Error("Not connected to Sifchain wallet");

    const client = await sif.loadNativeDexClient();

    const tx = client.tx.dispensation.CreateUserClaim(
      {
        userClaimAddress: params.fromAddress,
        userClaimType: params.claimType,
      },
      address,
      undefined,
      memo,
    );
    const signed = await wallet.keplrProvider.sign(chains.nativeChain, tx);
    const sent = await wallet.keplrProvider.broadcast(
      chains.nativeChain,
      signed,
    );

    return client.parseTxResult(sent);
  };
}
