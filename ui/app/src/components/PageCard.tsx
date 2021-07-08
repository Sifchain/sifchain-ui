import AssetIconVue, { IconName } from "@/componentsLegacy/utilities/AssetIcon";
import { SetupContext } from "vue";

export type PageCardProps = {
  iconName?: IconName;
  heading: string;
  class?: string;
};

export default function PageCard(props: PageCardProps, context: SetupContext) {
  return (
    <div class="py-[130px]">
      <div
        class={`justify-start flex-col items-center bg-black relative w-[50vw] max-w-[800px] min-w-[531px] rounded-[10px] text-white p-4 ${
          props.class || ""
        }`}
      >
        {!!props.heading && (
          <div class="w-full flex-row flex justify-between items-center pb-4">
            <div class="flex items-center">
              {!!props.iconName && (
                <AssetIconVue
                  icon={props.iconName}
                  class="w-[32px] h-[32px]"
                  active
                />
              )}
              <span class="text-accent-base font-sans text-[26px] ml-[10px] font-semibold">
                {props.heading}
              </span>
            </div>
            <div class="flex items-center">
              {context.slots.headerAction?.()}
            </div>
          </div>
        )}
        <div class="w-full max-h-[calc(100vh - 260px)]">
          {context.slots.default?.()}
        </div>
      </div>
    </div>
  );
}
