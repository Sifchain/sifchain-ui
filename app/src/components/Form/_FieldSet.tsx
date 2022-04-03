import { defineComponent, HTMLAttributes } from "vue";

export const _FieldSet = defineComponent({
  inheritAttrs: false,
  setup(props: HTMLAttributes, ctx) {
    return () => (
      <div
        {...ctx.attrs}
        class={[
          `bg-gray-base flex w-full flex-col rounded-[10px] p-[20px]`,
          ctx.attrs.class,
        ]}
      >
        {ctx.slots?.default?.()}
      </div>
    );
  },
});
