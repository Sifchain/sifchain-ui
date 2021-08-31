// This is an attempt to follow Rudi's new usecase WIP pattern
import getKeplrProvider from "../../services/SifService/getKeplrProvider";
import { NativeDexClient } from "../../services/utils/SifClient/NativeDexClient";
import { DistributionType } from "../../generated/proto/sifnode/dispensation/v1/types";
import { Services } from "../../services";
import { coins } from "@cosmjs/stargate";

type PickDispensation = Pick<Services["dispensation"], "claim">;
type PickSif = Pick<Services["sif"], "signAndBroadcast" | "unSignedClient">;

export type ClaimArgs = {
  dispensation: PickDispensation;
  sif: PickSif;
};
type RewardProgramName = "IBC_REWARDS_V1";
type RewardProgramMemo = `program=${RewardProgramName}`;
export function Claim({ dispensation, sif }: ClaimArgs) {
  return async ({
    rewardProgramName,
    ...params
  }: {
    claimType: DistributionType;
    fromAddress: string;
    rewardProgramName: RewardProgramName;
  }) => {
    if (!params) throw "You forgot claimType and fromAddress";
    const msg = await dispensation.claim(params);
    const memo = `program=${rewardProgramName}` as RewardProgramMemo;
    const client = await NativeDexClient.connect(sif.unSignedClient.rpcUrl);
    const keplrProvider = await getKeplrProvider();
    if (!keplrProvider) throw new Error("keplr not enabled");
    const signingClient = client.createSigningClient(
      keplrProvider.getOfflineSigner(await sif.unSignedClient.getChainId()),
    );
    // Blocked on internal error: https://api-testnet.sifchain.finance/cosmos/tx/v1beta1/txs/BE47BBEC27D55CE100E9E72A8EE361A41CA4628BBFE341691D3A3C5F78A34C37
    const tx = await (await signingClient).signAndBroadcast(
      params.fromAddress,
      [msg],
      {
        // Keplr overwrites this in app but for unit/integration tests where we
        // dont connect to keplr we need to specify an amount of rowan to pay for the fee.
        amount: coins(250000, "rowan"),
        gas: "500000", // TODO - see if "auto" setting
      },
      memo,
    );
    console.log(tx);
  };
}
