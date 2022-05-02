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

import AssetIcon, { IconName } from "./AssetIcon";
import TokenIcon from "./TokenIcon";

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
          "mx-auto w-full max-w-4xl rounded-2xl bg-black p-4 md:mt-[8vh] md:p-6",
          props.class,
        ]}
        style={props.style}
      >
        <div class="sticky top-0 z-10 grid w-full gap-4 bg-black/90 pb-2">
          {Boolean(props.heading) && (
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                {Boolean(props.iconName) &&
                  (props.iconType === "AssetIcon" ? (
                    <AssetIcon
                      icon={props.iconName as IconName}
                      size={32}
                      active
                    />
                  ) : (
                    <TokenIcon
                      assetValue={props.iconName as IAsset}
                      size={32}
                    />
                  ))}
                <span
                  class={[
                    "text-accent-base font-sans text-xl font-semibold md:text-2xl",
                    props.headingClass,
                  ]}
                >
                  {props.heading}
                </span>
              </div>
              <div class="flex items-center">{props.headerAction}</div>
            </div>
          )}
          <div>{props.headerContent}</div>
        </div>
        <div class="w-full max-w-[calc(100vw-16px)] overflow-x-scroll">
          {context.slots.default?.()}
        </div>
      </div>
    );
  },
});
