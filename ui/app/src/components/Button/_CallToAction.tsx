import { ButtonHTMLAttributes, mergeProps, SetupContext } from "vue";
export const _CallToAction = (
  props: ButtonHTMLAttributes,
  ctx: SetupContext,
) => {
  return (
    <button
      {...props}
      class={[
        `w-full uppercase font-extrabold h-[62px] gradient-image-background rounded-[8px] bdg-accent-gradient flex items-center justify-center font-sans text-[18px] text-white disabled:bdg-none disabled:cursor-not-allowed`,
        props.class,
      ]}
      style={
        mergeProps(
          {
            style: {
              textShadow: "0px 1px 1px rgba(0, 0, 0, 0.3)",
              // backgroundImage: `url()`,
              backgroundSize: "cover",
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
