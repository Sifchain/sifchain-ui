import clsx from "clsx";
import { defineComponent, PropType, HTMLAttributes, computed } from "vue";
import { useLink, RouterLink } from "vue-router";
import { MARGIN_FE_URL } from "~/store/modules/flags";
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
    nonInteractable: {
      type: Boolean,
      default: false,
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
            `group mt-[10px] flex h-[32px] w-full items-center whitespace-nowrap rounded px-[8px] text-left text-sm font-semibold transition-colors duration-75 hover:bg-gray-200`,
            isActive.value && "text-accent-base bg-gray-200",
            props.nonInteractable ? "pointer-events-none" : "cursor-pointer",
            props.class,
          ]}
        >
          <AssetIcon
            class={`inline-block h-[20px] w-[20px] flex-shrink-0 transition-all`}
            icon={props.icon}
            active={isActive.value}
          />

          <span
            class={clsx("py-[8.5px] px-2.5", {
              "flex w-full justify-between pr-0": isExternal.value,
            })}
          >
            {props.displayName}

            {isExternal.value && (
              <AssetIcon
                icon="interactive/open-external"
                size={16}
                class="opacity-0 transition-opacity group-hover:opacity-100"
              />
            )}
          </span>
          {!!props.action && props.action}
        </Cmp.value>
      );
    };
  },
});
