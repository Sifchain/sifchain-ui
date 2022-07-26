import { defineComponent, PropType, TransitionGroup } from "vue";

export default defineComponent({
  name: "Toggle",
  props: {
    class: {
      type: String,
      required: false,
    },
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
    const inner = (
      <button
        disabled={props.disabled}
        class={[
          `flex h-[16px] w-[28px] cursor-pointer items-center rounded-full border-[1px] border-solid transition-all active:bg-opacity-20`,
          props.active && !props.disabled
            ? `border-connected-base active:bg-connected-base`
            : `border-gray-800 active:bg-gray-800`,
          props.disabled ? "pointer-events-none" : "",
        ]}
        onClick={() => props.onChange(!props.active)}
      >
        <TransitionGroup name="flip-list--fast">
          <div
            key="pod"
            class={[
              `m-[1px] h-[12px] w-[12px] rounded-full transition-all`,
              props.active ? "bg-connected-base ml-auto" : "bg-gray-800",
              props.disabled ? "bg-gray-800" : "",
            ]}
          />
        </TransitionGroup>
      </button>
    );
    return () =>
      props.label ? (
        <label
          class={[
            "flex cursor-pointer items-center justify-start gap-1",
            props.class,
          ]}
        >
          {inner}
          <span class="font-medium">{props.label}</span>
        </label>
      ) : (
        inner
      );
  },
});
