import Loader from "./Loader.vue";

export default {
  title: "Loader",
  component: Loader,
};

const Template = (args: any) => ({
  props: [""],
  components: { Loader },
  setup() {
    return { args };
  },
  template: '<Loader v-bind="args" />',
});

export const Standard = Template.bind({});
Standard.args = {};
