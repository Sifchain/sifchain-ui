import { defineComponent, PropType, computed, ref, onUnmounted } from "vue";
import copy from "copy-to-clipboard";

import AssetIcon, { IconName } from "~/components/AssetIcon";
import { accountStore } from "~/store/modules/accounts";
import { WalletConnection } from "./constants";

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
    const stateRef =
      accountStore.refs[props.connection.getChain().network].computed();

    const addressExplorerUrl = computed(() => {
      return props.connection
        .getChain()
        .getBlockExplorerUrlForAddress(stateRef.value.address);
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
      // {
      //   hide: !props.connection.disconnect,
      //   tag: "button",
      //   name: "Disconnect",
      //   icon: "interactive/link" as IconName,
      //   props: {
      //     onClick: props.connection.disconnect,
      //   },
      // },
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
      <div class="w-[124px]" onClick={() => props.onAction?.()}>
        {actionsRef.value.map((item) => {
          // if (item.hide) return null;
          const Cmp = item.tag as any;
          return (
            <Cmp
              key={item.name}
              {...item.props}
              class={[
                "height-[20px] active:text-accent-base mt-[4px] flex w-full cursor-pointer items-center justify-between px-[4px] text-sm font-normal text-gray-800 first:mt-0 hover:text-white",
                item.props.class,
              ]}
            >
              <span>{item.name}</span>
              <AssetIcon icon={item.icon} class="h-[16px] w-[16px]" />
            </Cmp>
          );
        })}
      </div>
    );
  },
});
