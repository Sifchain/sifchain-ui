<script lang="tsx">
import { defineComponent, PropType } from "vue";
import { useLink, useRouter } from "vue-router";
import NavIconVue, { NavIconName } from "./NavIcon.vue";

export default defineComponent({
  components: {
    NavIconVue,
  },
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
        <router-link
          class={`${props.isComingSoon ? "pointer-events-none" : ""}`}
          to={props.routerLink}
        >
          <div
            class={`transition-colors duration-75 ${
              link.isActive.value ? "bg-[#232323] text-accent-base" : ""
            } hover:opacity-80 cursor-pointer rounded-[6px] pr-[12px] mt-[10px] w-full font-sans text-left flex flex-row justify-start font-semibold items-center`}
          >
            <NavIconVue
              class={`transition-all ${
                link.isActive.value ? "fill-current" : ""
              } w-[20px] h-[20px] ml-[8px] inline-block`}
              icon={props.icon}
              active={link.isActive.value}
            />

            <span class="py-[8.5px] pl-[10px] pr-[12px]">
              {props.displayName}
            </span>
            {props.isComingSoon && (
              <div class="ml-auto">
                <span class="my-auto py-[2px] px-[6px] text-[10px] text-info-base border-solid border-[1px] rounded-full border-info-base">
                  Soon
                </span>
              </div>
            )}
          </div>
        </router-link>
      );
    };
  },
});
</script>
