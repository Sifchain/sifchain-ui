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
          class="grid w-full place-items-center bg-gray-800"
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
