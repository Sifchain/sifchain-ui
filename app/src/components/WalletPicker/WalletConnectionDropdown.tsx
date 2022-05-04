import { defineComponent, PropType, computed, ref, onUnmounted } from "vue";
import copy from "copy-to-clipboard";

import AssetIcon, { IconName } from "@/components/AssetIcon";
import { accountStore } from "@/store/modules/accounts";
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
          const Cmp = item.tag as any;
          return (
            <Cmp
              key={item.name}
              {...item.props}
              class={[
                "active:text-accent-base mt-1 flex w-full cursor-pointer items-center justify-between px-1 text-sm font-normal text-gray-400 first:mt-0 hover:text-white",
                item.props.class,
              ]}
            >
              <span>{item.name}</span>
              <AssetIcon icon={item.icon} class="h-4 w-4" />
            </Cmp>
          );
        })}
      </div>
    );
  },
});
