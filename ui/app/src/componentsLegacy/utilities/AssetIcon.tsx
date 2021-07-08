import { defineComponent, PropType } from "vue";
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
})(require.context("@/assets/icons", true, /.*/)) as Record<string, string>;

export type InteractiveIconName =
  | "chevron-down"
  | "search"
  | "arrow-down"
  | "arrows-in"
  | "ellipsis"
  | "tick"
  | "close";

export type NavIconName =
  | "documents"
  | "pool"
  | "swap"
  | "balances"
  | "more"
  | "rowan"
  | "dashboard"
  | "pool-stats"
  | "stake";

export type IconName =
  | `navigation/${NavIconName}`
  | `interactive/${InteractiveIconName}`;

export default defineComponent({
  props: {
    class: {
      type: String,
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
  },
  setup(props) {
    return () => {
      return (
        <img
          class={props.class}
          src={
            navIcons[
              props.icon +
                (props.disabled ? "--disabled" : props.active ? "--active" : "")
            ]
          }
        />
      );
    };
  },
});
