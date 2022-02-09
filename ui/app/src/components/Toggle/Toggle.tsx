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
          `cursor-pointer flex transition-all items-center h-[16px] w-[28px] border-solid active:bg-opacity-20  border-[1px] rounded-full`,
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
                `transition-all ml-auto  w-[12px] h-[12px] m-[1px] rounded-full`,
                props.active ? `bg-connected-base` : `bg-gray-800`,
              ]}
            ></div>
          )}
          {!props.active && (
            <div
              key="pod"
              class={[
                `transition-all w-[12px] h-[12px] m-[1px] rounded-full`,
                props.active ? `bg-[connected-base]` : `bg-gray-800`,
              ]}
            />
          )}
        </TransitionGroup>
      </button>
    );
    return () =>
      props.label ? (
        <label class="flex items-center justify-start gap-1 cursor-pointer">
          {inner}
          <span class="font-medium">{props.label}</span>
        </label>
      ) : (
        inner
      );
  },
});
