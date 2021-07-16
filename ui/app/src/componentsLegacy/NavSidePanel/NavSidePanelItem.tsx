import { defineComponent, PropType, HTMLAttributes, computed } from "vue";
import { useLink, useRouter, RouterLink } from "vue-router";
import AssetIcon, { IconName } from "../utilities/AssetIcon";

export default defineComponent({
  components: {},
  props: {
    displayName: {
      required: true,
      type: String,
    },
    icon: {
      required: true,
      type: String as PropType<IconName>,
    },
    routerLink: {
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
  },
  setup(props) {
    const link = props.routerLink
      ? useLink({
          to: props.routerLink,
        })
      : null;
    let isActive = computed(() => {
      return link?.isActive?.value;
    });

    return () => {
      const Cmp = props.routerLink ? RouterLink : "button";
      return (
        <Cmp
          {...(props.routerLink && {
            to: props.routerLink,
          })}
          class={[
            `flex items-center text-xs h-[32px] mt-[10px] px-[8px] hover:bg-gray-200  transition-colors duration-75 hover:bg-gray-200 cursor-pointer rounded w-full text-left font-semibold whitespace-nowrap`,
            isActive.value && "bg-gray-200 text-accent-base",
            props.class,
          ]}
        >
          <AssetIcon
            class={`transition-all w-[20px] h-[20px] inline-block flex-shrink-0`}
            icon={props.icon}
            active={isActive.value}
          />

          <span class="py-[8.5px] pl-[10px] pr-[12px]">
            {props.displayName}
          </span>
          {!!props.action && props.action}
        </Cmp>
      );
    };
  },
});
