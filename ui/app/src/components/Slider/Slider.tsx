import { defineComponent, PropType } from "vue";
import { computed, ref } from "@vue/reactivity";
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
  },
  setup(props, context) {
    const localValue = computed({
      get: () => props.value,
      set: (value) => props.onUpdate?.(value),
    });
    const data = { localValue };
    return () => (
      <div class="w-full relative">
        {!!props.message && <p class="text-left">{props.message}</p>}
        <div class="w-full relative h-[18px]">
          <div class="w-full pointer-events-none absolute inset-0 flex flex-row items-center">
            <div
              style={{
                width: `calc(${(+props.value / +props.max) * 100}% - 9px)`,
                paddingRight: "9px",
                marginRight: "-9px",
              }}
              class="h-[6px] rounded-full bg-accent-base"
            ></div>
            <button
              style={{
                boxShadow: "0px 2px 2px rgba(0, 0, 0, 0.2)",
              }}
              class="rounded-full hover:scale-125 z-10 w-[18px] h-[18px]  bg-accent-base"
            ></button>
            <div
              style={{
                width: `calc(${(1 - +props.value / +props.max) * 100}%)`,
                paddingLeft: "9px",
                marginLeft: "-9px",
              }}
              class="h-[6px] rounded-full w-1/2 bg-[#373737]"
            ></div>
            <div></div>
          </div>
          <input
            disabled={props.disabled}
            value={data.localValue.value}
            onInput={(e) => {
              data.localValue.value = (e.target as HTMLInputElement).value;
            }}
            class="absolute block inset-0 w-full opacity-0"
            min={props.min}
            max={props.max}
            type="range"
            step={props.step}
          />
        </div>
        <div class="mt-[1px] text-[14px] text-center flex flex-row w-full justify-between">
          <div>
            <label
              class="text-white text-opacity-50 cursor-pointer hover:text-opacity-70"
              onClick={() => props.onLeftClicked?.()}
            >
              {props.leftLabel}
            </label>
          </div>
          <div>
            <label
              class="text-white text-opacity-50 cursor-pointer hover:text-opacity-70"
              onClick={() => props.onMiddleClicked?.()}
            >
              {props.middleLabel}
            </label>
          </div>
          <div>
            <label
              class="text-white text-opacity-50 cursor-pointer hover:text-opacity-70"
              onClick={() => props.onRightClicked?.()}
            >
              {props.rightLabel}
            </label>
          </div>
        </div>
      </div>
    );
  },
});
