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
    withOverflowSpace: {
      type: Boolean,
    },
  },
  setup: function PageCard(props, context: SetupContext) {
    const router = useRouter();
    const initialRoute = ref("");
    onMounted(() => {
      initialRoute.value = router.currentRoute.value.path;
    });

    return () => (
      <div class="absolute md:top-[90px] 2xl:top-[130px]">
        <div
          key="view-layer"
          class={[
            "relative max-w-4xl flex-col items-center justify-start md:rounded-lg",
            "bg-black p-4 pt-0 text-white shadow-2xl transition-all",
            props.class,
          ]}
          style={props.style}
        >
          <div class="sticky top-0 z-10 w-full bg-black pt-2">
            {!!props.heading && (
              <div class="flex w-full flex-row items-center justify-between pb-[10px]">
                <div class="flex items-center">
                  {!!props.iconName &&
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
                      "text-accent-base ml-[10px] font-sans text-[26px] font-semibold",
                      props.headingClass,
                    ]}
                  >
                    {props.heading}
                  </span>
                </div>
                <div class="flex items-center">{props.headerAction}</div>
              </div>
            )}
            {props.headerContent}
          </div>
          <div class="w-full">{context.slots.default?.()}</div>
        </div>
        {props.withOverflowSpace && <div class="h-[90px] 2xl:h-[130px]" />}
      </div>
    );
  },
});
