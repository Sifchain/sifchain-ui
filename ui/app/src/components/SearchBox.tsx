import {
  defineComponent,
  HTMLAttributes,
  InputHTMLAttributes,
  PropType,
} from "vue";
import AssetIcon from "./AssetIcon";

export function SearchBox(
  props: InputHTMLAttributes & {
    containerClass?: HTMLAttributes["class"];
    containerProps?: HTMLAttributes;
  },
) {
  const { containerClass, containerProps, ...inputProps } = props;
  return (
    <div
      {...containerProps}
      class={[
        "bg-gray-input h-8 relative flex items-center rounded-lg overflow-hidden focus-within:border-white rounded border border-solid border-gray-input_outline",
        containerProps?.class,
        containerClass,
      ]}
    >
      <AssetIcon
        size={20}
        icon="interactive/search"
        class={[`ml-3 w-4 h-4`, props.disabled ? "text-[#6E6E6E]" : ""]}
      />
      <input
        type="search"
        {...props}
        class={[
          "box-border w-full absolute top-0 bottom-0 left-0 right-0 pl-8 pr-3 h-full bg-transparent outline-none text-white font-sans font-medium text-md",
          props.class,
        ]}
      />
    </div>
  );
}
