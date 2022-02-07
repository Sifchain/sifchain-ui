import {
  computed,
  createElementVNode,
  defineComponent,
  HTMLAttributes,
  onMounted,
  PropType,
  ref,
  VNodeTypes,
} from "vue";

import debounce from "@/utils/debounce-raf";
import { Compatible42SigningCosmosClient } from "@sifchain/sdk/src/clients/native/SifClient";

export default defineComponent({
  props: {
    data: {
      type: Array as PropType<any[]>,
      default: [],
    },
    rowHeight: {
      type: Number,
      default: 0,
    },
    visibleRows: {
      type: Number,
      default: 0,
    },
    onScroll: {
      type: Function as PropType<HTMLAttributes["onScroll"]>,
      default: () => {},
    },
    renderItem: {
      type: Function as PropType<(item: any) => JSX.Element>,
      default: () => <></>,
    },
    as: {
      type: String as PropType<VNodeTypes>,
    },
    class: {
      type: [String, Array] as PropType<HTMLAttributes["class"]>,
    },
    emptyState: {
      type: Object as PropType<JSX.Element>,
      default: <></>,
    },
    paddingEnd: {
      type: Number,
      default: 2,
    },
  },
  setup(props) {
    const startIndex = ref(0);
    const lastIndex = computed(() => props.data.length - 1);
    const visibleRows = ref(props.visibleRows);

    const endIndex = computed(() => {
      const targetIndex = startIndex.value + visibleRows.value;
      return targetIndex >= lastIndex.value ? lastIndex.value : targetIndex;
    });

    const visible = computed(() =>
      props.data.slice(startIndex.value, endIndex.value + props.paddingEnd),
    );

    const handleScroll = debounce((e: UIEvent) => {
      const index = Math.floor(
        ((e.target as HTMLDivElement)?.scrollTop ?? 0) / props.rowHeight,
      );

      if (index !== startIndex.value) {
        startIndex.value = index;

        // hoist onScroll event
        if (props.onScroll) {
          props.onScroll(e);
        }
      }
    });

    onMounted(() => {
      if (!visibleRows.value && !props.visibleRows) {
        // dynamically set visibleRows based on the screen height when a default value isn't present
        visibleRows.value = Math.floor(
          (document.body.clientHeight * 0.8) / props.rowHeight,
        );
      }
    });

    const maxHeight = computed(() => props.rowHeight * visibleRows.value);

    const Container = createElementVNode(props.as ?? "div");

    return () => (
      // @ts-ignore
      <Container
        style={{
          maxHeight: `${maxHeight.value}px`,
        }}
        class={[props.class, "block w-full overflow-y-scroll"]}
        onScroll={handleScroll}
      >
        {!visible.value.length ? (
          props.emptyState
        ) : (
          <>
            {Boolean(startIndex.value) && (
              <div
                style={{ height: `${props.rowHeight * startIndex.value}px` }}
              />
            )}
            {visible.value.map(props.renderItem)}
            {endIndex.value < lastIndex.value && (
              <div
                class="block"
                style={{
                  height: `${
                    props.rowHeight * (lastIndex.value - endIndex.value)
                  }px`,
                }}
              />
            )}
          </>
        )}
      </Container>
    );
  },
});
