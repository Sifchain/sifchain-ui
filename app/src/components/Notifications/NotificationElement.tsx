import {
  defineComponent,
  onMounted,
  onUnmounted,
  PropType,
  computed,
  ref,
} from "vue";
import AssetIcon, { IconName } from "~/components/AssetIcon";
import { INotification } from "./INotification";

const notificationData = {
  error: {
    class: "text-danger-base",
    icon: "interactive/warning",
  },
  info: {
    class: "text-white",
    icon: "interactive/flag",
  },
  success: {
    class: "text-connected-base",
    icon: "interactive/check",
  },
};

export const NotificationElement = defineComponent({
  name: "NotificationElement",
  props: {
    notification: { type: Object as PropType<INotification>, required: true },
    index: { type: Number, required: true },
    onRemove: {
      type: Function as PropType<(index: number) => void>,
      required: true,
    },
  },
  setup(props) {
    const data = notificationData[props.notification.type];

    const transitionState = ref<"in" | "out">("out");
    const TRANSITION_DURATION = 125;

    let transitionTimeoutId: NodeJS.Timeout;
    let autoCloseTimeoutId: NodeJS.Timeout;

    const removeRef = computed(() => {
      const index = props.index;
      return () => {
        clearTimeout(transitionTimeoutId);
        transitionState.value = "out";
        transitionTimeoutId = setTimeout(() => {
          props.onRemove(index);
        }, TRANSITION_DURATION);
      };
    });

    onMounted(() => {
      if (!props.notification.manualClose) {
        autoCloseTimeoutId = setTimeout(() => {
          removeRef.value();
        }, 15 * 1000);
      }

      transitionTimeoutId = setTimeout(() => {
        transitionState.value = "in";
      }, 50);
    });

    onUnmounted(() => {
      clearTimeout(autoCloseTimeoutId);
      clearTimeout(transitionTimeoutId);
    });

    return () => (
      <div
        onClick={() => {
          props.notification?.onAction?.();
          removeRef.value();
        }}
        class={[
          "text-md absolute bottom-0 right-0 flex h-[40px] cursor-pointer items-center whitespace-nowrap rounded-lg bg-black px-[10px] tracking-[-0.025em] drop-shadow-lg",
          props.notification?.onAction && "cursor-pointer",
          data.class,
        ]}
        style={{
          transition: `${TRANSITION_DURATION}ms ease-in`,
          transform: [
            `translateX(${
              transitionState.value === "in" ? "calc(0% - 40px)" : "100%"
            })`,
            `translateY(-${20 + props.index * 32 + (1 + props.index) * 16}px)`,
          ].join(" "),
        }}
      >
        <AssetIcon
          icon={
            props.notification.loader
              ? "interactive/anim-racetrack-spinner"
              : (data.icon as IconName)
          }
          size={20}
          class="mr-[6px] flex-shrink-0"
        />
        {props.notification.message}
        {!!props.notification.manualClose && (
          <>
            <div class="flex-1" />
            <button
              onClick={(ev) => {
                removeRef.value();
                ev.stopPropagation();
              }}
              class="hover:bg-gray-action_button ml-[8px] cursor-pointer rounded-sm p-[2px] text-white"
            >
              <AssetIcon
                icon="interactive/close"
                class="opacity-50"
                size={20}
              />
            </button>
          </>
        )}
      </div>
    );
  },
});
