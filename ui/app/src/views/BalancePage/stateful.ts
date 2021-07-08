import { defineComponent } from "vue";

export const stateful = (
  setup: Parameters<typeof defineComponent>[0]["setup"],
) => {
  // do something with your property
  return defineComponent({
    setup,
  });
};
