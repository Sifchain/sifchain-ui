import { useSifchainClients } from "~/business/providers/SifchainClientsProvider";
import dangerouslyAssert from "~/utils/dangerouslyAssert";
import { differenceInMilliseconds, parseISO } from "date-fns";
import { computed } from "vue";
import { useQuery } from "vue-query";

export const useBlockTimeQuery = () => {
  const sifchainClients = useSifchainClients();
  return useQuery(
    "blockTime",
    async () => {
      dangerouslyAssert<"fulfilled">(sifchainClients.signingClientStatus);

      const currentHeight = await sifchainClients.signingClient.getHeight();

      const currentBlock = await sifchainClients.signingClient.getBlock(
        currentHeight,
      );
      const prevBlock = await sifchainClients.signingClient.getBlock(
        currentHeight - 1,
      );

      return differenceInMilliseconds(
        parseISO(currentBlock.header.time),
        parseISO(prevBlock.header.time),
      );
    },
    {
      enabled: computed(
        () => sifchainClients.signingClientStatus === "fulfilled",
      ),
    },
  );
};
