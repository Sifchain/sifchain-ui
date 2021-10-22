import { shortenHash } from "@/componentsLegacy/shared/utils";
import AssetIcon from "@/components/AssetIcon";
import { defineComponent, PropType, ref } from "vue";
import { WalletConnection } from "./constants";
import WalletConnectionDropdown from "./WalletConnectionDropdown";
import Tooltip, { TooltipInstance } from "@/components/Tooltip";
import { TokenIcon } from "../TokenIcon";
import { accountStore } from "@/store/modules/accounts";
import { useCore } from "@/hooks/useCore";

export default defineComponent({
  name: "WalletConnection",
  props: {
    connection: {
      type: Object as PropType<WalletConnection>,
      required: true,
    },
  },
  setup(props) {
    const stateRef = accountStore.refs[
      props.connection.getChain().network
    ].computed();
    const instanceRef = ref<TooltipInstance>();

    const handleClick = async () => {
      if (stateRef.value.connected) return;
      try {
        await props.connection.connect();
      } catch (error) {
        useCore().services.bus.dispatch({
          type: "ErrorEvent",
          payload: {
            message: "Wallet Connect Error: " + error.message,
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
              "h-[42px] flex items-center px-[10px] w-full border border-solid rounded cursor-pointer focus:bg-black hover:bg-black transition-all",
              stateRef.value.connected
                ? `border-connected-base`
                : `border-transparent`,
            ]}
          >
            <div class="flex-1 items-center flex text-left">
              <TokenIcon
                assetValue={props.connection.getChain().nativeAsset}
                class="w-[22px]"
              />
              <div class="ml-[13px]">
                <div class="text-sm font-bold leading-none">
                  {props.connection.getChain().displayName}
                </div>
                <div class="text-sm opacity-50 capitalize text-left">
                  {props.connection.walletName}
                </div>
              </div>
            </div>
            <div class="flex-1 cursor-pointer text-sm flex justify-between items-center w-full">
              <img
                src={props.connection.walletIconSrc}
                class={"w-[20px] max-w-[20px] h-[20px] rounded"}
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
                    class="ml-[10px] w-[15px] h-[15px] transition-all"
                  />
                ) : (
                  <AssetIcon
                    icon="interactive/chevron-down"
                    class="ml-[10px] w-[15px] h-[15px] transition-all"
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
