import { computed, defineComponent, PropType, TransitionGroup } from "vue";

export default defineComponent({
  name: "Toggle",
  props: {
    active: {
      type: Boolean,
      required: true,
    },
    onChange: {
      type: Function as PropType<(active: boolean) => void>,
      required: true,
    },
    label: {
      type: String,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const inner = computed(() => (
      <button
        disabled={props.disabled}
        class={[
          `flex h-[16px] w-[28px] cursor-pointer items-center rounded-full border transition-all focus:ring-2 active:bg-opacity-20`,
          props.active && !props.disabled
            ? `border-connected-base ring-connected-base/50`
            : `border-gray-600`,
          props.disabled ? "pointer-events-none" : "",
        ]}
        onClick={() => props.onChange(!props.active)}
      >
        <TransitionGroup name="flip-list--fast">
          <div
            key="pod"
            class={[
              `m-[1px] h-[12px] w-[12px] rounded-full transition-all`,
              props.active ? "bg-connected-base ml-auto" : "bg-gray-600",
              props.disabled ? "bg-gray-800" : "",
            ]}
          />
        </TransitionGroup>
      </button>
    ));
    return () =>
      props.label ? (
        <label class="flex cursor-pointer items-center justify-start gap-1">
          {inner.value}
          <span class="font-medium">{props.label}</span>
        </label>
      ) : (
        inner.value
      );
  },
});
