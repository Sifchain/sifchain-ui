import { defineComponent, PropType } from "vue";
import { computed, ref } from "vue";
import "./Slider.scss";
export const Slider = defineComponent({
  props: {
    onLeftClicked: { type: Function },
    onMiddleClicked: { type: Function },
    onUpdate: {
      type: Function as PropType<(v: string) => any>,
    },
    onRightClicked: { type: Function },
    message: { type: String, default: () => "" },
    disabled: { type: Boolean, default: () => false },
    value: { type: String, default: () => "0" },
    min: { type: String, default: () => "0" },
    max: { type: String, default: () => "100" },
    step: { type: String, default: () => "1" },
    leftLabel: { type: String, default: () => "0" },
    middleLabel: { type: String, default: () => "50" },
    rightLabel: { type: String, default: () => "100" },
    hideIndicatorBarAccent: { type: Boolean },
  },
  setup(props, context) {
    const localValue = computed({
      get: () => props.value,
      set: (value) => props.onUpdate?.(value),
    });
    const data = { localValue };
    const shouldDisplayFocusedState = ref(false);
    return () => {
      const amountRatio =
        (+props.value - +props.min) / (+props.max - +props.min);
      return (
        <div class="relative w-full">
          {!!props.message && <p class="text-left">{props.message}</p>}
          <div class="relative h-[18px] w-full">
            <div class="pointer-events-none absolute inset-0 flex w-full flex-row items-center">
              <div
                style={{
                  width: `calc(${amountRatio * 100}%)`,
                  paddingRight: "9px",
                  marginRight: "-9px",
                }}
                class={[
                  `bg-accent-base h-[6px] rounded-full`,
                  props.hideIndicatorBarAccent
                    ? `bg-[#373737]`
                    : `bg-accent-base`,
                ]}
              ></div>
              <button
                style={{
                  boxShadow: "0px 2px 2px rgba(0, 0, 0, 0.2)",
                }}
                class={[`bg-accent-base z-10 h-[18px] w-[18px] rounded-full`]}
              ></button>
              <div
                style={{
                  width: `calc(${(1 - amountRatio) * 100}%)`,
                  paddingLeft: "9px",
                  marginLeft: "-9px",
                  transform: shouldDisplayFocusedState.value
                    ? `scale(125%)`
                    : "",
                }}
                class="h-[6px] w-1/2 rounded-full bg-[#373737]"
              ></div>
              <div></div>
            </div>
            <input
              disabled={props.disabled}
              value={data.localValue.value}
              onInput={(e) => {
                data.localValue.value = (e.target as HTMLInputElement).value;
              }}
              onFocus={(e) => {
                shouldDisplayFocusedState.value = true;
              }}
              onBlur={(e) => {
                shouldDisplayFocusedState.value = false;
              }}
              class="absolute inset-0 block w-full opacity-0"
              min={props.min}
              max={props.max}
              type="range"
              step={props.step}
            />
          </div>
          <div class="mt-[1px] flex w-full flex-row justify-between text-[14px]">
            <label
              class="w-[33.333%] cursor-pointer text-left text-white text-opacity-50 hover:text-opacity-70"
              onClick={() => props.onLeftClicked?.()}
            >
              {props.leftLabel}
            </label>
            <label
              class="w-[33.333%] cursor-pointer text-center text-white text-opacity-50 hover:text-opacity-70"
              onClick={() => props.onMiddleClicked?.()}
            >
              {props.middleLabel}
            </label>
            <label
              class="w-[33.333%] cursor-pointer text-right text-white text-opacity-50 hover:text-opacity-70"
              onClick={() => props.onRightClicked?.()}
            >
              {props.rightLabel}
            </label>
          </div>
        </div>
      );
    };
  },
});
