import {
  defineComponent,
  onMounted,
  onUnmounted,
  PropType,
  computed,
} from "vue";
import AssetIcon, { IconName } from "@/components/AssetIcon";
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

    const removeRef = computed(() => {
      const index = props.index;
      return () => props.onRemove(index);
    });

    let timeoutId: NodeJS.Timeout;
    onMounted(() => {
      if (props.notification.manualClose) return;
      timeoutId = setTimeout(() => {
        removeRef.value();
      }, 10 * 1000);
    });
    onUnmounted(() => clearTimeout(timeoutId));

    return () => (
      <div
        onClick={() => {
          props.notification?.onAction?.();
          removeRef.value();
        }}
        class={[
          "h-[40px] flex px-[10px] bg-black drop-shadow-lg mb-[16px] rounded-lg relative cursor-pointer text-md items-center tracking-[-0.025em]",
          props.notification?.onAction && "cursor-pointer",
          data.class,
        ]}
      >
        <AssetIcon
          icon={
            props.notification.loader
              ? "interactive/anim-racetrack-spinner"
              : (data.icon as IconName)
          }
          size={20}
          class="mr-[6px]"
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
              class="text-white p-[2px] ml-[8px] hover:bg-gray-action_button cursor-pointer rounded-sm"
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
