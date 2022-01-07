import { defineComponent, ref, onMounted, computed } from 'vue'
import { RowTemplate } from './TokenSelectDropdown'

export const VirtualScroller = defineComponent({
  name: 'VirtualScroller',
  props: {
    settings: {
      type: Object,
      required: true
    },
    get: {
      type: Function,
      required: true
    },
  },

  setup(props) {

    const viewportElement = ref(null)

    const viewportHeight = computed((): number => props.settings.amount * props.settings.itemHeight)

    const totalHeight = computed((): number =>
      (props.settings.maxIndex - props.settings.minIndex + 1) * props.settings.itemHeight)

    const toleranceHeight = computed((): number => props.settings.tolerance * props.settings.itemHeight)

    const bufferHeight = computed((): number =>
      viewportHeight.value + 2 * toleranceHeight.value)

    const bufferedItems = computed((): number => props.settings.amount + 2 * props.settings.tolerance
    )
    const itemsAbove = computed((): number =>
      props.settings.startIndex - props.settings.tolerance - props.settings.minIndex)

    const topPaddingHeight = ref<number>(itemsAbove.value * props.settings.itemHeight)

    const bottomPaddingHeight = ref<number>(totalHeight.value - topPaddingHeight.value)

    const initialPosition = computed((): number => topPaddingHeight.value + toleranceHeight.value
    )

    const data = ref([])

    const runScroller = ({ target: { scrollTop } }) => {
      const index = props.settings.minIndex + Math.floor((scrollTop - toleranceHeight.value) / props.settings.itemHeight)

      data.value = props.get(index, bufferedItems.value)
      topPaddingHeight.value = Math.max((index - props.settings.minIndex) * props.settings.itemHeight, 0)
      bottomPaddingHeight.value = Math.max(totalHeight.value - topPaddingHeight.value - data.length * props.settings.itemHeight, 0)
    }


    onMounted(() => {
      viewportElement.value.scrollTop = initialPosition.value
      runScroller({ target: { scrollTop: 0 } })
    });

    return () => (
      <div ref={viewportElement} class='viewport' style={{ height: viewportHeight.value }} onScroll={runScroller}>
        <ul>
          <div style={{ height: topPaddingHeight.value }}></div>
          {data.value.map((item) => (<RowTemplate item={item} />))}
          <div style={{ height: bottomPaddingHeight.value }}></div>
        </ul>
      </div>
    )
  },
})
