import { computed, defineComponent, HTMLAttributes, PropType } from "vue";
import { ref, toRefs } from "@vue/reactivity";
import { IAsset } from "@sifchain/sdk";

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
    asset: required(Object as PropType<IAsset | undefined>),
    amount: required(String),
    onSetToMaxAmount: optional(Function as PropType<() => any>),
    onInputAmount: required(Function as PropType<(amount: string) => any>),
    onSelectAsset: required(Function as PropType<(asset: IAsset) => any>),
    onBlur: required(Function as PropType<HTMLAttributes["onBlur"]>),
    onFocus: required(Function as PropType<HTMLAttributes["onFocus"]>),
    class: optional([Object, String, Array] as PropType<
      HTMLAttributes["class"]
    >),
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
            "bg-gray-base border-gray-input_outline z-0 overflow-visible rounded-lg p-4",
            props.class,
          ]}
        >
          <div class="flex w-full items-baseline justify-between">
            <div class="text-md font-sans font-medium capitalize text-white">
              {props.heading}
            </div>
            <div
              onClick={() => props.onSetToMaxAmount?.()}
              class={[
                `font-sans text-sm font-medium text-white opacity-50 ${
                  props.formattedBalance ? "" : "opacity-0"
                }`,
                !!props.onSetToMaxAmount &&
                  "hover:text-accent-base cursor-pointer",
              ]}
            >
              Balance: {props.formattedBalance || "0"}{" "}
              {props.asset?.displaySymbol.toUpperCase()}
            </div>
          </div>
          <div
            class={[
              `relative mt-[10px] flex flex-row gap-[10px] overflow-visible`,
              props.shouldShowNumberInputOnLeft ? "flex-row-reverse" : "",
            ]}
          >
            <Button.Select
              class="max-w-[50%] flex-1"
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
              <div class="flex items-center justify-between">
                <TokenNetworkIcon size={32} asset={propRefs.asset} />
                <div class="text-md ml-[8px] font-sans font-medium uppercase text-white md:text-lg">
                  {props.asset?.displaySymbol}
                </div>
              </div>
            </Button.Select>
            <Input.Base
              placeholder={"0"}
              inputRef={inputRef}
              class="token-input min-w-[120px] flex-1 opacity-100 md:min-w-[240px]"
              disabled={props.inputDisabled}
              startContent={
                Boolean(props.onSetToMaxAmount) && !props.inputDisabled ? (
                  <Button.Pill
                    onClick={() =>
                      props.onSetToMaxAmount && props.onSetToMaxAmount()
                    }
                  >
                    MAX
                  </Button.Pill>
                ) : null
              }
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
