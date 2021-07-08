import cx from "clsx";
import { VNode } from "@vue/runtime-core";
import AssetIconVue, {
  IconName,
} from "@/componentsLegacy/utilities/AssetIcon.vue";

export type InputProps = {
  containerProps?: {
    [rest: string]: any;
  };
  iconName?: IconName;
  [rest: string]: any;
};
export default function Input(props: InputProps) {
  const { iconName, containerProps, ...rest } = props;
  return (
    <div
      {...containerProps}
      class={cx(
        "w-full bg-darkfill-input h-8 relative flex items-center rounded-lg overflow-hidden border-black border-opacity-20",
        containerProps?.class,
      )}
    >
      {!!iconName && <AssetIconVue icon={iconName} class="ml-3 w-4 h-4" />}
      <input
        {...rest}
        class={cx(
          "box-border w-full absolute top-0 bottom-0 left-0 right-0 px-3 h-full bg-transparent outline-none text-white font-sans font-medium",
          !!iconName && "pl-8",
        )}
      />
    </div>
  );
}
