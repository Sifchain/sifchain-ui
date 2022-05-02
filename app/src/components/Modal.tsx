import {
  defineComponent,
  PropType,
  SetupContext,
  HTMLAttributes,
  onMounted,
  onUnmounted,
} from "vue";
import AssetIcon, { IconName } from "@/components/AssetIcon";

export type ModalProps = {
  onClose: () => void;
  showClose?: boolean;
  class?: HTMLAttributes["class"];
  containerClass?: HTMLAttributes["class"];
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
    containerClass: {
      type: [String, Object, Array] as PropType<ModalProps["containerClass"]>,
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
      document.body.addEventListener("keydown", onKeypress);
    });
    onUnmounted(() => {
      document.body.removeEventListener("keydown", onKeypress);
    });
    return () => (
      <div class="fixed inset-0 z-20">
        <div class="animate-fade-in fixed inset-0 z-20 h-screen overflow-hidden bg-slate-800/25 backdrop-blur-sm duration-300" />
        <div
          class={[
            "shorter:py-[4vh] animate-fade-in animate-fade-in-up fixed inset-0 z-20",
            "flex h-screen items-center justify-center overflow-y-scroll duration-500",
            props.containerClass,
          ]}
          onClick={() => {
            if (props.backdropClickToClose) props.onClose?.();
          }}
        >
          <div
            class={[
              "relative grid w-full max-w-xl items-center",
              "rounded-lg bg-black p-6 text-white md:left-[140px]",
              props.class,
            ]}
            onClick={(e) => e.stopPropagation()}
          >
            {Boolean(props.heading) && (
              <div class="flex w-full items-center justify-between pb-4">
                <div class="flex items-center">
                  {props.icon ? (
                    <AssetIcon icon={props.icon} active size={32} />
                  ) : null}
                  <span class="text-accent-base ml-2 font-sans text-[26px] font-semibold">
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
