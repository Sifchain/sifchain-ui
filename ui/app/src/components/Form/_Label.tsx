import { defineComponent, HTMLAttributes } from "vue";

export const _Label = defineComponent({
  inheritAttrs: false,
  setup(props: HTMLAttributes, ctx) {
    return () => (
      <div
        {...ctx.attrs}
        class={[
          `text-md text-white font-sans text-left font-medium`,
          props.class,
        ]}
      >
        {ctx.slots?.default?.()}
      </div>
    );
  },
});
