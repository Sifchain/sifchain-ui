import { defineComponent, HTMLAttributes } from "vue";

export const _Label = defineComponent({
  inheritAttrs: false,
  setup(props: HTMLAttributes, ctx) {
    return () => (
      <div
        {...ctx.attrs}
        class={[
          `text-sm text-[#919191] font-sans font-medium capitalize`,
          props.class,
        ]}
      >
        {ctx.slots?.default?.()}
      </div>
    );
  },
});
