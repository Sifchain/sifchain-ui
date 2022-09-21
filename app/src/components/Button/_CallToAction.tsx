import { ButtonHTMLAttributes, mergeProps, SetupContext } from "vue";

export const _CallToAction = (
  props: ButtonHTMLAttributes,
  ctx: SetupContext,
) => {
  return (
    <button
      {...props}
      class={[
        `bg-accent-gradient disabled:bg-gray-disabled flex h-[62px] w-full items-center justify-center rounded-[4px] font-sans text-[18px] font-semibold text-white disabled:bg-none disabled:text-gray-800`,
        props.class,
      ]}
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
};
