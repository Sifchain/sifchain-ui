import { defineComponent, PropType, HTMLAttributes, computed } from "vue";
import { useLink, RouterLink } from "vue-router";
import AssetIcon, { IconName } from "../AssetIcon";

export default defineComponent({
  components: {},
  props: {
    displayName: {
      required: true,
      type: String as PropType<string | JSX.Element>,
    },
    icon: {
      required: true,
      type: String as PropType<IconName>,
    },
    href: {
      type: String,
    },
    isComingSoon: {
      required: false,
      type: Boolean,
    },
    action: {
      required: false,
      type: Object as PropType<JSX.Element>,
    },
    class: {
      type: [String, Object, Array] as HTMLAttributes["class"],
    },
    onClick: {
      type: Function as PropType<() => void>,
    },
  },
  setup(props) {
    const isExternal = computed(() => props.href?.startsWith("http"));
    const Cmp = computed(() => {
      return !props.href ? "button" : isExternal.value ? "a" : RouterLink;
    });
    const linkRef =
      props.href && !isExternal.value
        ? useLink({
            to: props.href,
          })
        : null;
    const isActive = computed(() => {
      return !isExternal.value && linkRef?.isActive?.value;
    });

    return () => {
      return (
        <Cmp.value
          {...(isExternal.value && {
            href: props.href,
            rel: "noopener noreferrer",
            target: "_blank",
          })}
          {...(Cmp.value === RouterLink && {
            to: props.href,
          })}
          {...(props.onClick && { onClick: props.onClick })}
          class={[
            `flex items-center text-sm h-[32px] mt-[10px] px-[8px] hover:bg-gray-200  transition-colors duration-75 hover:bg-gray-200 cursor-pointer rounded w-full text-left font-semibold whitespace-nowrap`,
            isActive.value && "bg-gray-200 text-accent-base",
            props.class,
          ]}
        >
          <AssetIcon
            class={`transition-all w-[20px] h-[20px] inline-block flex-shrink-0`}
            icon={props.icon}
            active={isActive.value}
          />

          <span class="py-[8.5px] px-[10px]">{props.displayName}</span>
          {!!props.action && props.action}
        </Cmp.value>
      );
    };
  },
});
