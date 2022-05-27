import { defineComponent, HtmlHTMLAttributes, PropType } from "vue";
// import BetaWarningBanner from "@/components/BetaWarningBanner";

import AlertBanner from "../AlertBanner";
import NavSidePanel from "../NavSidePanel";

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
          class="dark:bg-gray-sif900/60 flex min-h-screen w-full subpixel-antialiased dark:text-slate-100"
          onScroll={props.onScroll}
        >
          <NavSidePanel />
          <section class="grid w-full flex-1 flex-col">
            {context.slots.default?.()}
          </section>
          <div id="modal-target" />
          <AlertBanner />
        </div>
        {/* <BetaWarningBanner /> */}
      </>
    );
  },
});
