import { useCore } from "@/hooks/useCore";
import { createQueryClient, SifSigningStargateClient } from "@sifchain/sdk";
import {
  defineComponent,
  inject,
  InjectionKey,
  onMounted,
  provide,
  reactive,
} from "vue";

type QueryClients = Awaited<ReturnType<typeof createQueryClient>>;

type QueryClientsState =
  | ({
      queryClientStatus: "fulfilled";
    } & QueryClients)
  | { queryClientStatus?: "pending" | "rejected" };

type SigningClientState =
  | {
      signingClientStatus: "fulfilled";
      signingClient: SifSigningStargateClient;
    }
  | {
      signingClientStatus?: "pending" | "rejected";
    };

export type ClientsState = QueryClientsState & SigningClientState;

export const sifchainClientsSymbol: InjectionKey<
  ClientsState & {
    getOrInitQueryClients: () => Promise<QueryClients>;
    getOrInitSigningClient: () => Promise<SifSigningStargateClient>;
  }
> = Symbol("sifchainClients");

export const SifchainClientsProvider = defineComponent((_, { slots }) => {
  const state = reactive<ClientsState>({
    queryClientStatus: undefined,
    signingClientStatus: undefined,
  });

  const { config, services } = useCore();

  const getOrInitQueryClients = () => {
    if (state.queryClientStatus === "fulfilled") {
      return Promise.resolve(state);
    }

    state.queryClientStatus = "pending";
    return createQueryClient(config.sifRpcUrl)
      .then((queryClients) => {
        Object.assign(state, {
          ...queryClients,
          queryClientStatus: "fulfilled",
        });
        return queryClients;
      })
      .catch((error) => {
        state.queryClientStatus = "rejected";
        return Promise.reject(error);
      });
  };

  const getOrInitSigningClient = () => {
    if (state.signingClientStatus === "fulfilled")
      return Promise.resolve(state.signingClient);

    state.signingClientStatus = "pending";
    return services.wallet.keplrProvider
      .getOfflineSignerAuto(services.chains.nativeChain)
      .then((x) =>
        SifSigningStargateClient.connectWithSigner(config.sifRpcUrl, x),
      )
      .then((signingClient) => {
        Object.assign(state, {
          signingClient,
          signingClientStatus: "fulfilled",
        });
        return signingClient;
      })
      .catch((error) => {
        state.signingClientStatus = "rejected";
        return Promise.reject(error);
      });
  };

  onMounted(() =>
    Promise.all([getOrInitQueryClients(), getOrInitSigningClient()]),
  );

  provide(
    sifchainClientsSymbol,
    Object.assign(state, { getOrInitQueryClients, getOrInitSigningClient }),
  );

  return () => slots.default?.();
});

export const useSifchainClients = () => {
  const noProviderError = new Error(
    "No provider in tree, check if you have added SifchainClientsProvider",
  );

  return inject(
    sifchainClientsSymbol,
    new Proxy(
      {
        getOrInitQueryClients: () => {
          throw noProviderError;
        },
        getOrInitSigningClient: () => {
          throw noProviderError;
        },
      },
      {
        get() {
          throw noProviderError;
        },
      },
    ),
  );
};

export function useQueryClient<K extends keyof QueryClients>(clientKind: K) {
  const clientState = useSifchainClients();

  if (!clientState) return;

  if (clientState.queryClientStatus === "fulfilled") {
    return clientState[clientKind];
  }
}
