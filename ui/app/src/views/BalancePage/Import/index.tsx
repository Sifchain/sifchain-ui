import {
  computed,
  DefineComponent,
  defineComponent,
  watch,
  ComputedRef,
} from "vue";
import { RouteLocationRaw, useRoute } from "vue-router";
import { ImportStep, useImportData, getImportLocation } from "./useImportData";

import ImportSelect from "./Select";
import ImportConfirm from "./Confirm";
import ImportPending from "./Processing";
import Modal, { ModalProps } from "@/components/Modal";
import router from "@/router";
import { usePegEventDetails } from "@/hooks/useTransactionDetails";
import { useCore } from "@/hooks/useCore";

export default defineComponent({
  props: {},
  setup() {
    const route = useRoute();
    const importData = useImportData();

    watch(
      () => importData.importParams,
      (value) => {
        console.log("value", value);
        router.replace(
          getImportLocation(route.params.step as ImportStep, value),
        );
      },
      { deep: true },
    );

    const transactionDetails = usePegEventDetails({
      pegEvent: importData.pegEventRef,
    });

    const cancel = () => router.replace({ name: "Balances" });

    const stepDataRef = computed(() => {
      const steps = [
        {
          id: "select",
          Component: ImportSelect,
          modalProps: {
            heading: "Import Token to Sifchain",
            icon: "interactive/arrow-down",
          },
        },
        {
          id: "confirm",
          Component: ImportConfirm,
          modalProps: {
            heading: "Import Token to Sifchain",
            icon: "interactive/arrow-down",
          },
        },
        {
          id: "processing",
          Component: ImportPending,
          modalProps: {
            heading: transactionDetails.value?.heading,
            icon: "interactive/arrow-down",
          },
        },
      ];
      const stepId = route.params.step;
      return steps.find((step) => step.id === stepId) || steps[0];
    });

    return () => {
      let { id, Component, modalProps } = stepDataRef.value;
      const Cmp = Component as any;
      return (
        <Modal
          showClose={true}
          {...(modalProps as ModalProps)}
          onClose={cancel}
        >
          <Cmp importData={importData} />
        </Modal>
      );
    };
  },
});
