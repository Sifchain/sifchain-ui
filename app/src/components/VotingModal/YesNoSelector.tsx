import { defineComponent } from "@vue/runtime-core";
import { PropType } from "vue";

export const YesNoSelector = defineComponent({
  name: "YesNoSelector",
  props: {
    value: {
      type: Boolean as PropType<boolean | null>,
      required: true,
    },
    onChange: {
      type: Function as PropType<(value: Boolean) => void>,
      required: true,
    },
  },
  render() {
    return (
      <div class="flex items-center text-lg pl-[8px]">
        <label class="flex items-center">
          <input
            style={{ width: "16px", height: "16px" }}
            type="radio"
            checked={this.value === true}
            onClick={(e) => this.onChange(true)}
          />
          <span class="ml-[4px]">Yes</span>
        </label>
        <label class="flex items-center ml-[24px]">
          <input
            type="radio"
            style={{ width: "16px", height: "16px" }}
            checked={this.value === false}
            onClick={(e) => this.onChange(false)}
          />
          <span class="ml-[4px]">No</span>
        </label>
      </div>
    );
  },
});
