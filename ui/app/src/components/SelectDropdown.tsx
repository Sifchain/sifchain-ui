import { defineComponent, PropType, Ref, ref } from "vue";
import { Tooltip, TooltipProps } from "./Tooltip";

export type SelectDropdownOption = {
  content: string | JSX.Element;
  value: string | number;
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
      type: Object as PropType<Ref<SelectDropdownOption["value"]>>,
    },
    onChangeValue: {
      type: Function as PropType<
        (value: SelectDropdownOption["value"]) => void
      >,
      required: true,
    },
    tooltipProps: {
      type: Object as PropType<TooltipProps>,
    },
  },
  setup(props, ctx) {
    const tooltipInstance = ref();

    const { onShow, onHidden, ...tooltipPropsRest } = props.tooltipProps || {};
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
        {...tooltipPropsRest}
        onShow={(instance) => {
          tooltipInstance.value = instance;
          instance.popper
            .querySelector(".tippy-content")
            ?.classList.add("tippy-content-reset");
          if (onShow) onShow(instance);
        }}
        onHidden={(instance) => {
          tooltipInstance.value = null;
          if (onHidden) onHidden(instance);
        }}
        content={
          <div
            onClick={() => tooltipInstance.value?.hide()}
            class={[
              "min-w-[150px] bg-gray-input border-gray-input_outline border-solid border rounded-sm",
              props.class,
            ]}
          >
            {props.options.value.map((option) => (
              <div
                key={option.value}
                class={[
                  "flex items-center w-full pl-[12px] pr-[16px] text-md h-[48px] hover:bg-gray-base cursor-pointer font-normal",
                ]}
                onClick={() => {
                  props.onChangeValue(option.value);
                }}
              >
                <div
                  class={[
                    "mr-[8px]",
                    option.value !== props.value?.value && "invisible",
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
