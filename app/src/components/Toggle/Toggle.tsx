import { defineComponent, PropType, TransitionGroup } from "vue";

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
  },
  setup(props) {
    const inner = (
      <button
        class={[
          `flex h-[16px] w-[28px] cursor-pointer items-center rounded-full border-[1px] border-solid  transition-all active:bg-opacity-20`,
          props.active
            ? `border-connected-base active:bg-connected-base`
            : `border-gray-800 active:bg-gray-800`,
        ]}
        onClick={() => props.onChange(!props.active)}
      >
        <TransitionGroup name="flip-list--fast">
          {props.active && (
            <div
              key="pod"
              class={[
                `m-[1px] ml-auto  h-[12px] w-[12px] rounded-full transition-all`,
                props.active ? `bg-connected-base` : `bg-gray-800`,
              ]}
            ></div>
          )}
          {!props.active && (
            <div
              key="pod"
              class={[
                `m-[1px] h-[12px] w-[12px] rounded-full transition-all`,
                props.active ? `bg-[connected-base]` : `bg-gray-800`,
              ]}
            />
          )}
        </TransitionGroup>
      </button>
    );
    return () =>
      props.label ? (
        <label class="flex cursor-pointer items-center justify-start gap-1">
          {inner}
          <span class="font-medium">{props.label}</span>
        </label>
      ) : (
        inner
      );
  },
});
