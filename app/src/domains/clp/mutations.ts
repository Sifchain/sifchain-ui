import { useSifchainClients } from "@/business/providers/SifchainClientsProvider";
import { useCore } from "@/hooks/useCore";
import { SifchainEncodeObjectRecord } from "@sifchain/sdk";
import { Network } from "@sifchain/sdk/src";
import { useMutation } from "vue-query";

export const useUnlockLiquidityMutation = () => {
  const sifchainClients = useSifchainClients();
  const { services } = useCore();

  return useMutation(
    "unlockLiquidity",
    async ({ units }: { units: string }) => {
      const signingClient = await sifchainClients.getOrInitSigningClient();
      const signer = await services.wallet.keplrProvider.connect(
        services.chains.get(Network.SIFCHAIN),
      );

      const message: SifchainEncodeObjectRecord["MsgUnlockLiquidityRequest"] = {
        typeUrl: "/sifnode.clp.v1.MsgUnlockLiquidityRequest",
        value: { signer, units },
      };

      return signingClient.signAndBroadcast(signer, [message], "auto");
    },
  );
};
