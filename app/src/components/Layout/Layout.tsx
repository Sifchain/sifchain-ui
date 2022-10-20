import { defineComponent, HtmlHTMLAttributes, PropType } from "vue";

import BetaWarningBanner from "~/components/BetaWarningBanner";

import LayoutBackground from "./LayoutBackground";
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
          class="left-sidebar bg-gray-background absolute top-0 right-0 bottom-0 flex justify-center overflow-y-scroll bg-black bg-opacity-40 sm:left-0"
          onScroll={props.onScroll as HtmlHTMLAttributes["onScroll"]}
        >
          {context.slots.default?.()}
          <div id="modal-target" />
          <AlertBanner />
        </div>
        <BetaWarningBanner />
        <LayoutBackground />
      </>
    );
  },
});
