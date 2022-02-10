import { defineComponent, PropType } from "vue";

const required = <T,>(JsConstructor: any) => {
  return {
    type: JsConstructor as PropType<T>,
    required: true,
  };
};
fn.optional = <T, D = undefined>(
  name: string,
  JsConstructor: any,
  defaultValue?: D | ((...args: any[]) => D),
) => {
  const obj = {
    name,
    type: JsConstructor as PropType<T>,
    required: false,
    default: defaultValue,
  };
  return obj;
};
export const component = (...componentName: Parameters<typeof String.raw>) => {
  const str = String.raw(...componentName);
  return (prop: any) => {
    defineComponent({
      name: prop,
    });
    return (stuff: any) => {};
  };
};

component`PageCard`({
  screen: required<{
    orientation: `portrait` | `landscape`;
    width: number;
  }>(Object),
})({
  data: () => ({}),
  computed: {},
  render() {
    return <div>Hello.</div>;
  },
});
