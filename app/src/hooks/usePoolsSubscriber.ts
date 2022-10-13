import { onUnmounted, Ref, ref, watch } from "vue";

import { accountStore } from "~/store/modules/accounts";
import { useCore } from "./useCore";

export const useUserPoolsSubscriber = (params: {
  delay?: Ref<number | undefined>;
}) => {
  const unsubscribeRef = ref(() => {});

  const stop = watch(
    [accountStore.refs.sifchain.address.computed(), params.delay],
    () => {
      unsubscribeRef.value();
      if (!accountStore.state.sifchain.address) return;

      unsubscribeRef.value = useCore().usecases.clp.subscribeToUserPools(
        accountStore.state.sifchain.address,
        params.delay?.value,
      );
    },
    { immediate: true },
  );

  onUnmounted(() => {
    stop();
    unsubscribeRef.value();
  });
};

export const usePublicPoolsSubscriber = (params: {
  delay?: Ref<number | undefined>;
}) => {
  const unsubscribeRef = ref(() => {});

  const stop = watch(
    [params.delay],
    () => {
      unsubscribeRef.value();
      unsubscribeRef.value = useCore().usecases.clp.subscribeToPublicPools(
        params.delay?.value,
      );
    },
    { immediate: true },
  );

  onUnmounted(() => {
    stop();
    unsubscribeRef.value();
  });
};
