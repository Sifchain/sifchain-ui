import AssetIcon, { IconName } from "@/components/AssetIcon";
import { IAsset } from "@sifchain/sdk";
import {
  VNode,
  Component,
  defineComponent,
  HTMLAttributes,
  PropType,
  SetupContext,
  Transition,
  onMounted,
  ref,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { TokenIcon } from "./TokenIcon";
/*

*/
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
      <div class="block shorter:pt-[90px] pt-[90px] 2xl:pt-[130px] pb-[530px]">
        <div
          key="view-layer"
          class={[
            `shadow-2xl transition-all justify-start flex-col items-center bg-black relative w-[50vw] max-w-[890px] min-w-[531px] text-white px-7 rounded-[20px]`,
            props.class,
          ]}
          style={{
            boxShadow: `0px 10px 55px #000000`,
          }}
        >
          <div class="sticky top-0 w-full bg-black z-10 pt-4">
            {!!props.heading && (
              <div class="w-full flex-row flex justify-between items-center pb-[10px]">
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
                      "text-accent-base font-sans text-[26px] font-semibold",
                      props.iconName && "ml-[10px]",
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
