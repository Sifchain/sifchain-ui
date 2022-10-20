import AssetIcon from "~/components/AssetIcon";
import { Tooltip, TooltipInstance } from "~/components/Tooltip";
import { defineComponent, PropType, ref } from "vue";

export default defineComponent({
  props: {
    items: {
      type: Array as PropType<
        {
          label: string;
          content: string | JSX.Element;
          onClick?: () => void;
        }[]
      >,
      default: [],
    },
  },
  setup(props) {
    const instanceRef = ref<TooltipInstance>();
    return () => (
      <Tooltip
        onShow={(instance: TooltipInstance) => {
          instanceRef.value = instance;
        }}
        onHide={() => {
          instanceRef.value = undefined;
        }}
        onClickOutside={() => {
          instanceRef.value?.hide();
        }}
        placement="bottom-end"
        interactive
        trigger="click"
        theme="black"
        arrow={false}
        offset={[0, 0]}
        animation="scale"
        content={
          <ul class="border-gray-input_outline rounded-lg border bg-black p-2">
            {props.items.map((item) => (
              <li
                key={item.label}
                class="flex items-center justify-between gap-2"
                role={item.onClick ? "button" : "listitem"}
                onClick={item.onClick}
              >
                {item.content}
              </li>
            ))}
          </ul>
        }
      >
        <button
          class={[
            "text-accent-muted flex items-center px-2 hover:opacity-60",
            instanceRef.value ? "opacity-70" : "",
          ]}
        >
          <AssetIcon size={20} icon="interactive/settings" />
        </button>
      </Tooltip>
    );
  },
});
