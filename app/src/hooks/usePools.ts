import { useQueryClient } from "@/business/providers/SifchainClientsProvider";
import { useAsyncData } from "./useAsyncData";

export default function usePools() {
  const client = useQueryClient("clpQueryClient");
  if (!client) {
    throw new Error("clpQueryClient unavailable");
  }
  return useAsyncData(client.GetPools.bind(null, {}));
}
