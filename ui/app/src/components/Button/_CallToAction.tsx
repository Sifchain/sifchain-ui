import { ButtonHTMLAttributes, mergeProps, SetupContext } from "vue";
export const _CallToAction = (
  props: ButtonHTMLAttributes,
  ctx: SetupContext,
) => {
  return (
    <button
      {...props}
      class={[
        `w-full uppercase font-extrabold h-[62px] bgd-[#bd9632] bg-accent-dadrk  gradient-image-background dbg-accent-gradient rounded-[8px] bdg-accent-gradient flex items-center justify-center font-sans text-[18px] text-white disabled:bdg-none disabled:cursor-not-allowed`,
        props.class,
      ]}
      style={
        mergeProps(
          {
            style: {
              textShadow: "0px 1px 1px rgba(0, 0, 0, 0.3)",
              // backgroundImage: `url()`,
              backgroundSize: "cover",
              boxShadow: `0px 20px 13px -19px #000000`,
              // background: `radial-gradient(100% 6246.1% at 0% 35.48%, #D4B553 0%, #AE7D38 14.55%, #A87433 20.73%, #A97534 24.61%, #C4A547 49.52%, #A97534 81.86%, #A87433 87.43%), radial-gradient(100% 6246.1% at 0% 35.48%, #D4B553 0%, #A87433 20.73%, #C4A547 49.52%, #A87433 87.43%, #D4B553 100%)`,
              // background: `radial-gradient(100% 6246.1% at 0% 35.48%, #CDA937 0%, #AE7D38 14.55%, #A87433 20.73%, #A97534 24.61%, #B29439 49.52%, #A97534 81.86%, #A87433 87.43%), radial-gradient(100% 6246.1% at 0% 35.48%, #D4B553 0%, #A87433 20.73%, #C4A547 49.52%, #A87433 87.43%, #D4B553 100%)`,
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
