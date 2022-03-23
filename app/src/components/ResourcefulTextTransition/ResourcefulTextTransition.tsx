import AssetIcon, { IconName } from "@/components/AssetIcon";
import {
  VNode,
  Component,
  defineComponent,
  HTMLAttributes,
  PropType,
  SetupContext,
  Transition,
  onMounted,
  TransitionGroup,
  ref,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import "./resourceful-text-style.scss";

export default defineComponent({
  props: {
    text: {
      type: Object as PropType<string>,
      required: true,
    },
    class: String as PropType<HTMLAttributes["class"]>,
  },
  computed: {
    activeIconText(): { char: string; key: string }[] {
      const text: string = this.text;
      let arr = text.split("");
      const charCounts: Record<string, any> = {};
      return arr.map((char: string, index: number) => {
        charCounts[char] = charCounts[char] || 0;
        const charInstanceIndex = charCounts[char];
        charCounts[char]++;
        return {
          char,
          key: char + charInstanceIndex,
        };
      });
    },
  },
  render() {
    const props = this;
    return (
      <div class={[props.class]}>
        <TransitionGroup appear name="list-horizontal-complete">
          {this.activeIconText.map((char, index) => {
            return (
              <span
                class="list-horizontal-complete-item"
                key={char.key}
                data-index={index}
              >
                {char.char}
              </span>
            );
          })}
        </TransitionGroup>
      </div>
    );
  },
});
