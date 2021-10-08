import { StargateClient, QueryClient } from "@cosmjs/stargate";
import Long from "long";
import { ChainIdHelper } from "../../wallets/cosmos/ChainIdHelper";

export const getTransferTimeoutData = async (
  sendingStargateClient: StargateClient,
  desiredTimeoutMinutes: number,
) => {
  const blockTimeMinutes = 7 / 60;

  const timeoutBlockDelta = Math.ceil(desiredTimeoutMinutes / blockTimeMinutes);

  return {
    revisionNumber: Long.fromNumber(
      +ChainIdHelper.parse(
        await sendingStargateClient.getChainId(),
      ).version.toString() || 0,
    ),
    // Set the timeout height as the current height + 150.
    revisionHeight: Long.fromNumber(
      (await sendingStargateClient.getHeight()) + timeoutBlockDelta,
    ),
  };
};
