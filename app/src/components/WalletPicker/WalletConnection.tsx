import { defineComponent, PropType, ref } from "vue";

import { shortenHash } from "~/components/utils";
import AssetIcon from "~/components/AssetIcon";
import Tooltip, { TooltipInstance } from "~/components/Tooltip";
import { accountStore } from "~/store/modules/accounts";
import { useCore } from "~/hooks/useCore";

import { WalletConnection } from "./constants";
import WalletConnectionDropdown from "./WalletConnectionDropdown";
import { TokenIcon } from "../TokenIcon";

export default defineComponent({
  name: "WalletConnection",
  props: {
    connection: {
      type: Object as PropType<WalletConnection>,
      required: true,
    },
  },
  setup(props) {
    const stateRef =
      accountStore.refs[props.connection.getChain().network].computed();
    const instanceRef = ref<TooltipInstance>();

    const handleClick = async () => {
      if (stateRef.value.connected) return;
      try {
        await props.connection.connect();
      } catch (error) {
        useCore().services.bus.dispatch({
          type: "ErrorEvent",
          payload: {
            message: "Wallet Connect Error: " + (error as Error).message,
          },
        });
      }
    };

    return () => (
      <div class="mt-[6px] first:mt-0">
        <Tooltip
          onShow={(instance: TooltipInstance) => {
            instanceRef.value = instance;
          }}
          onHide={() => {
            instanceRef.value = undefined;
          }}
          onMount={(instance: TooltipInstance) => {
            // Do not open if not connected...
            if (!stateRef.value.connected) instance.hide();
          }}
          placement="bottom-end"
          onClickOutside={() => instanceRef.value?.hide()}
          interactive
          trigger="click"
          theme="black"
          arrow={false}
          offset={[0, 0]}
          animation="scale"
          content={
            <WalletConnectionDropdown
              connection={props.connection}
              onAction={() => instanceRef.value?.hide()}
            />
          }
        >
          <button
            tab-index={-1}
            role="button"
            onClick={handleClick}
            class={[
              "flex h-[42px] w-full cursor-pointer items-center rounded border border-solid px-[10px] transition-all hover:bg-black focus:bg-black",
              stateRef.value.connected
                ? `border-connected-base`
                : `border-transparent`,
            ]}
          >
            <div class="flex flex-1 items-center text-left">
              <TokenIcon
                assetValue={props.connection.getChain().nativeAsset}
                class="w-[22px]"
              />
              <div class="ml-[13px]">
                <div class="text-sm font-bold leading-none">
                  {props.connection.getChain().displayName}
                </div>
                <div class="text-left text-sm capitalize opacity-50">
                  {props.connection.walletName}
                </div>
              </div>
            </div>
            <div class="flex w-full flex-1 cursor-pointer items-center justify-between text-sm">
              <img
                src={props.connection.walletIconSrc}
                class={"h-[20px] w-[20px] max-w-[20px] rounded"}
              />
              <div class="flex items-center">
                {stateRef.value.connected
                  ? shortenHash(stateRef.value.address, 6, 4)
                  : stateRef.value.connecting
                  ? "Connecting..."
                  : "Connect"}
                {stateRef.value.connecting ? (
                  <AssetIcon
                    icon="interactive/anim-racetrack-spinner"
                    class="ml-[10px] h-[15px] w-[15px] transition-all"
                  />
                ) : (
                  <AssetIcon
                    icon="interactive/chevron-down"
                    class="ml-[10px] h-[15px] w-[15px] transition-all"
                    style={{
                      transform: !instanceRef.value
                        ? "rotate(-90deg)"
                        : "rotate(0deg)",
                    }}
                  />
                )}
              </div>
            </div>
          </button>
        </Tooltip>
      </div>
    );
  },
});
