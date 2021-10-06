import {
  defineComponent,
  PropType,
  SetupContext,
  Teleport,
  HTMLAttributes,
  onMounted,
  onUnmounted,
  onBeforeUnmount,
} from "vue";
import AssetIcon, { IconName } from "@/components/AssetIcon";

export type ModalProps = {
  onClose: () => void;
  showClose?: boolean;
  class?: HTMLAttributes["class"];
  heading?: string;
  icon?: IconName;
  escapeToClose?: boolean;
  headingAction?: any;
  backdropClickToClose?: boolean;
};

export default defineComponent({
  props: {
    onClose: {
      type: Function as PropType<ModalProps["onClose"]>,
      required: true,
    },
    showClose: {
      type: Boolean as PropType<ModalProps["showClose"]>,
    },
    class: {
      type: [String, Object, Array] as PropType<ModalProps["class"]>,
    },
    heading: {
      type: String as PropType<ModalProps["heading"]>,
    },
    headingAction: {
      type: [String, Object, Number, Array, Boolean] as PropType<
        ModalProps["headingAction"]
      >,
      required: false,
    },
    icon: {
      type: String as PropType<ModalProps["icon"]>,
    },
    escapeToClose: {
      type: Boolean as PropType<ModalProps["escapeToClose"]>,
      default: () => true,
    },
    backdropClickToClose: {
      type: Boolean as PropType<ModalProps["backdropClickToClose"]>,
      default: () => true,
    },
  },
  name: "Modal",
  setup(props, context: SetupContext) {
    const onKeypress = (ev: KeyboardEvent) => {
      if (ev.key === "Escape" && props.onClose && props.escapeToClose) {
        props.onClose();
      }
    };
    onMounted(() => {
      // document.body.style.setProperty("height", "100vh");
      // document.body.style.setProperty("overflow", "hidden");
      document.body.addEventListener("keydown", onKeypress);
    });
    onUnmounted(() => {
      document.body.removeEventListener("keydown", onKeypress);
    });
    return () => (
      <div class="fixed inset-0 z-20">
        <div class="overflow-hidden fixed h-screen bg-white bg-opacity-25 z-20 inset-0 animate-fade-in duration-300" />
        <div
          class={[
            "overflow-y-scroll h-screen fixed left-sidebar sm:left-0 inset-0 flex items-center shorter:items-start shorter:py-[4vh] justify-center z-20 animate-fade-in duration-500 animate-fade-in-up",
          ]}
          onClick={() => {
            if (props.backdropClickToClose) props.onClose?.();
          }}
        >
          <div
            class={`justify-start flex-col items-center bg-black relative w-[530px] rounded-[10px] text-white p-4 ${
              props.class || ""
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {!!props.heading && (
              <div class="w-full flex-row flex justify-between items-center pb-4">
                <div class="flex items-center">
                  {props.icon ? (
                    <AssetIcon icon={props.icon} active size={32} />
                  ) : null}
                  <span class="text-accent-base font-sans text-[26px] ml-[10px] font-semibold">
                    {props.heading}
                  </span>
                </div>
                <div>{props.headingAction}</div>

                <div class="flex items-center">
                  {props.showClose && (
                    <button onClick={() => props.onClose?.()}>
                      <AssetIcon icon="interactive/close" size={24} />
                    </button>
                  )}
                </div>
              </div>
            )}
            <div class="w-full">{context.slots.default?.()}</div>
          </div>
        </div>
      </div>
    );
  },
});
