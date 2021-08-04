import { ComputedGetter, ComputedRef } from "@vue/reactivity";
import Vue, { computed } from "vue";
import {
  createStore as createVuexStore,
  ActionContext,
  StoreOptions,
  Getter,
} from "vuex";

/* 

  A method-driven typescript-friendly Vuex store wrapper

*/

type PathImpl<T, Key extends keyof T> = Key extends string
  ? T[Key] extends Record<string, any>
    ?
        | `${Key}.${PathImpl<T[Key], Exclude<keyof T[Key], keyof any[]>> &
            string}`
        | `${Key}.${Exclude<keyof T[Key], keyof any[]> & string}`
    : never
  : never;

type PathImpl2<T> = PathImpl<T, keyof T> | keyof T;

type Path<T> = PathImpl2<T> extends string | keyof T ? PathImpl2<T> : keyof T;

type PathValue<T, P extends Path<T>> = P extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? Rest extends Path<T[Key]>
      ? PathValue<T[Key], Rest>
      : never
    : never
  : P extends keyof T
  ? T[P]
  : never;

// function getFromPath<T, P extends Path<T>>(obj: T, path: P): PathValue<T, P>;

export const Vuextra = {
  createStore,
};

interface VuextraOptions<
  State,
  Actions extends ActionsBase<State, VuextraContext>,
  Mutations extends MutationsBase<State>,
  Getters extends GettersBase<State>,
  Modules extends VuextraOptions<any, any, any, any, any, any>[],
  VuextraContext extends ReturnType<Actions> & ActionContext<State, State>
> {
  actions: Actions;
  mutations: Mutations;
  getters: Getters;
  state: State;
  options: Partial<StoreOptions<State>>;
  modules: Modules;
}

type ActionsBase<State, Ctx> = (
  context: ActionContext<State, State>,
) => Readonly<Record<string, (arg?: any) => Promise<void> | void>>;
type MutationsBase<State> = (
  state: State,
) => Readonly<Record<string, (arg?: any) => void>>;

type GettersBase<State> = (
  state: State,
) => Readonly<Record<string, (arg?: any) => void>>;

function createStore<
  State,
  Actions extends ActionsBase<State, VuextraContext>,
  Mutations extends MutationsBase<State>,
  Getters extends GettersBase<State>,
  Modules extends VuextraOptions<any, any, any, any, any, any>[],
  VuextraContext extends ReturnType<Actions> & ActionContext<State, State>
>(
  config: Readonly<
    VuextraOptions<State, Actions, Mutations, Getters, Modules, VuextraContext>
  >,
) {
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
  const wrappedMutations = (Object.fromEntries(
    Object.entries(mutationComposer(({} as unknown) as State)).map(([k, v]) => {
      return [
        k,
        (payload: any) => {
          store.commit(k, payload);
        },
      ];
    }),
  ) as unknown) as ReturnType<typeof mutationComposer>;

  const wrappedActions = (Object.fromEntries(
    Object.entries(actionComposer(({} as unknown) as VuextraContext)).map(
      ([k, v]) => {
        return [
          k,
          (payload: any) => {
            return store.dispatch(k, payload);
          },
        ];
      },
    ),
  ) as unknown) as ReturnType<typeof actionComposer>;

  const actions = Object.fromEntries(
    Object.entries(actionComposer({} as any)).map(([key, fn]) => [
      key,
      function (context: ActionContext<State, State>, payload: any) {
        return (actionComposer({
          ...context,
          ...wrappedActions,
        } as VuextraContext) as Record<string, (payload: any) => any>)[key](
          payload,
        );
      }.bind({}),
    ]),
  );

  const getters = Object.fromEntries(
    Object.entries(getterComposer({} as any)).map(([key, fn]) => [
      key,
      function (state: State) {
        return (getterComposer(state) as Record<string, () => any>)[key]();
      },
    ]),
  );

  type ComposerReturnType = ReturnType<typeof getterComposer>;

  const store = createVuexStore<State>({
    ...options,
    state,
    mutations,
    actions,
    getters,
  } as const);

  const vuextraStore = {
    ...wrappedActions,
    ...wrappedMutations,
    mutations: wrappedMutations,
    actions: wrappedActions,
    getters: store.getters as Record<
      keyof ComposerReturnType,
      ReturnType<ComposerReturnType[keyof ComposerReturnType]>
    >,
    state: store.state,
    store: store,
  };

  type GettersType = Readonly<
    Record<
      keyof ComposerReturnType,
      ReturnType<ComposerReturnType[keyof ComposerReturnType]>
    >
  >;
  type DeepReadonly<T> = T extends object
    ? { [K in keyof T]: DeepReadonly<T[K]> } & Readonly<T>
    : Readonly<T>;

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

  const storeProxy = new Proxy(vuextraStore, {
    get(target, p, receiver) {
      if (p === "computed") {
        return vuextraComputed;
      }

      if (p in store.getters) {
        return store.getters[p];
      }
      // if (p in store.state) {
      //   // @ts-ignore
      //   return store.state[p];
      // }
      return Reflect.get(target, p, receiver);
    },
  }) as typeof vuextraStore &
    GettersType & { getters: GettersType } & {
      computed: typeof vuextraComputed;
    };

  return storeProxy as DeepReadonly<typeof storeProxy>;
}

/* 
// Backburner 

if (p === "refs") {
  return createDeepRefProxy(storeProxy);
}

type DeepComputedProxy<T> = T extends object
    ? { [K in keyof T]: DeepComputedProxy<T[K]> } & ComputedRef<T>
    : ComputedRef<T>;

  const computePath = (path: string[], obj: any) => {
    let val = undefined;
    while (path.length) {
      let p = path.shift();
      if (p != undefined) val = obj[p];
    }
    return val;
  };
  function createDeepRefProxy(target: any) {
    let path: any = [];
    const p = new Proxy(
      target as DeepComputedProxy<Pick<typeof storeProxy, "state" | "getters">>,
      {
        get(target, p, receiver) {
          const currPath = path;
          let comp: ComputedRef<any> | undefined;
          if (p === "value" || p === "effect") {
            comp = comp || computed(() => computePath(currPath, storeProxy));
            return comp[p];
          }
          path = [...currPath, p];
          const val = computePath(path, storeProxy);
          if (typeof val !== "object") {
            return val;
          }
          return p;
        },
      },
    );
    return p;
  }

  */
