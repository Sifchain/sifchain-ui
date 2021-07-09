import AssetIcon, { IconName } from "@/componentsLegacy/utilities/AssetIcon";
import {
  Component,
  defineComponent,
  HTMLAttributes,
  PropType,
  SetupContext,
} from "vue";

export default defineComponent({
  props: {
    heading: {
      type: String,
      required: true,
    },
    headerAction: Object as PropType<Component>,
    iconName: String as PropType<IconName>,
    class: String as PropType<HTMLAttributes["class"]>,
  },
  setup: function PageCard(props, context: SetupContext) {
    // debugger;
    return () => (
      <div class="py-[130px]">
        <div
          class={[
            `justify-start flex-col items-center bg-black relative w-[50vw] max-w-[800px] min-w-[531px] rounded-[10px] text-white p-4`,
            props.class,
          ]}
        >
          {!!props.heading && (
            <div class="w-full flex-row flex justify-between items-center pb-4">
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
          <div class="w-full max-h-[calc(100vh - 260px)]">
            {context.slots.default?.()}
          </div>
        </div>
      </div>
    );
  },
});
