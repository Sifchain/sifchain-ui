import { useCore } from "@/hooks/useCore";
import { defineComponent, PropType, computed, ref, onUnmounted } from "vue";

import { WalletConnection } from "./constants";
import copy from "copy-to-clipboard";
import AssetIcon, { IconName } from "@/components/AssetIcon";
import { RouterLink } from "vue-router";
import { TooltipInstance } from "../Tooltip";

export default defineComponent({
  name: "WalletConnectionDropdown",
  props: {
    connection: {
      type: Object as PropType<WalletConnection>,
      required: true,
    },
    onAction: {
      type: Function,
      required: true,
    },
  },
  setup(props) {
    const { config } = useCore();
    const stateRef = props.connection.useWalletState();
    const apiRef = props.connection.useWalletApi();
    const addressExplorerUrl = computed(() => {
      return props.connection.getAddressExplorerUrl(
        config,
        stateRef.value.address,
      );
    });

    const copiedRef = ref(false);
    let timeoutId: NodeJS.Timeout;
    const handleCopied = (ev: Event) => {
      ev.stopPropagation();
      copy(stateRef.value.address);
      copiedRef.value = true;
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        copiedRef.value = false;
      }, 2500);
    };

    onUnmounted(() => {
      clearTimeout(timeoutId);
    });

    const actionsRef = computed(() => [
      {
        tag: "button",
        name: copiedRef.value ? "Copied!" : "Copy Address",
        icon: "interactive/copy" as IconName,
        props: {
          class: copiedRef.value ? "!text-accent-base" : "",
          onClick: handleCopied,
        },
      },
      // Some wallets have no disconnect..
      {
        hide: !apiRef.value.disconnect,
        tag: "button",
        name: "Disconnect",
        icon: "interactive/link" as IconName,
        props: {
          onClick: apiRef.value.disconnect,
        },
      },
      {
        tag: "a",
        name: "Block Explorer",
        icon: "interactive/open-external" as IconName,
        props: {
          href: addressExplorerUrl.value,
          target: "_blank",
          rel: "noopener noreferrer",
        },
      },
    ]);

    return () => (
      <div class="w-[124px]" onClick={() => props.onAction()}>
        {actionsRef.value.map((item) => {
          if (item.hide) return null;
          const Cmp = item.tag as any;
          return (
            <Cmp
              key={item.name}
              {...item.props}
              class={[
                "height-[20px] cursor-pointer px-[4px] w-full flex justify-between items-center text-gray-800 hover:text-white active:text-accent-base font-normal text-sm mt-[4px] first:mt-0",
                item.props.class,
              ]}
            >
              <span>{item.name}</span>
              <AssetIcon icon={item.icon} class="w-[16px] h-[16px]" />
            </Cmp>
          );
        })}
      </div>
    );
  },
});
