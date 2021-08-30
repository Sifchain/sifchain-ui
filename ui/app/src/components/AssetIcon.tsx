import {
  ComponentPublicInstance,
  DefineComponent,
  defineComponent,
  HTMLAttributes,
  PropType,
  Ref,
  SVGAttributes,
  computed,
  VNode,
} from "vue";
const navIcons = ((ctx) => {
  let keys = ctx.keys();
  let values = keys.map(ctx);
  return keys.reduce((o, k, i) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const [folderName, ...rest] = k
      .split("./")
      .join("")
      .split(".")
      .shift()
      ?.split("/");
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    o[`${folderName}/${rest.reverse().join("--") || ""}`] = values[i];
    return o;
  }, {});
})(require.context("@/assets/icons", true, /.*/)) as Record<
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
  | "picture";

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
  | "swap";

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
