import { defineComponent, HTMLAttributes } from "vue";

export const _FieldSet = defineComponent({
  inheritAttrs: false,
  setup(props: HTMLAttributes, ctx) {
    return () => (
      <div
        {...ctx.attrs}
        class={[
          `w-full flex flex-col bg-gray-base p-[20px] rounded-[10px]`,
          ctx.attrs.class,
        ]}
      >
        {ctx.slots?.default?.()}
      </div>
    );
  },
});
