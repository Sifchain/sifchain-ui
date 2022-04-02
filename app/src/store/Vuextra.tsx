import { ComputedRef, computed } from "vue";
import { ActionContext, StoreOptions, Store } from "vuex";

/* 

  A method-driven typescript-friendly Vuex store wrapper

*/

export type PathImpl<T, Key extends keyof T> = Key extends string
  ? T[Key] extends Record<string, any>
    ?
        | `${Key}.${PathImpl<T[Key], Exclude<keyof T[Key], keyof any[]>> &
            string}`
        | `${Key}.${Exclude<keyof T[Key], keyof any[]> & string}`
    : never
  : never;

export type PathImpl2<T> = PathImpl<T, keyof T> | keyof T;

export type Path<T> = PathImpl2<T> extends string | keyof T
  ? PathImpl2<T>
  : keyof T;

export const Vuextra = { createStore };

interface VuextraOptions<
  State,
  Actions extends ActionsBase<State, VuextraContext>,
  Mutations extends MutationsBase<State>,
  Getters extends GettersBase<State>,
  Modules extends VuextraOptions<any, any, any, any, any, any>[],
  VuextraContext extends ReturnType<Actions> & ActionContext<State, State>,
> {
  name: string;
  actions: Actions;
  mutations: Mutations;
  getters: Getters;
  state: State;
  options: Partial<StoreOptions<State>>;
  modules: Modules;
  init?: () => Promise<void> | void;
}

type ActionsBase<State, Ctx> = (
  context: ActionContext<State, State>,
) => Readonly<
  Record<string, (arg?: any) => Promise<void> | void | Promise<() => void>>
>;

type MutationsBase<State> = (
  state: State,
) => Readonly<Record<string, (arg?: any) => void>>;

type GettersBase<State> = (
  state: DeepReadonly<State>,
) => Readonly<Record<string, (arg?: any) => void>>;

type DeepReadonly<T> = T extends object
  ? { [K in keyof T]: DeepReadonly<T[K]> } & Readonly<T>
  : Readonly<T>;

function createStore<
  State,
  Actions extends ActionsBase<State, VuextraContext>,
  Mutations extends MutationsBase<State>,
  Getters extends GettersBase<State>,
  Modules extends VuextraOptions<any, any, any, any, any, any>[],
  VuextraContext extends ReturnType<Actions> & ActionContext<State, State>,
