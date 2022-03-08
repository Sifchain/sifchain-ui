import clsx from "clsx";
import { defineComponent, PropType, ref } from "vue";
import Modal from "../Modal";

type TabKind = "lists" | "tokens";

const TokenListManager = defineComponent({
  name: "TokenListManager",

  methods: {},
  setup(props) {
    const selectedTabRef = ref<TabKind>("lists");
    return () => (
      <Modal
        onClose={() => {}}
        heading="Manage"
        icon="interactive/chevron-left"
        showClose={true}
        class="max-w-[700px] w-[70vw] mt-[-300px]"
      >
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
        </div>
      </Modal>
    );
  },
});

export default TokenListManager;

type Tab = {
  value: string;
  label: string;
};

export const Tabs = defineComponent({
  props: {
    tabs: {
      type: Array as PropType<Tab[]>,
      default: [],
    },
    value: {
      type: String,
    },
    onChange: {
      type: Function as PropType<(tab: Tab) => void>,
    },
  },
  setup(props) {
    return () => (
      <ul class="flex gap-4 bg-[#2B2B2B] rounded p-2">
        {props.tabs?.map((tab) => (
          <li class="flex-1">
            <button
              onClick={() => {
                if (props.onChange) {
                  props.onChange(tab);
                }
              }}
              class={clsx(
                "flex w-full items-center justify-center rounded-lg p-4",
                {
                  "bg-[#414141]": tab.value === props.value,
                },
              )}
            >
              <span class="text-lg font-semibold">{tab.label}</span>
            </button>
          </li>
        ))}
      </ul>
    );
  },
});
