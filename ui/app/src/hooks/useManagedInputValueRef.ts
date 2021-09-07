import { onMounted } from "vue";
import { ref, Ref, watch } from "vue";

// Sets input to the value in the given ref whenever the ref changes.
// Does not set if the input is focused.
export const useManagedInputValueRef = (value: Ref<string>) => {
  const inputRef = ref<HTMLInputElement>();
  // const focusedRef = ref(false);

  const onUpdate = () => {
    if (inputRef.value && document.activeElement !== inputRef.value) {
      inputRef.value.value = value.value;
    }
  };

  watch(value, onUpdate);
  onMounted(onUpdate);

  return inputRef;
};
