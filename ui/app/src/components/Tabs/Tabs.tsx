import { defineComponent, PropType } from "vue";
import clsx from "clsx";

export type Tab = {
  value: string;
  label: string;
};

export default defineComponent({
  name: "Tabs",
  props: {
    tabs: {
      type: Array as PropType<Tab[]>,
      default: [],
    },
    value: {
      type: String,
    },
    onChange: {
      type: Function as PropType<(tab: Tab) => void>,
    },
  },
  setup(props) {
    return () => (
      <ul class="flex gap-4 bg-[#2B2B2B] rounded-lg p-2">
        {props.tabs?.map((tab) => (
          <li class="flex-1">
            <button
              onClick={() => {
                if (props.onChange) {
                  props.onChange(tab);
                }
              }}
              class={clsx(
                "flex w-full items-center justify-center rounded p-2",
                {
                  "bg-[#414141]": tab.value === props.value,
                },
              )}
            >
              <span class="text-lg font-semibold">{tab.label}</span>
            </button>
          </li>
        ))}
      </ul>
    );
  },
});
