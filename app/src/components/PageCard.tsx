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
import Button from "./Button";

export default defineComponent({
  props: {
    heading: {
      type: Object as PropType<JSX.Element | string>,
      required: false,
    },
    headingClass: {
      type: String,
    },
    headerContent: {
      type: Object as PropType<JSX.Element>,
    },
    withBackButton: {
      type: Boolean,
      default: false,
    },
    breadCrumbs: {
      type: Array as PropType<string[]>,
      required: false,
    },
    headerAction: Object as PropType<Component | JSX.Element>,
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
          "bg-gray-sif800/10 flex h-screen w-full flex-col items-start gap-4",
          props.class,
        ]}
        style={props.style}
      >
        <div class="bg-gray-sif900 flex w-full p-4 md:p-8">
          <div class="mx-auto grid w-full max-w-7xl gap-4">
            <div class="flex items-center gap-4">
              {props.withBackButton && (
                <Button.Inline onClick={() => router.go(-1)}>
                  <AssetIcon
                    icon="interactive/arrow-up"
                    class="-rotate-90"
                    size={24}
                  />
                </Button.Inline>
              )}
              {props.breadCrumbs && (
                <div class="flex flex-1 items-center gap-4">
                  {props.breadCrumbs.map((crumb) => (
                    <span class="text-gray-sif200 last:text-gray-sif50 text-sm font-normal last:font-medium">
                      / {crumb}
                    </span>
                  ))}
                </div>
              )}
              <div class="flex-1">{props.headerContent}</div>
            </div>
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
