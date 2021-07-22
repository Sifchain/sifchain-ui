import { defineComponent, computed } from "vue";
import { useRoute } from "vue-router";
import { ExportStep, useExportData, getExportLocation } from "./useExportData";

import ExportSelect from "./Select";
import ExportConfirm from "./Confirm";
import ExportProcessing from "./Processing";

const StepComponents = {
  select: ExportSelect,
  confirm: ExportConfirm,
  processing: ExportProcessing,
};

export default defineComponent({
  props: {},
  setup() {
    const route = useRoute();
    const exportData = useExportData();

    const StepCmp = computed(
      () => StepComponents[route.params.step as ExportStep],
    );

    return () => <StepCmp.value exportData={exportData} />;
  },
});
