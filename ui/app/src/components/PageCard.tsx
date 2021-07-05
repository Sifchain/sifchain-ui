import NavIconVue from "@/componentsLegacy/NavSidePanel/NavIcon.vue";
import { SetupContext } from 'vue'

export default function PageCard(props: {
    navIconId: string;
    heading: string;
  }, context: SetupContext) {
    return (
      <div class="flex justify-start flex-col items-center bg-black relative right-0 left-[560px] w-[531px] rounded-[10px] p-[20px]">
        {!!props.heading && <div class="h-[42px] w-full flex-row flex justify-start items-center">
          {!!props.navIconId && <NavIconVue icon={props.navIconId} class="w-[32px] h-[32px]" active />}
          <span class="text-accent-base font-sans text-[26px] ml-[10px] font-semibold">
            {props.heading}
          </span>
        </div>}
        {context.slots.default?.()}
      </div>
    )
  }
