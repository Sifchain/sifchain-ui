import AssetIcon, { IconName } from "@/componentsLegacy/utilities/AssetIcon";

import { SetupContext, Teleport } from "vue";

export type ModalProps = {
  teleportTo?: string;
  onClose: () => void;
  onBack?: () => void;
  class?: string;
  heading: string;
  icon?: IconName;
  showClose?: Boolean;
  showBack?: Boolean;
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
                {props.showBack ? (
                  <button onClick={() => props.onBack?.()} aria-label="Back">
                    <AssetIcon
                      icon="interactive/arrow-down"
                      style={{ transform: "rotate(90deg)" }}
                      class="w-[32px] h-[32px]"
                    />
                  </button>
                ) : props.icon ? (
                  <AssetIcon
                    icon={props.icon}
                    class="w-[32px] h-[32px]"
                    active
                  />
                ) : null}
                <span class="text-accent-base font-sans text-[26px] ml-[10px] font-semibold">
                  {props.heading}
                </span>
              </div>
              <div class="flex items-center">
                {props.showClose && (
                  <button onClick={() => props.onClose()}>
                    <AssetIcon
                      icon="interactive/close"
                      class="w-[14px] h-[14px]"
                    />
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
