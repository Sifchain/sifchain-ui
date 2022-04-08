import { useSifchainClients } from "@/business/providers/SifchainClientsProvider";
import { useCore } from "@/hooks/useCore";
import { DEFAULT_FEE, SifchainEncodeObjectRecord } from "@sifchain/sdk";
import { Network } from "@sifchain/sdk/src";
import { useMutation } from "vue-query";

export const useUnlockLiquidityMutation = () => {
  const sifchainClients = useSifchainClients();
  const { services } = useCore();

  return useMutation(
    "unlockLiquidity",
    async ({
      units,
      externalAssetSymbol,
    }: {
      units: string;
      externalAssetSymbol: string;
    }) => {
      const queryClients = await sifchainClients.getOrInitQueryClients();
      const signingClient = await sifchainClients.getOrInitSigningClient();
      const signer = await services.wallet.keplrProvider.connect(
        services.chains.get(Network.SIFCHAIN),
      );

      const tokenEntries = await queryClients.tokenRegistryQueryClient.Entries(
        {},
      );
      const tokenEntry = tokenEntries.registry?.entries.find(
        (x) => x.baseDenom === externalAssetSymbol,
      );

      // TODO: remove manual multi-unlock prevention on FE
      const liquidityProvider =
        await queryClients.clpQueryClient.GetLiquidityProvider({
          lpAddress: signer,
          symbol: tokenEntry?.denom ?? "",
        });

      if ((liquidityProvider.liquidityProvider?.unlocks.length ?? 0) > 0) {
        throw new Error("Multiple unlocks not allowed");
      }

      const message: SifchainEncodeObjectRecord["MsgUnlockLiquidityRequest"] = {
        typeUrl: "/sifnode.clp.v1.MsgUnlockLiquidityRequest",
        value: {
          signer,
          units,
          externalAsset: { symbol: tokenEntry?.denom ?? "" },
        },
      };

      return signingClient.signAndBroadcast(signer, [message], DEFAULT_FEE);
    },
  );
};
