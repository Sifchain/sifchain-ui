import AssetIcon, { IconName } from "@/components/AssetIcon";
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

export default defineComponent({
  props: {
    heading: {
      type: String,
      required: true,
    },
    headerContent: {
      type: Object as PropType<JSX.Element>,
    },
    headerAction: Object as PropType<Component | JSX.Element>,
    iconName: String as PropType<IconName>,
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
    // debugger;
    return () => (
      <div class="block shorter:pt-[90px] pt-[90px] 2xl:pt-[130px] pb-[530px] ">
        <div
          key="view-layer"
          class={[
            `transition-all justify-start flex-col items-center bg-black relative w-[50vw] max-w-[800px] min-w-[531px] rounded-[10px] text-white px-4`,
            props.class,
          ]}
        >
          <div class="sticky top-0 w-full bg-black z-10 pt-4">
            {!!props.heading && (
              <div class="w-full flex-row flex justify-between items-center pb-[10px]">
                <div class="flex items-center">
                  {!!props.iconName && (
                    <AssetIcon icon={props.iconName} size={32} active />
                  )}
                  <span class="text-accent-base font-sans text-[26px] ml-[10px] font-semibold">
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
