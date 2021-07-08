import NavIconVue from "@/componentsLegacy/NavSidePanel/NavIcon.vue";
import { SetupContext } from "vue";

export default function PageCard(
  props: {
    navIconId: string;
    heading: string;
  },
  context: SetupContext,
) {
  return (
    <div class="flex-1 flex justify-center pt-[130px]">
      <div class="flex justify-start flex-col items-center bg-black relative w-[50vw] max-w-[800px] min-w-[531px] rounded-[10px] text-white p-4">
        {!!props.heading && (
          <div class="w-full flex-row flex justify-start items-center">
            {!!props.navIconId && (
              <NavIconVue
                icon={props.navIconId}
                class="w-[32px] h-[32px]"
                active
              />
            )}
            <span class="text-accent-base font-sans text-[26px] ml-[10px] font-semibold">
              {props.heading}
            </span>
          </div>
        )}
        <div class="w-full max-h-[calc(100vh - 260px)]">
          {context.slots.default?.()}
        </div>
      </div>
    </div>
  );
}
