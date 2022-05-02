import { defineComponent, HtmlHTMLAttributes, PropType } from "vue";
import BetaWarningBanner from "@/components/BetaWarningBanner";

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
          class="flex min-h-screen w-full bg-slate-100 subpixel-antialiased dark:bg-slate-900/95 dark:text-slate-100"
          onScroll={props.onScroll}
        >
          <NavSidePanel />
          <section class="flex h-screen w-full flex-1 flex-col overflow-y-scroll">
            {context.slots.default?.()}
          </section>
          <div id="modal-target" />
          <AlertBanner />
        </div>
        <BetaWarningBanner />
      </>
    );
  },
});
