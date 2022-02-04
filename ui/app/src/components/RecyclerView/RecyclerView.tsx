import {
  computed,
  createElementVNode,
  defineComponent,
  HTMLAttributes,
  PropType,
  ref,
  VNodeTypes,
} from "vue";

import { debounce } from "@/views/utils/debounce";

type Props<T = any> = {
  data: T[];
  rowHeight: number;
  visibleRows: number;
  renderItem(item: T): JSX.Element;
};

export default defineComponent({
  props: {
    data: {
      type: Array as PropType<Props["data"]>,
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
    renderItem: {
      type: Function as PropType<Props["renderItem"]>,
      default: () => <></>,
    },
    as: {
      type: String as PropType<VNodeTypes>,
    },
    class: {
      type: [String, Array] as PropType<HTMLAttributes["class"]>,
    },
  },
  setup(props) {
    const startIndex = ref(0);
    const lastIndex = props.data.length - 1;
    const endIndex = computed(() => {
      const targetIndex = startIndex.value + props.visibleRows;
      return targetIndex >= lastIndex ? lastIndex : targetIndex;
    });

    const visible = computed(() =>
      props.data.slice(startIndex.value, endIndex.value + 1),
    );

    const handleScroll = debounce((e: Event) => {
      const index = Math.floor(
        ((e.target as HTMLDivElement)?.scrollTop ?? 0) / props.rowHeight,
      );

      if (index !== startIndex.value) {
        startIndex.value = index;
      }
    }, 0);

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
        {startIndex.value > 0 && (
          <div style={{ height: `${props.rowHeight * startIndex.value}px` }} />
        )}
        {visible.value.map(props.renderItem)}
        {endIndex.value < lastIndex && (
          <div
            style={{
              display: "block",
              height: `${props.rowHeight * (lastIndex - endIndex.value)}px`,
            }}
          />
        )}
      </Container>
    );
  },
});
