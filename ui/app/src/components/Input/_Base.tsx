import {
  defineComponent,
  HTMLAttributes,
  InputHTMLAttributes,
  mergeProps,
  Ref,
} from "vue";

export function _Base(
  props: InputHTMLAttributes & {
    containerClass?: HTMLAttributes["class"];
    containerProps?: HTMLAttributes;
    startContent?: JSX.Element | null;
    inputRef?: Ref<HTMLInputElement | undefined>;
  },
) {
  const {
    containerProps,
    containerClass,
    startContent,
    inputRef,
    ...inputProps
  } = props;
  const valueStr = inputRef?.value?.value ?? "";
  const intChars = valueStr.split(".")[0].length;
  const decChars = valueStr.split(".")[1]?.length ?? 0;
  const padLeftChars = Math.max(0, decChars - intChars);
  return (
    <div
      {...containerProps}
      class={[
        "relative flex justify-items-stretch items-center h-[54px] px-3 rounded bg-white bg-opacity-5 focus-within:border-white",
        containerProps?.class,
        containerClass,
      ]}
    >
      {startContent}
      <input
        ref={inputRef}
        {...mergeProps(inputProps, {
          style: {
            // paddingLeft: `${padLeftChars * 0.5}em`,
          },
        })}
        class={[
          "box-border outline-none w-full relative top-0 bottom-0 left-0 right-0 px-[16px] h-full bg-transparent outline-none text-[20px] text-white font-sans font-medium",
          // !!props.startContent && "pl-[68px]",
          inputProps.type === "number" && "font-mono",
          (inputProps.disabled || inputProps.readonly) && "opacity-20",
          inputProps.class,
        ]}
      />
    </div>
  );
}
