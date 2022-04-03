import {
  computed,
  ComputedRef,
  createElementVNode,
  defineComponent,
  HTMLAttributes,
  onMounted,
  PropType,
  ref,
  VNodeTypes,
  watch,
} from "vue";
import AssetIcon from "../AssetIcon";

export default defineComponent({
  props: {
    data: {
      type: Object as PropType<ComputedRef<any[]>>,
      required: true,
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
    scrollContainerClass: {
      type: [String, Array] as PropType<HTMLAttributes["class"]>,
    },
    header: {
      type: Object as PropType<JSX.Element>,
    },
    emptyState: {
      type: Object as PropType<JSX.Element>,
    },
    paddingEnd: {
      type: Number,
      default: 2,
    },
    offsetTop: {
      type: Number,
      default: 0,
    },
  },
  setup(props) {
    const startIndex = ref(0);
    const lastIndex = computed(() => props.data.value.length - 1);
    const visibleRows = ref(props.visibleRows);

    const endIndex = computed(() => {
      const targetIndex = startIndex.value + visibleRows.value;
      return targetIndex >= lastIndex.value ? lastIndex.value : targetIndex;
    });

    const previousDataLength = ref(props.data.value.length);

    watch([props.data], () => {
      const prevLen = previousDataLength.value;
      previousDataLength.value = props.data.value.length;
      // reset start index on props.data change
      if (props.data.value.length !== prevLen) {
        startIndex.value = 0;
      }
    });

    const visible = computed(() =>
      props.data.value.slice(
        startIndex.value,
        endIndex.value + props.paddingEnd,
      ),
    );

    const isScrolling = ref(false);

    const handleScrollInner = (e: UIEvent) => {
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

      isScrolling.value = false;
    };

    const handleScroll = (e: UIEvent) => {
      isScrolling.value = true;
      handleScrollInner(e);
    };

    onMounted(() => {
      if (!visibleRows.value && !props.visibleRows) {
        // dynamically set visibleRows based on the screen height when a default value isn't present

        const maxHeight = document.body.clientHeight * 0.8 - props.offsetTop;
        visibleRows.value = Math.floor(maxHeight / props.rowHeight);

        window.addEventListener("resize", () => {
          visibleRows.value = Math.floor(maxHeight / props.rowHeight);
        });
      }
    });

    const maxHeight = computed(() => props.rowHeight * visibleRows.value);

    const Container = createElementVNode(props.as ?? "div");

    const spinner = (
      <AssetIcon icon="interactive/anim-racetrack-spinner" size={32} />
    );

    return () => (
      // @ts-ignore
      <Container class={[props.class]}>
        {!visible.value.length ? (
          props.emptyState
        ) : (
          <>
            {props.header && props.header}
            <div
              class={["block overflow-y-scroll", props.scrollContainerClass]}
              style={{ maxHeight: `${maxHeight.value}px` }}
              onScroll={handleScroll}
            >
              {Boolean(startIndex.value) && (
                <div
                  class="grid items-end"
                  style={{ height: `${props.rowHeight * startIndex.value}px` }}
                >
                  {isScrolling.value && (
                    <div class="grid place-items-center p-4">{spinner}</div>
                  )}
                </div>
              )}
              {visible.value.map(props.renderItem)}
              {endIndex.value < lastIndex.value && (
                <div
                  class="grid items-start"
                  style={{
                    height: `${
                      props.rowHeight * (lastIndex.value - endIndex.value)
                    }px`,
                  }}
                >
                  {isScrolling.value && (
                    <div class="grid place-items-center p-4">{spinner}</div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </Container>
    );
  },
});
