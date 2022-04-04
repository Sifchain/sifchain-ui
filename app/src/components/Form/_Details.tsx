import { defineComponent, PropType, computed } from "vue";

export type ErrorType = "danger" | "warning" | "bad";

export type _FormDetailsType =
  | [any, any][]
  | {
      label?: any;
      details: [any, any][];
      errorType?: ErrorType;
      isError?: boolean;
    };

export const errorTypeClass = {
  danger: "border-danger-base",
  warning: "border-danger-warning",
  bad: "border-danger-bad",
};

export const _Details = defineComponent({
  props: {
    details: {
      type: Object as PropType<_FormDetailsType>,
      required: true,
    },
    label: {},
    isError: {
      type: Boolean,
    },
    class: {
      type: String,
    },
  },
  setup: (props, context) => {
    const data = computed(() => {
      if (Array.isArray(props.details)) {
        return {
          details: props.details,
          label: props.label,
          isError: props.isError,
          errorType: "danger",
          class: props.class,
        };
      }
      return {
        details: props.details.details,
        label: props.details.label,
        isError: props.details.isError,
        errorType: props.details.errorType || "danger",
        class: props.class,
      };
    });

    return () => {
      return (
        <div class={["relative w-full", data.value.class]}>
          {!!data.value.label && (
            <div class="mb-[10px] pt-[1em] font-medium first:pt-0">
              {data.value.label}
            </div>
          )}
          {data.value.details.map(([key, value], index, arr) => (
            <div
              class={[
                `
              bg-gray-base border-gray-input_outline box-border flex h-[49px]
              w-full items-center justify-between border-l-[1px] border-b-[1px] border-r-[1px] border-solid`,
                index == 0 && `rounded-t border-t-[1px]`,
                index == arr.length - 1 && `rounded-b border-b-[1px]`,
                data.value.isError
                  ? {
                      danger: "border-danger-base",
                      warning: "border-danger-warning",
                      bad: "border-danger-bad",
                    }[data.value.errorType]
                  : "",
              ]}
            >
              <div class="text-md pl-[20px] text-left font-sans font-medium text-white">
                {key}
              </div>
              <div
                class={[
                  `text-md mr-[14px] flex flex-row items-center justify-end pl-[20px] text-right font-medium text-white`,
                ]}
              >
                {value}
                {/* <span class="mr-[4px] whitespace-nowrap"></span> */}
                {/* <img class="h-[18px]" src={props.toTokenImageUrl} alt="" /> */}
              </div>
            </div>
          ))}
          {context.slots.default?.()}
        </div>
      );
    };
  },
});
