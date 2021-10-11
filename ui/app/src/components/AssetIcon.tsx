import {
  ComponentPublicInstance,
  DefineComponent,
  defineComponent,
  HTMLAttributes,
  PropType,
  Ref,
  SVGAttributes,
  computed,
} from "vue";
const navIcons = ((results) => {
  return Object.entries(results).reduce((acc, [key, value], index) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const iconName = key.replace(/^.*?\/icons\//g, "").replace(/\.svg$/, "");
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    acc[iconName] = value;
    return acc;
  }, {});
})(import.meta.globEager("/src/assets/icons/**/*.svg")) as Record<
  string,
  {
    default: DefineComponent<PropType<Record<string, unknown>> & SVGAttributes>;
  }
>;

export type InteractiveIconName =
  | "anim-circle-spinner"
  | "anim-racetrack-spinner"
  | "arrow-down"
  | "arrow-up"
  | "arrows-in"
  | "chevron-down"
  | "chevron-up"
  | "circle-question"
  | "circle-info"
  | "close"
  | "copy"
  | "ellipsis"
  | "hamburger"
  | "help"
  | "link"
  | "lock"
  | "minus"
  | "open-external"
  | "plus"
  | "search"
  | "swap"
  | "tick"
  | "wallet"
  | "warning"
  | "settings"
  | "picture"
  | "check";

export type NavIconName =
  | "balances"
  | "dashboard"
  | "changelog"
  | "documents"
  | "more"
  | "pool"
  | "pool-stats"
  | "rewards"
  | "rowan"
  | "stake"
  | "swap"
  | "harvest";

export type IconName =
  | `navigation/${NavIconName}`
  | `interactive/${InteractiveIconName}`;

export default defineComponent({
  props: {
    class: {
      type: [String, Object, Array] as HTMLAttributes["class"],
    },
    icon: {
      type: (String as unknown) as PropType<IconName>,
      required: true,
    },
    active: {
      type: Boolean,
    },
    disabled: {
      type: Boolean,
    },
    size: {
      type: [Number, String],
      default: () => 20,
    },
    vectorRef: Object as PropType<Ref<ComponentPublicInstance | undefined>>,
  },
  setup(props) {
    const InlineSvg = computed(() => navIcons[props.icon]?.default);
    return () => {
      return (
        <InlineSvg.value
          ref={props.vectorRef}
          preserveAspectRatio="none"
          width={props.size}
          height={props.size}
          class={[
            "font-normal",
            // "stroke-current",
            props.active ? "text-accent-base" : "",
            props.disabled ? "text-gray-500" : "",
            props.class,
          ]}
        />
      );
    };
  },
});
