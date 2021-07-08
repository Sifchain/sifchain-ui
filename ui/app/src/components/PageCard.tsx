import NavIconVue from "@/componentsLegacy/NavSidePanel/NavIcon.vue";
import { SetupContext } from "vue";

export default function PageCard(
  props: {
    navIconId: string;
    heading: string;
    class?: string;
  },
  context: SetupContext,
) {
  return (
    <div class="py-[130px]">
      <div
        class={`justify-start flex-col items-center bg-black relative w-[50vw] max-w-[800px] min-w-[531px] rounded-[10px] text-white p-4 ${
          props.class || ""
        }`}
      >
        {!!props.heading && (
          <div class="w-full flex-row flex justify-start items-center pb-4">
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
