import { createQueryClient, SifSigningStargateClient } from "@sifchain/sdk";
import {
  defineComponent,
  inject,
  InjectionKey,
  onMounted,
  provide,
  reactive,
} from "vue";

import { useCore } from "~/hooks/useCore";

type QueryClient = Awaited<ReturnType<typeof createQueryClient>>;

type QueryClientsState =
  | {
      queryClientStatus: "fulfilled";
      queryClient: QueryClient;
    }
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
    getOrInitQueryClients: () => Promise<QueryClient>;
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
      return Promise.resolve(state.queryClient);
    }

    state.queryClientStatus = "pending";
    return createQueryClient(config.sifRpcUrl)
      .then((queryClient) => {
        Object.assign(state, {
          queryClient,
          queryClientStatus: "fulfilled",
        });
        return queryClient;
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
