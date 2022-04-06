import {
  defineComponent,
  inject,
  InjectionKey,
  onMounted,
  provide,
  reactive,
} from "vue";

import { useCore } from "@/hooks/useCore";
import { createQueryClient, createSigningClient } from "@sifchain/sdk";

type QueryClients = Awaited<ReturnType<typeof createQueryClient>>;

type QueryClientsState =
  | ({
      queryClientStatus: "fulfilled";
    } & QueryClients)
  | { queryClientStatus?: "pending" | "rejected" };

type SigningClient = Awaited<ReturnType<typeof createSigningClient>>;

type SigningClientState =
  | {
      signingClientStatus: "fulfilled";
      signingClient: SigningClient;
    }
  | {
      signingClientStatus?: "pending" | "rejected";
    };

export type ClientsState = QueryClientsState & SigningClientState;

export const sifchainClientsSymbol: InjectionKey<ClientsState> =
  Symbol("sifchainClients");

export const SifchainClientsProvider = defineComponent((_, { slots }) => {
  const state = reactive<ClientsState>({
    queryClientStatus: undefined,
    signingClientStatus: undefined,
  });

  const { config, services } = useCore();

  onMounted(() => {
    state.queryClientStatus = "pending";
    const queryClientPromise = createQueryClient(config.sifRpcUrl)
      .then((x) => {
        Object.assign(state, { ...x, queryClientStatus: "fulfilled" });
      })
      .catch(() => (state.queryClientStatus = "rejected"));

    state.signingClientStatus = "pending";
    const signingClientPromise = services.wallet.keplrProvider
      .getSendingSigner(services.chains.nativeChain)
      .then((x) => createSigningClient(config.sifRpcUrl, x))
      .then((x) =>
        Object.assign(state, {
          signingClient: x,
          signingClientStatus: "fulfilled",
        }),
      )
      .catch(() => (state.signingClientStatus = "rejected"));

    return Promise.all([queryClientPromise, signingClientPromise]);
  });

  provide(sifchainClientsSymbol, state);

  return () => slots.default?.();
});

export const injectSifchainClients = () => inject(sifchainClientsSymbol);

export function useQueryClient<K extends keyof QueryClients>(clientKind: K) {
  const clientState = injectSifchainClients();

  if (!clientState) return;

  if (clientState.queryClientStatus === "fulfilled") {
    return clientState[clientKind];
  }
}
