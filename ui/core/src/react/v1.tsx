import {
  createStore,
  createServices,
  createUsecases,
  getConfig,
} from "../index";
import React, {
  useEffect,
  createContext,
  useState,
  useContext,
  useMemo,
} from "react";
import { profileLookup, SifEnv } from "../config/getEnv";
import { Store } from "../store";
import { effect, stop } from "@vue/reactivity";

type Usecases = ReturnType<typeof createUsecases>;
type Api = Usecases["clp"] &
  Usecases["peg"] &
  Usecases["reward"] &
  Usecases["wallet"]["eth"] &
  Usecases["wallet"]["sif"] & { bus: () => Bus };
type Services = ReturnType<typeof createServices>;
type Bus = Services["bus"];

type SifchainEnv = "localnet" | "devnet" | "testnet" | "mainnet";

function setupSifchainApi(environment: SifchainEnv = "localnet") {
  // Following should happen with an underlying shared API
  const { tag, ethAssetTag, sifAssetTag } = profileLookup[
    {
      devnet: SifEnv.DEVNET,
      localnet: SifEnv.LOCALNET,
      testnet: SifEnv.TESTNET,
      mainnet: SifEnv.MAINNET,
    }[environment]
  ];
  const config = getConfig(tag, sifAssetTag, ethAssetTag);
  const services = createServices(config);
  const store = createStore();
  const usecases = createUsecases({ store, services });
  const api = {
    ...usecases.clp,
    ...usecases.peg,
    ...usecases.reward,
    ...usecases.wallet.eth,
    ...usecases.wallet.sif,
    bus: () => services.bus,
  };
  usecases.clp.initClp();
  usecases.wallet.sif.initSifWallet();
  usecases.wallet.eth.initEthWallet();
  return { api, services, store };
}

type ExtractorFn<T> = (
  setter: React.Dispatch<React.SetStateAction<T | undefined>>,
  store: Store,
) => void;

function useStateHook<T>(name: string, extractor: ExtractorFn<T>) {
  const [state, setState] = useState<T>();
  const ctx = useContext(SifchainContext);
  if (!ctx) {
    throw new Error(name + " must be used within a SifchainProvider");
  }

  useEffect(() => {
    const { store } = ctx;
    const ef = effect(() => {
      extractor(setState, store);
    });

    return () => stop(ef);
  }, [ctx.store]);

  return state;
}

type SifchainContext = { api: Api; services: Services; store: Store };
const SifchainContext = createContext<SifchainContext | undefined>(undefined);

export function SifchainProvider(props: {
  children: React.ReactNode;
  environment: "localnet" | "devnet" | "testnet" | "mainnet";
}) {
  const ctx = useMemo(() => setupSifchainApi(props.environment || "localnet"), [
    props.environment,
  ]);
  return (
    <SifchainContext.Provider value={ctx}>
      {props.children}
    </SifchainContext.Provider>
  );
}

function clone(obj: object) {
  return JSON.parse(JSON.stringify(obj));
}

export function useSifchain() {
  const ctx = useContext(SifchainContext);
  if (!ctx) {
    throw new Error("useSifchain must be used within a SifchainProvider");
  }
  return useMemo(() => ctx.api, [ctx.api]);
}

export function useSifchainEvents() {
  const ctx = useContext(SifchainContext);
  if (!ctx) {
    throw new Error("useSifchainEvents must be used within a SifchainProvider");
  }
  return useMemo(() => ctx.services.bus, [ctx.services.bus]);
}

export function useEthState() {
  return useStateHook<Store["wallet"]["eth"]>(
    "useEthState",
    (setState, store) => {
      setState({
        chainId: store.wallet.eth.chainId,
        address: store.wallet.eth.address,
        balances: store.wallet.eth.balances,
        isConnected: store.wallet.eth.isConnected,
      });
    },
  );
}

export function useSifState() {
  return useStateHook<Store["wallet"]["sif"]>(
    "useEthState",
    (setState, store) => {
      console.log("Updating sif state");
      setState({
        address: store.wallet.sif.address,
        balances: store.wallet.sif.balances,
        isConnected: store.wallet.sif.isConnected,
        lmUserData: store.wallet.sif.lmUserData,
        vsUserData: store.wallet.sif.vsUserData,
      });
    },
  );
}

export function usePoolState() {
  return useStateHook<Store["pools"]>("usePoolsState", (setState, store) => {
    setState(clone(store.pools));
  });
}

export function useLpPoolsState(address?: string) {
  return useStateHook<Store["accountpools"]>(
    "useLpPoolsState",
    (setState, store) => {
      if (address) {
        setState(clone(store.accountpools[address]));
        return;
      }

      setState(clone(store.accountpools));
    },
  );
}

export function useAssetState() {
  return useStateHook<Store["asset"]>("useAssetState", (setState, store) => {
    setState(clone(store.asset));
  });
}
