import AssetIconVue, {
  IconName,
} from "@/componentsLegacy/utilities/AssetIcon.vue";

import { SetupContext, Teleport } from "vue";
import PageCard, { PageCardProps } from "./PageCard";

export type ModalProps = {
  teleportTo?: string;
  onClose: () => void;
  class?: string;
  heading: string;
  iconName: IconName;
};

export default function Modal(props: ModalProps, context: SetupContext) {
  return (
    <Teleport to={props.teleportTo || "body"}>
      <div class="absolute bg-white opacity-30 z-[1] inset-0 left-sidebar" />
      <div
        class="absolute inset-0 left-sidebar flex items-center justify-center z-10"
        onClick={() => props.onClose()}
      >
        <div
          class={`justify-start flex-col items-center bg-black relative w-[530px] rounded-[10px] text-white p-4 ${
            props.class || ""
          }`}
          onClick={(e) => e.stopPropagation()}
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
                <button onClick={() => props.onClose()}>
                  <AssetIconVue
                    icon="interactive/close"
                    class="w-[14px] h-[14px]"
                  />
                </button>
              </div>
            </div>
          )}
          <div class="w-full">{context.slots.default?.()}</div>
        </div>
      </div>
    </Teleport>
  );
}
