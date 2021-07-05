<script lang="tsx">
import { defineComponent } from "vue";
const navIcons = ((ctx) => {
  let keys = ctx.keys();
  let values = keys.map(ctx);
  return keys.reduce((o, k, i) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    o[
      k
        .split("./")
        .join("")
        .split(".")
        .shift()
        ?.split("/")
        .reverse()
        .join("--") || ""
    ] = values[i];
    return o;
  }, {});
})(require.context("@/assets/icons/navigation", true, /.*/)) as Record<
  string,
  string
>;

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

export default defineComponent({
  props: {
    class: {
      type: String,
    },
    icon: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
    },
  },
  setup(props) {
    return () => {
      return (
        <img
          class={props.class}
          src={navIcons[props.icon + (props.active ? "--active" : "")]}
        />
      );
    };
  },
});
</script>
