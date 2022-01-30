import {
  computed,
  defineComponent,
  HTMLAttributes,
  PropType,
  watch,
} from "vue";
import { ref, toRefs } from "@vue/reactivity";
import { IAsset } from "@sifchain/sdk";
import { TokenIcon } from "@/components/TokenIcon";
import { TokenSelectDropdown } from "@/components/TokenSelectDropdown";
import { Input } from "@/components/Input/Input";
import { Button } from "@/components/Button/Button";
import { useManagedInputValueRef } from "@/hooks/useManagedInputValueRef";
import { TokenNetworkIcon } from "@/components/TokenNetworkIcon/TokenNetworkIcon";

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
    hideBalance: optional(Boolean),
    asset: required(Object as PropType<IAsset | undefined>),
    amount: required(String),
    onSetToMaxAmount: optional(Function as PropType<() => any>),
    onSetToHalfAmount: optional(Function as PropType<() => any>),
    onInputAmount: required(Function as PropType<(amount: string) => any>),
    onSelectAsset: required(Function as PropType<(asset: IAsset) => any>),
    onBlur: required(Function as PropType<HTMLAttributes["onBlur"]>),
    onFocus: required(Function as PropType<HTMLAttributes["onFocus"]>),
    class: required([Object, String, Array] as PropType<
      HTMLAttributes["class"]
    >),
    formattedFiatValue: optional(String),
    excludeSymbols: optional(Array as PropType<string[]>),
    tokenIconUrl: optional(String),
    shouldShowNumberInputOnLeft: optional(Boolean),
    selectDisabled: optional(Boolean),
    inputDisabled: optional(Boolean),
  },
  setup(props) {
    const propRefs = toRefs(props);
    const selectIsOpen = ref(false);
    const selfRef = ref();
    const inputRef = useManagedInputValueRef(
      computed(() =>
        parseFloat(propRefs.amount.value) === 0 ? "" : propRefs.amount.value,
      ),
    );

    return () => {
      /* Hide browser-native validation error tooltips via form novalidate */
      return (
        <form
          novalidate
          onSubmit={(e) => e.preventDefault()}
          ref={selfRef}
          class={[
            "z-0 overflow-visible py-[20px] bg-transparent border-solid border-[0px] border-gray-input_outline rounded-lg",
            props.class,
          ]}
        >
          <div class="w-full flex justify-between items-baseline">
            <div class=" text-sm text-[#919191] font-sans font-medium capitalize">
              {props.heading}
            </div>
            <div
              class={[
                `text-[#919191] font-sans font-medium text-sm ${
                  props.formattedBalance ? "" : "opacity-0"
                }`,
                // !!props.onSetToMaxAmount &&
                //   "hover:text-accent-dark cursor-pointer",
                !!props.hideBalance && `hidden`,
              ]}
            >
              Balance:{" "}
              <span class="text-accent-base">
                {props.formattedBalance || "0"}{" "}
                {props.asset?.displaySymbol.toUpperCase()}
              </span>
              <button
                onClick={() => props.onSetToMaxAmount?.()}
                class="text-[10px] py-[2.5px] px-[10px] ml-[10px] bg-white bg-opacity-5 rounded-[4px] text-accent-base font-semibold"
                style={{
                  letterSpacing: "-3%",
                }}
              >
                MAX
              </button>
              <button
                onClick={() => props.onSetToHalfAmount?.()}
                class="text-[10px] py-[2.5px] px-[10px] ml-[10px] bg-white bg-opacity-5 rounded-[4px] text-accent-base font-semibold"
                style={{
                  letterSpacing: "-3%",
                }}
              >
                HALF
              </button>
            </div>
          </div>
          <div
            class={[
              `relative flex flex-row  mt-[10px] overflow-visible gap-[10px]`,
              props.shouldShowNumberInputOnLeft ? "flex-row-reverse" : "",
            ]}
          >
            <Button.Select
              class="w-[186px]"
              active={selectIsOpen.value}
              disabled={props.selectDisabled}
              chevronIcon={
                props.selectDisabled
                  ? "interactive/lock"
                  : "interactive/chevron-down"
              }
              onClick={(e: MouseEvent) => {
                e.stopPropagation();
                if (props.selectDisabled) return;
                selectIsOpen.value = !selectIsOpen.value;
              }}
            >
              <div class="flex justify-between items-center w-full">
                <TokenNetworkIcon size={38} asset={propRefs.asset} />
                <div class="font-sans text-center text-[18px] font-bold text-white uppercase">
                  {props.asset?.displaySymbol}
                </div>
                <div></div>
              </div>
            </Button.Select>
            <Input.Base
              placeholder={"0"}
              inputRef={inputRef}
              class="token-input flex-1 opacity-100"
              disabled={props.inputDisabled}
              startContent={<>{props.formattedFiatValue || null}</>}
              onFocus={props.onFocus}
              onBlur={props.onBlur}
              type="number"
              min="0"
              style={{
                textAlign: "right",
              }}
              onInput={(e) => {
                let v = (e.target as HTMLInputElement).value;
                if (isNaN(parseFloat(v)) || parseFloat(v) < 0) {
                  v = "0";
                }
                props.onInputAmount(v || "");
              }}
            />
          </div>
          <TokenSelectDropdown
            excludeSymbols={props.excludeSymbols}
            onCloseIntent={() => {
              selectIsOpen.value = false;
            }}
            onSelectAsset={(asset) => {
              selectIsOpen.value = false;
              props.onSelectAsset(asset);
            }}
            active={selectIsOpen}
          />
        </form>
      );
    };
  },
});
