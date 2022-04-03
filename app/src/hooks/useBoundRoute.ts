import { onMounted, ref, Ref, watch } from "vue";
import {
  RouteLocationNormalized,
  RouteLocationRaw,
  useRouter,
} from "vue-router";

type Binding = {
  params: Record<string, Ref<any>>;
  query: Record<string, Ref<any>>;
};

const isUpdatingRoute = ref(false);
const isUpdatingBindings = ref(false);
export const useBoundRoute = (bindings: Binding) => {
  const router = useRouter();
  const replaceRouteIfChanged = (location: RouteLocationRaw) => {
    const resolvedRoute = router.resolve(location);
    if (resolvedRoute.fullPath !== router.currentRoute.value.fullPath) {
      isUpdatingRoute.value = true;
      router.replace(resolvedRoute);
    }
  };
  const setBindingsFromRoute = (currRoute: RouteLocationNormalized) => {
    currRoute = router.currentRoute.value;

    // Params are assumed to be required
    for (const key in bindings.params) {
      // set data to param values if not already set
      if (currRoute.params[key] !== bindings.params[key].value) {
        isUpdatingBindings.value = true;
        bindings.params[key].value = currRoute.params[key];
      }
    }
    const nextRouteQuery = { ...currRoute.query };
    // iterate over data bindings, not query, because the bindings always contain all necessary keys
    for (const key in bindings.query) {
      const currBindingVal = bindings.query[key].value;
      // allow for values of `false` and `0`
      const isFalseyBindingValue =
        currBindingVal === undefined || currBindingVal === "";
      if (currRoute.query[key] === undefined) {
        // remove unneeded keys from route
        if (isFalseyBindingValue) delete nextRouteQuery[key];
        // if query param is not currently present, and it's bound value does exist,
        // initialize the query param with the bound value
        else nextRouteQuery[key] = currBindingVal;
      }
      // if the query param is defined, but not equal to the bound value
      // set the bound value to equal the query param value
      else if (currRoute.query[key] !== currBindingVal) {
        isUpdatingBindings.value = true;
        bindings.query[key].value = currRoute.query[key];
      }
    }
    replaceRouteIfChanged({
      ...currRoute,
      query: { ...nextRouteQuery },
      params: { ...currRoute.params },
    });
  };
  const setRouteFromBindings = () => {
    const currRoute = router.currentRoute.value;
    const nextRoute = {
      ...(currRoute.name
        ? { name: currRoute.name }
        : {
            path: currRoute.path,
          }),
      query: { ...currRoute.query } as Record<string, string>,
      params: { ...currRoute.params } as Record<string, string>,
    };
    let didChangeRoute = false;
    for (const key in bindings.params) {
      const val = bindings.params[key].value;
      if (nextRoute.params[key] !== val) {
        nextRoute.params[key] = val;
        didChangeRoute = true;
      }
    }
    for (const key in bindings.query) {
      const val = bindings.query[key].value;
      if (nextRoute.query[key] !== val) {
        if (val !== undefined || val !== "") nextRoute.query[key] = val;
        else {
          delete nextRoute.query[key];
        }
      }
      didChangeRoute = true;
    }
    isUpdatingRoute.value = true;
    if (didChangeRoute) replaceRouteIfChanged(nextRoute);
  };

  const isMounted = ref(false);

  onMounted(() => {
    setBindingsFromRoute(router.currentRoute.value);
    isMounted.value = true;
  });

  watch(
    () => {
      return [
        Object.values(bindings.query).forEach((b) => b.value),
        Object.values(bindings.params).forEach((b) => b.value),
      ];
    },
    (newBindings, oldBindings) => {
      if (!isMounted.value) return;
      if (isUpdatingBindings.value) {
        isUpdatingBindings.value = false;
        return;
      }
      setRouteFromBindings();
    },
  );
};
