import AssetIcon, { IconName } from "@/componentsLegacy/utilities/AssetIcon";

import { Component, SetupContext, Teleport } from "vue";

export type ModalProps = {
  teleportTo?: string;
  onClose?: () => void;
  onBack?: () => void;
  class?: string;
  heading: any;
  icon?: IconName;
  showClose?: Boolean;
  showBack?: Boolean;
  headingAction?: any;
};

export default function Modal(props: ModalProps, context: SetupContext) {
  return (
    <Teleport to={props.teleportTo || "#app"}>
      <div
        class="fixed bg-white opacity-30 z-[1] inset-0 left-sidebar"
        onClick={props.onClose}
      />
      <div
        class="absolute inset-0 left-sidebar flex items-center justify-center z-10"
        onClick={() => props.onClose?.()}
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
                {props.showBack ? (
                  <button onClick={() => props.onBack?.()} aria-label="Back">
                    <AssetIcon
                      icon="interactive/arrow-down"
                      style={{ transform: "rotate(90deg)" }}
                      size={32}
                    />
                  </button>
                ) : props.icon ? (
                  <AssetIcon icon={props.icon} active size={32} />
                ) : null}
                <span class="text-accent-base font-sans text-[26px] ml-[10px] font-medium">
                  {props.heading}
                </span>
              </div>
              <div>{props.headingAction}</div>
              <div class="flex items-center">
                {props.showClose && (
                  <button onClick={() => props.onClose?.()}>
                    <AssetIcon icon="interactive/close" size={24} />
                  </button>
                )}
              </div>
            </div>
          )}
          <div class="w-full">{context.slots.default?.()}</div>
        </div>
      </div>
    </Teleport>
  );
}
