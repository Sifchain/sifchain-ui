import { defineComponent } from "@vue/runtime-core";
import { HTMLAttributes } from "@vue/runtime-dom";
import { SetupContext } from "vue";

export function Card(
  props: {
    class: HTMLAttributes["class"];
    heading: string | JSX.Element;
    subheading?: string | JSX.Element;
  },
  ctx: SetupContext,
) {
  return (
    <div
      class={[
        "bg-white bg-opacity-5  px-[20px] py-[10px] rounded flex-1",
        props.class,
      ]}
    >
      <div class="font-lg text-accent-base font-semibold">{props.heading}</div>
      <div class="pt-[4px] text-sm opacity-50">{props.subheading}</div>
      <div class="pt-[7px] whitespace-pre">{ctx.slots?.default?.()}</div>
    </div>
  );
}
