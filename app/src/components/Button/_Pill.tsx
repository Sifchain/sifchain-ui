import { ButtonHTMLAttributes, SetupContext } from "vue";
export function _Pill(props: ButtonHTMLAttributes, ctx: SetupContext) {
  return (
    <button
      {...props}
      class={[
        "border-accent-base text-accent-dark hover:bg-accent-base z-[1] flex h-[20px] cursor-pointer items-center justify-center rounded-lg border border-solid px-[10px] pt-[1px] text-sm font-semibold tracking-[-0.01em] hover:text-gray-300",
        props.class,
      ]}
    >
      {ctx.slots.default?.()}
    </button>
  );
}
