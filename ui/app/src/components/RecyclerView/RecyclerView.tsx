import {
  computed,
  createElementVNode,
  defineComponent,
  HTMLAttributes,
  PropType,
  ref,
  VNodeTypes,
} from "vue";

import debounce from "@/utils/debounce-raf";

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
    const endIndex = computed(() => {
      const targetIndex = startIndex.value + props.visibleRows;
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

        if (props.onScroll) {
          props.onScroll(e);
        }
      }
    });

    const Container = createElementVNode(props.as ?? "div", {
      class: props.class,
      onScroll: handleScroll,
      style: {
        display: "block",
        overflowY: "scroll",
        maxHeight: `${props.rowHeight * props.visibleRows}px`,
      },
    });

    return () => (
      // @ts-ignore
      <Container>
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
                style={{
                  display: "block",
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
