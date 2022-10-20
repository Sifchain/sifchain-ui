import { useSifchainClients } from "~/business/providers/SifchainClientsProvider";
import { useAsyncData } from "./useAsyncData";

export default function usePools() {
  const sifchainClients = useSifchainClients();

  return useAsyncData(() =>
    sifchainClients.getOrInitQueryClients().then((x) => x.clp.GetPools({})),
  );
}
