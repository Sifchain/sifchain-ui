import { onMounted } from "@vue/runtime-core";
import { ref } from "vue";

export const useInputDefaultValueRef = (defaultValue: string) => {
  const inputRef = ref<HTMLInputElement>();

  onMounted(() => {
    if (inputRef.value) inputRef.value.value = defaultValue;
  });

  return inputRef;
};
