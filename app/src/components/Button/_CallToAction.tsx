import clsx from "clsx";
import { ButtonHTMLAttributes, mergeProps, SetupContext } from "vue";

export const _CallToAction = (
  props: ButtonHTMLAttributes,
  ctx: SetupContext,
) => (
  <button
    {...props}
    disabled={props.disabled}
    class={clsx([
      `disabled:bg-gray-sif300 disabled:text-gray-sif600 flex h-11 w-full items-center justify-center 
       rounded px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed
       md:h-12 md:text-base`,
      {
        "bg-gray-sif100 text-gray-sif900": !props.disabled,
      },
      props.class,
    ])}
    style={
      mergeProps(
        {
          style: {
            textShadow: "0px 1px 1px rgba(0, 0, 0, 0.3)",
          },
        },
        { style: props.style },
      ).style as ButtonHTMLAttributes["style"]
    }
  >
    {ctx.slots.default?.()}
  </button>
);
