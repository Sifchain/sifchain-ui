// import { defineComponent, computed } from "vue";
// import { useRoute } from "vue-router";
// import { ImportStep, useImportData } from "./useImportData";

// import ImportSelect from "./Select";
// import ImportConfirm from "./Confirm";
// import ImportProcessing from "./Processing";

// const StepComponents = {
//   select: ImportSelect,
//   confirm: ImportConfirm,
//   processing: ImportProcessing,
// };

// export default defineComponent({
//   props: {},
//   setup() {
//     const route = useRoute();
//     const importData = useImportData();

//     const StepCmp = computed(
//       () => StepComponents[route.params.step as ImportStep],
//     );

//     return () => <StepCmp.value importData={importData} />;
//   },
// });
