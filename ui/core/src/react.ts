import {
  createStore,
  createServices,
  createUsecases,
  getConfig,
} from "./index";
import { useEffect, useState } from "react";
import { Store } from "./store";
import { effect, stop, toRaw } from "@vue/reactivity";

type Usecases = ReturnType<typeof createUsecases>;
type Bus = ReturnType<typeof createServices>["bus"];
type Api = Usecases["clp"] &
  Usecases["peg"] &
  Usecases["reward"] &
  Usecases["wallet"]["eth"] &
  Usecases["wallet"]["sif"] & { bus: () => Bus };

export function useSifchain(): [Store | undefined, Api | undefined] {
  const [storeObject, setState] = useState<Store | undefined>(undefined);
  const [api, setApi] = useState<Api | undefined>(undefined);

  useEffect(() => {
    console.log("Use effect");

    const config = getConfig();
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

    setApi(api);
    const e = effect(() => {
      // This is highly inefficient for React we need to be able to ask for specific keys to attach to render
      JSON.stringify(store);
      setState(Object.assign({}, toRaw(store)));
    });

    return () => stop(e);
  }, []);

  return [storeObject, api];
}
