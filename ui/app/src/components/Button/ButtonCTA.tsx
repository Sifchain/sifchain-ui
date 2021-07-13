import { ButtonHTMLAttributes, SetupContext } from "vue";

export const ButtonCTA = (props: ButtonHTMLAttributes, ctx: SetupContext) => {
  return (
    <button
      {...props}
      class={[
        `w-full h-[62px] rounded-[4px] bg-accent-gradient flex items-center justify-center font-sans text-[18px] font-semibold text-white`,
        props.class,
      ]}
    >
      {ctx.slots.default?.()}
    </button>
  );
};
