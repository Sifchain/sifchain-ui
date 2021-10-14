import { effect } from "@vue/reactivity";
import {
  watch,
  defineComponent,
  onMounted,
  onUnmounted,
  PropType,
  Ref,
  ref,
} from "vue";
import { Tooltip, TooltipProps } from "./Tooltip";

export type SelectDropdownOption = {
  content: string | JSX.Element;
  value: string;
};

export const SelectDropdown = defineComponent({
  name: "SelectDropdown",
  props: {
    class: {
      type: String,
    },
    options: {
      type: Object as PropType<Ref<SelectDropdownOption[]>>,
      required: true,
    },
    value: {
      type: Object as PropType<Ref<string>>,
      required: true,
    },
    onChangeValue: {
      type: Function as PropType<(value: string) => void>,
      required: true,
    },
    onShow: {
      type: Function as PropType<() => void>,
    },
    onHide: {
      type: Function as PropType<() => void>,
    },
    tooltipProps: {
      type: Object as PropType<TooltipProps>,
    },
  },
  setup(props, ctx) {
    const tooltipInstance = ref();

    const { onShow, onHide, ...tooltipPropsRest } = props.tooltipProps || {};

    const updateWidth = () => {
      const reference = tooltipInstance.value?.reference?.children[0];
      const content = tooltipInstance.value?.popper.querySelector(
        ".tippy-content",
      );

      if (content && reference) {
        content.style.width = getComputedStyle(reference).width;
      }
    };

    effect(updateWidth);
    onMounted(() => {
      window.addEventListener("resize", updateWidth);
    });
    onUnmounted(() => {
      window.removeEventListener("resize", updateWidth);
    });

    return () => (
      <Tooltip
        interactive
        hideOnClick
        trigger="click"
        maxWidth="none"
        placement="bottom-start"
        animation="none"
        arrow={false}
        offset={[0, 0]}
        key={props.value.value}
        {...tooltipPropsRest}
        onShow={(instance) => {
          tooltipInstance.value = instance;
          instance.popper
            .querySelector(".tippy-content")
            ?.classList.add("tippy-content-reset");
          if (onShow) onShow(instance);
          props.onShow?.();
        }}
        onHide={(instance) => {
          tooltipInstance.value = null;
          if (onHide) onHide(instance);
          props.onHide?.();
        }}
        content={
          <div
            onClick={() => tooltipInstance.value?.hide()}
            class={[
              "bg-gray-input_outline border-gray-500 border-solid border rounded-sm overflow-hidden",
              props.class,
            ]}
          >
            {props.options.value.map((option) => (
              <div
                key={option.value}
                class={[
                  "flex items-center w-full pl-[12px] pr-[16px] text-md h-[48px] hover:bg-gray-input cursor-pointer font-normal whitespace-nowrap",
                ]}
                onClick={() => {
                  props.onChangeValue(option.value);
                }}
              >
                <div
                  class={[
                    "mr-[8px]",
                    option.value !== props.value.value && "invisible",
                  ]}
                >
                  ✓
                </div>
                {option.content}
              </div>
            ))}
          </div>
        }
      >
        {ctx.slots.default?.()}
      </Tooltip>
    );
  },
});
