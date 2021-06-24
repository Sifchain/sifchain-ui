import React, {
  useEffect,
  createContext,
  useState,
  useContext,
  useMemo,
} from "react";
import { Store } from "../store";
import { effect, stop } from "@vue/reactivity";
import { isAmount, isAssetAmount } from "../entities";
import { AccountPool } from "../store/pools";
import { Api } from "../api";
import { Services } from "../services";
import { setupSifchainApi } from "../setupSifchainApi";

type ExtractorFn<T, A extends any[] = []> = (store: Store, ...args: A) => T;

function createStateHook<T, A extends any[] = []>(
  name: string,
  extractor: ExtractorFn<T, A>,
  init: T,
) {
  return function useStateHook(...args: A) {
    const [state, setState] = useState<T>(init);
    const ctx = useContext(SifchainContext);
    if (!ctx) {
      throw new Error(name + " must be used within a SifchainProvider");
    }

    useEffect(() => {
      const ef = effect(() => {
        setState(extractor(ctx.store, ...args));
      });

      return () => stop(ef);
    }, [ctx.store]);

    return state;
  };
}

type SifchainContext = { api: Api; services: Services; store: Store };
const SifchainContext = createContext<SifchainContext | undefined>(undefined);

export function SifchainProvider(props: {
  children: React.ReactNode;
  environment: "localnet" | "devnet" | "testnet" | "mainnet";
}) {
  const [ctx, setCtx] = useState<SifchainContext>();

  useEffect(() => {
    const { cleanup, ...ctx } = setupSifchainApi(
      props.environment || "localnet",
    );
    setCtx(ctx);
    return cleanup;
  }, [props.environment]);
  return ctx ? (
    <SifchainContext.Provider value={ctx}>
      {props.children}
    </SifchainContext.Provider>
  ) : null;
}

// https://stackoverflow.com/questions/728360/how-do-i-correctly-clone-a-javascript-object
function clone<T extends unknown>(obj: T): T {
  let copy: T;

  // Handle simple and custom immutable types
  if (
    null == obj ||
    "object" !== typeof obj ||
    isAssetAmount(obj) ||
    isAmount(obj)
  )
    return obj;

  // Handle our bespoke types

  // Handle Date
  if (obj instanceof Date) {
    copy = new Date() as T;
    (copy as Date).setTime(obj.getTime());
    return copy;
  }

  // Handle Array
  if (obj instanceof Array) {
    copy = [] as T;
    for (let i = 0, len = obj.length; i < len; i++) {
      (copy as any)[i] = clone(obj[i]);
    }
    return copy;
  }

  // Handle Object
  if (obj instanceof Object) {
    copy = {} as T;
    for (let attr in obj) {
      if (obj.hasOwnProperty(attr))
        (copy as any)[attr] = clone((obj as any)[attr]);
    }
    return copy;
  }

  throw new Error("Unable to copy obj! Its type isn't supported.");
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

export const useEthState = createStateHook<Store["wallet"]["eth"]>(
  "useEthState",
  (store) => ({
    chainId: store.wallet.eth.chainId,
    address: store.wallet.eth.address,
    balances: store.wallet.eth.balances,
    isConnected: store.wallet.eth.isConnected,
  }),
  {
    chainId: "",
    address: "",
    balances: [],
    isConnected: false,
  },
);

export const useSifState = createStateHook<Store["wallet"]["sif"]>(
  "useSifState",
  (store) => ({
    address: store.wallet.sif.address,
    balances: store.wallet.sif.balances,
    isConnected: store.wallet.sif.isConnected,
    lmUserData: store.wallet.sif.lmUserData,
    vsUserData: store.wallet.sif.vsUserData,
  }),
  {
    address: "",
    balances: [],
    isConnected: false,
    lmUserData: null,
    vsUserData: null,
  },
);

export const usePoolState = createStateHook<Store["pools"]>(
  "usePoolState",
  (store) => clone(store.pools),
  {},
);

type AccountPoolsStore = Store["accountpools"];
type AccountPoolsHashLookup = { [h: string]: AccountPool };
type HookArgs = [address: string];

export const useLpPoolsState = createStateHook<
  AccountPoolsStore | AccountPoolsHashLookup,
  HookArgs
>(
  "useLpPoolsState",
  (store, address) => {
    if (address) {
      return clone(store.accountpools[address]);
    }

    return clone(store.accountpools);
  },
  {},
);

export const useTxState = createStateHook<Store["tx"]>(
  "useTxState",
  (store) => ({ eth: store.tx.eth }),
  { eth: {} },
);

export const useAssetState = createStateHook<Store["asset"]>(
  "useAssetState",
  (store) => clone(store.asset),
  { topTokens: [] },
);
