import { HTMLAttributes, InputHTMLAttributes, Ref } from "vue";

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
  return (
    <div
      {...containerProps}
      class={[
        "bg-gray-input border-gray-input_outline relative flex h-[54px] items-center rounded border border-solid border-solid px-3 focus-within:border-white",
        containerProps?.class,
        containerClass,
      ]}
    >
      {startContent}
      <input
        ref={inputRef}
        {...inputProps}
        class={[
          "absolute top-0 bottom-0 left-0 right-0 box-border h-full w-full bg-transparent px-[16px] font-sans text-[20px] font-medium text-white outline-none outline-none",
          !!props.startContent && "pl-[68px]",
          inputProps.type === "number" && "font-mono",
          (inputProps.disabled || inputProps.readonly) && "opacity-20",
          inputProps.class,
        ]}
      />
    </div>
  );
}
