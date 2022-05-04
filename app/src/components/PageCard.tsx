import { IAsset } from "@sifchain/sdk";
import {
  Component,
  defineComponent,
  HTMLAttributes,
  PropType,
  SetupContext,
  onMounted,
  ref,
  StyleValue,
} from "vue";
import { useRouter } from "vue-router";

import { IconName } from "./AssetIcon";

export default defineComponent({
  props: {
    heading: {
      type: Object as PropType<JSX.Element | string>,
      required: true,
    },
    headingClass: {
      type: String,
    },
    headerContent: {
      type: Object as PropType<JSX.Element>,
    },
    headerAction: Object as PropType<Component | JSX.Element>,
    iconName: String as PropType<IconName | IAsset>,
    iconType: {
      type: String as PropType<"AssetIcon" | "TokenIcon">,
      default: "AssetIcon",
    },
    class: String as PropType<HTMLAttributes["class"]>,
    style: Object as PropType<StyleValue>,
  },
  setup: function PageCard(props, context: SetupContext) {
    const router = useRouter();
    const initialRoute = ref("");

    onMounted(() => {
      initialRoute.value = router.currentRoute.value.path;
    });

    return () => (
      <div
        class={[
          "bg-gray-sif_800/10 flex h-screen w-full flex-col items-start gap-4",
          props.class,
        ]}
        style={props.style}
      >
        <div class="bg-gray-sif_900 w-full p-4 md:p-8">
          <div class="mx-auto grid w-full max-w-7xl gap-4">
            {Boolean(props.heading) && (
              <div class="bg-gray-sif_900 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span
                    class={[
                      "text-accent-base font-sans text-lg font-semibold md:text-xl",
                      props.headingClass,
                    ]}
                  >
                    / {props.heading}
                  </span>
                </div>
                <div class="flex items-center">{props.headerAction}</div>
              </div>
            )}
            <div>{props.headerContent}</div>
          </div>
        </div>
        <div class="w-full flex-1 overflow-x-scroll p-4 md:p-8">
          <div class="mx-auto w-full max-w-7xl">
            {context.slots.default?.()}
          </div>
        </div>
      </div>
    );
  },
});
