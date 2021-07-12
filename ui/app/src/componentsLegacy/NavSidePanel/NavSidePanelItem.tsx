import { defineComponent, PropType } from "vue";
import { useLink, useRouter, RouterLink } from "vue-router";
import AssetIcon, { IconName, NavIconName } from "../utilities/AssetIcon";

export default defineComponent({
  components: {},
  props: {
    displayName: {
      required: true,
      type: String,
    },
    icon: {
      required: true,
      type: String as PropType<NavIconName>,
    },
    routerLink: {
      required: true,
      type: String,
    },
    isComingSoon: {
      required: false,
      type: Boolean,
    },
  },
  setup(props) {
    const link = useLink({
      to: props.routerLink,
    });

    return () => {
      return (
        <RouterLink
          class={
            props.isComingSoon &&
            "pointer-events-none flex items-center justify-between"
          }
          to={props.routerLink}
        >
          <div
            class={`transition-colors duration-75 ${
              link.isActive.value ? "bg-[#232323] text-accent-base" : ""
            } hover:opacity-80 cursor-pointer rounded-[6px] pr-[12px] mt-[10px] w-full font-sans text-left flex flex-row justify-start font-semibold items-center`}
          >
            <AssetIcon
              class={`transition-all w-[20px] h-[20px] ml-[8px] inline-block flex-shrink-0`}
              icon={`navigation/${props.icon}` as IconName}
              active={link.isActive.value}
            />

            <span class="py-[8.5px] pl-[10px] pr-[12px]">
              {props.displayName}
            </span>
            {props.isComingSoon && (
              <span class="py-[2px] px-[6px] text-[10px] text-info-base border-solid border-[1px] rounded-full border-info-base">
                Soon
              </span>
            )}
          </div>
        </RouterLink>
      );
    };
  },
});
