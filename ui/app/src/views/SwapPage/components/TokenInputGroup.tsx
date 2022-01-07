import { computed, defineComponent, HTMLAttributes, PropType } from "vue";
import { ref, toRefs } from "@vue/reactivity";
import { IAsset } from "@sifchain/sdk";
import { TokenIcon } from "@/components/TokenIcon";
import { TokenSelectDropdown } from "@/components/TokenSelectDropdown";
import { Input } from "@/components/Input/Input";
import { Button } from "@/components/Button/Button";
import { useManagedInputValueRef } from "@/hooks/useManagedInputValueRef";
import { shouldPreventInput } from "../../../utils/shouldPreventInput";

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
            "z-0 overflow-visible p-[20px] bg-gray-base border-solid border-[1px] border-gray-input_outline rounded-lg",
            props.class,
          ]}
        >
          <div class="w-full flex justify-between items-baseline">
            <div class=" text-md text-white font-sans font-medium capitalize">
              {props.heading}
            </div>
            <div
              onClick={() => props.onSetToMaxAmount?.()}
              class={[
                `text-white opacity-50 font-sans font-medium text-sm ${
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
              `relative flex flex-row mt-[10px] overflow-visible gap-[10px]`,
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
              <div class="flex justify-between items-center">
                <TokenIcon size={38} asset={propRefs.asset}></TokenIcon>
                <div class="font-sans ml-[8px] text-[18px] font-medium text-white uppercase">
                  {props.asset?.displaySymbol}
                </div>
              </div>
            </Button.Select>
            <Input.Base
              placeholder={"0"}
              inputRef={inputRef}
              class="token-input flex-1 opacity-100"
              disabled={props.inputDisabled}
              startContent={
                !!props.onSetToMaxAmount &&
                !props.inputDisabled && (
                  <Button.Pill
                    onClick={() =>
                      props.onSetToMaxAmount && props.onSetToMaxAmount()
                    }
                  >
                    MAX
                  </Button.Pill>
                )
              }
              onFocus={props.onFocus}
              onBlur={props.onBlur}
              type="text"
              style={{
                textAlign: "right",
              }}
              onBeforeInput={(e: InputEvent) => {
                const target = e.target as HTMLInputElement;
                // prevent next keystroke from being added to e.target.value if the max digits before or after the decimal place are reached
                if (
                  propRefs.asset.value?.decimals &&
                  typeof target.selectionStart === "number" &&
                  e.data
                ) {
                  shouldPreventInput(
                    target.value,
                    target.selectionStart,
                    e.data,
                    15,
                    propRefs.asset.value.decimals,
                  )
                    ? e.preventDefault()
                    : null;
                }
              }}
              onInput={(e) => {
                let v = (e.target as HTMLInputElement).value;
                if (isNaN(parseFloat(v)) || parseFloat(v) < 0) {
                  v = "0";
                }
                // remove any hanging decimal places
                props.onInputAmount(parseFloat(v).toString() || "");
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
