import { defineComponent, HtmlHTMLAttributes, PropType } from "vue";
import BetaWarningBanner from "@/components/BetaWarningBanner";

import AlertBanner from "../AlertBanner";

export default defineComponent({
  name: "Layout",
  props: {
    onScroll: {
      type: Function as PropType<HtmlHTMLAttributes["onScroll"]>,
      default: () => {},
    },
  },
  setup(props, context) {
    return () => (
      <>
        <div
          class="grid h-screen w-full place-items-center overflow-y-scroll bg-gray-800"
          onScroll={props.onScroll}
        >
          {context.slots.default?.()}
          <div id="modal-target" />
          <AlertBanner />
        </div>
        <BetaWarningBanner />
      </>
    );
  },
});
