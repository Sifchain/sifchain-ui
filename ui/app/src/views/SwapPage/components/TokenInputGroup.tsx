import {
  defineComponent,
  EmitsOptions,
  Events,
  FunctionalComponent,
  HTMLAttributes,
  InputHTMLAttributes,
  onDeactivated,
  onMounted,
  onUnmounted,
  PropType,
  SetupContext,
  Teleport,
  watch,
} from "vue";
import AssetIcon from "@/componentsLegacy/utilities/AssetIcon";
import { computed, effect, reactive, ref, toRefs } from "@vue/reactivity";
import { format, IAsset, IAssetAmount, Network } from "@sifchain/sdk";
import { TokenIcon } from "@/components/TokenIcon";
import { useCore } from "@/hooks/useCore";
import { TOKEN_SELECT_MODAL_TARGET } from "@/constants/teleport";
import { formatAssetAmount } from "@/componentsLegacy/shared/utils";
import { TokenSelectDropdown } from "@/components/TokenSelectDropdown";
export const SampleBoundChildComponent = defineComponent<
  { exampleProp: boolean } & InputHTMLAttributes
>({
  // explicitly don't apply all non-prop attrs to the root element
  inheritAttrs: false,
  setup: (props, ctx) => () => (
    <div>
      <div class="h-20"></div>
      <input type="text" {...ctx.attrs} />
    </div>
  ),
});

function required<T>(type: T) {
  return {
    type,
    required: true,
  } as const;
}
function optional<T>(type: T) {
  return {
    type,
    required: false,
  } as const;
}

export const TokenInputGroup = defineComponent({
  name: "TokenInputGroup",
  props: {
    heading: required(String),
    formattedBalance: optional(String),
    asset: required(Object as PropType<IAsset | undefined>),
    amount: required(String),
    onSetToMaxAmount: optional(Function as PropType<() => any>),
    onInputAmount: required(Function as PropType<(amount: string) => any>),
    onSelectAsset: required(Function as PropType<(asset: IAsset) => any>),
    onBlur: required(Function as PropType<HTMLAttributes["onBlur"]>),
    onFocus: required(Function as PropType<HTMLAttributes["onFocus"]>),
    class: required([Object, String, Array] as PropType<
      HTMLAttributes["class"]
    >),
    tokenIconUrl: optional(String),
    shouldShowNumberInputOnLeft: optional(Boolean),
  },
  setup(props) {
    const propRefs = toRefs(props);
    const selectIsOpen = ref(false);
    return () => {
      return (
        <div
          class={[
            "z-0 overflow-visible p-[20px] bg-gray-base border-solid border-[1px] border-gray-input_outline rounded-[10px]",
            props.class,
          ]}
        >
          <div class="w-full flex justify-between">
            <div class=" text-[16px] text-white font-sans font-medium capitalize">
              {props.heading}
            </div>
            <div
              class={`text-white opacity-50 font-sans font-medium text-[12px] ${
                props.formattedBalance ? "" : "opacity-0"
              }`}
            >
              Balance {props.formattedBalance}{" "}
              {props.asset?.label.replace(/^c/gim, "")}
            </div>
          </div>
          <div
            class={[
              `relative flex flex-row mt-[10px] overflow-visible gap-[10px]`,
              props.shouldShowNumberInputOnLeft ? "flex-row-reverse" : "",
            ]}
          >
            <button
              class={[
                "transition-all duration-200 relative flex items-center w-[186px] h-[54px] p-[8px] pr-0 rounded-[4px] bg-gray-input border-solid border-gray-input_outline border-[1px]",
                selectIsOpen.value ? "border-accent-base" : "",
              ]}
              onClick={(e: MouseEvent) => {
                e.stopPropagation();
                selectIsOpen.value = !selectIsOpen.value;
              }}
            >
              {/* <img class="h-[38px]" src={props.tokenIconUrl} /> */}
              <TokenIcon size={38} asset={propRefs.asset}></TokenIcon>
              <div class="font-sans ml-[8px] text-[18px] font-medium text-white uppercase">
                {props.asset?.label.replace(/^c/gim, "")}
              </div>

              <AssetIcon
                class={[
                  "w-[24px] h-[24px] mr-[20px] ml-auto transition-all duration-150",
                  selectIsOpen.value ? "rotate-180 text-accent-base" : "",
                ]}
                icon="interactive/chevron-down"
              />
            </button>
            <div class="relative flex items-center w-[254px] h-[54px] p-[8px] pl-0 rounded-[4px] bg-gray-input border-solid border-gray-input_outline border-[1px]">
              <input
                onFocus={props.onFocus}
                onBlur={props.onBlur}
                type="number"
                min="0"
                style={{
                  textAlign: "right",
                }}
                onInput={(e) => {
                  props.onInputAmount(
                    (e.target as HTMLInputElement).value || "",
                  );
                }}
                value={props.amount}
                class="box-border w-full absolute top-0 bottom-0 left-0 right-0 pr-[16px] pl-[68px] h-full bg-transparent outline-none text-[20px] text-white font-sans font-medium"
              />
              <button
                onClick={() =>
                  props.onSetToMaxAmount && props.onSetToMaxAmount()
                }
                class={`${
                  props.onSetToMaxAmount ? "" : "opacity-0 pointer-events-none"
                } z-10 ml-[16px] box-content text-[10px] p-[1px] font-semibold bg-accent-gradient rounded-full font-sans`}
              >
                <div class="flex items-center px-[9px] h-[18px] bg-gray-input rounded-full text-accent-base">
                  <span style="letter-spacing: -1%; line-height: 10px;">
                    MAX
                  </span>
                </div>
              </button>
            </div>
          </div>
          <TokenSelectDropdown
            onCloseIntent={() => {
              selectIsOpen.value = false;
            }}
            onSelectAsset={(asset) => {
              selectIsOpen.value = false;
              props.onSelectAsset(asset);
            }}
            active={selectIsOpen}
          />
        </div>
      );
    };
  },
});
