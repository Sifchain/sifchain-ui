import { defineComponent } from "vue";

export default defineComponent({
  name: "Table",
  props: {
    data: {
      type: Array,
    },
    columns: {
      type: Array,
    },
  },
  setup() {
    return () => {
      return <div>Table</div>;
    };
  },
});
