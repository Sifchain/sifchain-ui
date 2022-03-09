import { computed, defineComponent, PropType, ref } from "vue";
import clsx from "clsx";

import { useChains } from "@/hooks/useChains";
import { importStore } from "@/store/modules/import";
import { Network } from "@sifchain/sdk";

import Button from "../Button";
import Modal from "../Modal";
import Tabs from "../Tabs";
import { SelectDropdown, SelectDropdownOption } from "../SelectDropdown";
import { Asset } from "@sifchain/sdk/src/generated/proto/sifnode/clp/v1/types";
import AssetIcon from "../AssetIcon";

type TabKind = "lists" | "tokens";

const TokenListManager = defineComponent({
  name: "TokenListManager",
  props: {
    open: {
      type: Boolean,
      default: false,
    },
    onClose: {
      type: Function as PropType<() => void>,
      default: () => {},
    },
  },
  methods: {},
  setup(props) {
    const selectedTabRef = ref<TabKind>("lists");
    const networkOpenRef = ref(false);

    const chainsRef = importStore.refs.chains.computed();
    const networkValueRef = ref(Network.SIFCHAIN);

    const networksRef = computed(() => chainsRef.value.map((c) => c.network));

    const chains = useChains();

    const createChainSortParam = (network: Network) => {
      // sort by type, then by network, so types are grouped together
      // should probably have some grouping mechanism in the selection dropdown in the future
      return chains.get(network).chainConfig.chainType + network;
    };

    const networkOptionsRef = computed<SelectDropdownOption[]>(
      () =>
        networksRef.value
          ?.map((network) => ({
            content: chains.get(network).displayName,
            value: network,
          }))
          .sort((a, b) =>
            createChainSortParam(a.value).localeCompare(
              createChainSortParam(b.value),
            ),
          ) || [],
    );

    return () => (
      <Modal
        onClose={props.onClose}
        heading="Manage"
        icon="interactive/chevron-left"
        class="max-w-[700px] w-[70vw] mt-[-300px]"
        showClose
      >
        <div class="grid gap-4">
          <div class="bg-[#161616] p-4 rounded-2xl">
            <Tabs
              value={selectedTabRef.value}
              onChange={(tab) => {
                selectedTabRef.value = tab.value as TabKind;
              }}
              tabs={[
                {
                  value: "lists",
                  label: "Lists",
                },
                {
                  value: "tokens",
                  label: "Tokens",
                },
              ]}
            />
            <SelectDropdown
              options={networkOptionsRef}
              value={networkValueRef}
              onChangeValue={(value) => {
                networkValueRef.value = value as Network;
              }}
              tooltipProps={{
                onShow: () => {
                  networkOpenRef.value = true;
                },
                onHide: () => {
                  networkOpenRef.value = false;
                },
              }}
            >
              <Button.Select
                class="w-full relative capitalize pl-[16px] mt-[10px]"
                active={networkOpenRef.value}
              >
                {chains.get(networkValueRef.value).displayName}
              </Button.Select>
            </SelectDropdown>
          </div>
          <div class="p-4">
            {selectedTabRef.value === "lists" && <TokenLists />}
            {selectedTabRef.value === "tokens" && <TokenLists />}
          </div>
        </div>
      </Modal>
    );
  },
});

export default TokenListManager;

export type TokenList = {
  icon: string;
  name: string;
  active: boolean;
  items: Asset[];
};

const TokenListItem = defineComponent({
  props: {
    icon: {
      type: String,
    },
    name: {
      type: String,
    },
    active: {
      type: Boolean,
    },
    assets: {
      type: Array as PropType<Asset[]>,
    },
  },
  setup(props) {
    return () => (
      <label
        class={clsx("flex items-center justify-between rounded-lg p-2", {
          "bg-[#161616]": props.active,
        })}
      >
        <div class="flex gap-2">
          <div>
            <img src={props.icon} class="h-8 w-8" />
          </div>
          <div>
            <div>{props.name}</div>
            <div>{props.assets?.length ?? 0} Tokens</div>
          </div>
        </div>
        <div>
          <Button.Inline onClick={() => {}}>
            <AssetIcon icon="interactive/settings" />
          </Button.Inline>
        </div>
      </label>
    );
  },
});

const TokenLists = defineComponent({
  setup(props) {
    const tokenLists = ref([
      {
        name: "Foo",
        icon: "interactive/foo",
        active: true,
        items: [],
      },
    ] as TokenList[]);
    return () => (
      <ul class="grid gap-2">
        {tokenLists.value.map((list) => (
          <TokenListItem key={list.name} {...list} />
        ))}
      </ul>
    );
  },
});