>(
  config: Readonly<
    VuextraOptions<State, Actions, Mutations, Getters, Modules, VuextraContext>
  >,
) {
  let store: Store<Record<typeof config.name, State>> | undefined;
  const getStore = () => {
    if (!store)
      throw new Error("Vuextra store accessed before store initialized");
    return store;
  };
  const {
    mutations: mutationComposer,
    actions: actionComposer,
    getters: getterComposer,
    state,
    options,
  } = config;
  const mutations = Object.fromEntries(
    Object.entries(mutationComposer({} as State)).map(([key, fn]) => [
      key,
      (state: State, payload: any) =>
        (mutationComposer(state) as Record<string, (payload: any) => any>)[key](
          payload,
        ),
    ]),
  );
  const wrappedMutations = Object.fromEntries(
    Object.entries(mutationComposer({} as unknown as State)).map(([k, v]) => {
      return [
        k,
        (payload: any) => {
          getStore().commit(config.name + "/" + k, payload);
        },
      ];
    }),
  ) as unknown as ReturnType<typeof mutationComposer>;

  const wrappedActions = Object.fromEntries(
    Object.entries(actionComposer({} as unknown as VuextraContext)).map(
      ([k, v]) => {
        return [
          k,
          (payload: any) => {
            return getStore().dispatch(config.name + "/" + k, payload);
          },
        ];
      },
    ),
  ) as unknown as ReturnType<typeof actionComposer>;

  const actions = Object.fromEntries(
    Object.entries(actionComposer({} as any)).map(([key, _fn]) => [
      key,
      function (context: ActionContext<State, State>, payload: any) {
        return (
          actionComposer({
            ...context,
            ...wrappedActions,
          } as VuextraContext) as Record<string, (payload: any) => any>
        )[key](payload);
      }.bind({}),
    ]),
  );

  const getters = Object.fromEntries(
    Object.entries(getterComposer({} as any)).map(([key, fn]) => [
      key,
      function (state: DeepReadonly<State>) {
        return (getterComposer(state) as Record<string, () => any>)[key]();
      },
    ]),
  );

  type ComposerReturnType = ReturnType<typeof getterComposer>;

  const moduleConfig = {
    namespaced: true,
    ...options,
    state,
    mutations,
    actions,
    getters,
  } as const;

  type MappedGetters<T> = T extends Record<any, () => any>
    ? {
        [K in keyof T]: ReturnType<T[K]>;
      }
    : T;

  type GettersType = MappedGetters<ComposerReturnType>;
  const vuextraStore = {
    ...wrappedActions,
    ...wrappedMutations,
    mutations: wrappedMutations,
    actions: wrappedActions,
    get getters() {
      const getters = getStore().getters;
      return new Proxy(getters, {
        get(target, p, receiver) {
          return getters[typeof p === "string" ? config.name + "/" + p : p];
        },
      }) as GettersType;
    },
    get state() {
      return getStore().state[config.name] as State;
    },
    get store() {
      return getStore();
    },
    register(rootStore: Store<any>) {
      store = rootStore;
      // @ts-ignore
      store.registerModule(config.name, moduleConfig);
      try {
        config.init?.();
      } catch (e) {
        console.error(e);
      }
    },
  };

  function vuextraComputed<T>(
    arg: (state: DeepReadonly<typeof storeProxy>) => T,
  ): ComputedRef<T>;
  function vuextraComputed<T>(arg: any) {
    return computed<T>(() => {
      if (typeof arg === "function") {
        return arg(storeProxy);
      }
    });
  }

  type DeepComputedProxy<T> = T extends object
    ? { [K in keyof T]: DeepComputedProxy<T[K]> } & {
        computed: () => ComputedRef<T>;
      }
    : {
        computed: () => ComputedRef<T>;
      };

  const computePath = (path: string[], targets: any[]) => {
    let vals = [...targets];
    for (let index = 0; index < vals.length; index++) {
      let pathCopy = [...path];
      while (pathCopy.length) {
        const currVal = vals[index];
        if (typeof currVal !== "object") break;
        let p = pathCopy.shift();
        if (p != undefined) vals[index] = currVal[p];
      }
    }
    return vals.find((v) => v !== undefined);
  };

  function createDeepRefProxy<T>(
    targets: T[],
    path: any[] = [],
  ): DeepComputedProxy<Pick<typeof storeProxy, "state" | "getters">> {
    const p = new Proxy(
      {} as DeepComputedProxy<Pick<typeof storeProxy, "state" | "getters">>,
      {
        get(target, p, receiver) {
          if (p === "computed") {
            return () => computed(() => computePath(path, targets));
          }
          const val = computePath([...path, p], targets);
          if (typeof val !== "object") {
            return {
              computed() {
                return computed(() => computePath([...path, p], targets));
              },
            };
          }
          return createDeepRefProxy(targets, [...path, p]);
        },
      },
    );
    return p;
  }

  const storeProxy = new Proxy(vuextraStore, {
    get(_target, p, _receiver) {
      if (p === "register") {
        return vuextraStore[p];
      }
      if (p === "computed") {
        return vuextraComputed;
      }
      if (p === "refs") {
        return createDeepRefProxy([vuextraStore.state, vuextraStore.getters]);
      }
      return Reflect.get(vuextraStore, p, vuextraStore);
    },
  }) as typeof vuextraStore & { getters: GettersType };

  type StoreProxyType = typeof storeProxy;

  return storeProxy as Readonly<
    typeof storeProxy & {
      computed: typeof vuextraComputed;
      refs: DeepComputedProxy<
        DeepReadonly<StoreProxyType["state"] & StoreProxyType["getters"]>
      >;
    }
  >;
}
