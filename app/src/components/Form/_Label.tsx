import { defineComponent, HTMLAttributes } from "vue";

export const _Label = defineComponent({
  inheritAttrs: false,
  setup(props: HTMLAttributes, ctx) {
    return () => (
      <div
        {...ctx.attrs}
        class={[
          `text-md text-left font-sans font-medium text-white`,
          props.class,
        ]}
      >
        {ctx.slots?.default?.()}
      </div>
    );
  },
});
