import {
  defineComponent,
  PropType,
  Ref,
  ref,
  toRefs,
  watchEffect,
  computed,
} from "vue";

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
        <div class={["w-full relative", data.value.class]}>
          {!!data.value.label && (
            <div class="mb-[10px] pt-[1em] first:pt-0 font-medium">
              {data.value.label}
            </div>
          )}
          {data.value.details.map(([key, value], index, arr) => (
            <div
              class={[
                `
              h-[49px] w-full flex justify-between items-center
              box-border Dbg-gray-base border-gray-input_outline border-l-[1px] border-b-[1px] border-r-[1px] border-solid`,
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
              <div class="pl-[20px] text-left text-md text-white font-sans font-medium">
                {key}
              </div>
              <div
                class={[
                  `flex flex-row justify-end mr-[14px] items-center pl-[20px] text-right text-md text-white font-medium`,
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
