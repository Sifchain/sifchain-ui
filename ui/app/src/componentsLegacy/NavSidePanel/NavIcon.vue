<script lang="tsx">
import {
  Component,
  DefineComponent,
  defineComponent,
  PropType,
  SVGAttributes,
} from "vue";
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
    size: {
      type: String,
      default: () => "20px",
    },
  },
  setup(props) {
    const InlineSvg = (navIcons[
      props.icon + (props.active ? "--active" : "")
    ] as unknown) as DefineComponent<
      PropType<Record<string, unknown>> & SVGAttributes
    >;
    return () => {
      return (
        <InlineSvg
          width={props.size}
          height={props.size}
          class={[props.class]}
        />
      );
    };
  },
});
</script>
