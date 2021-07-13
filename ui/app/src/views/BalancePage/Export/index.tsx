import {
  computed,
  DefineComponent,
  defineComponent,
  watch,
  ComputedRef,
} from "vue";
import { RouteLocationRaw, useRoute } from "vue-router";
import { ExportStep, useExportData, getExportLocation } from "./useExportData";

import ExportSelect from "./Select";
import ExportConfirm from "./Confirm";
import ExportPending from "./Processing";
import Modal, { ModalProps } from "@/components/Modal";
import router from "@/router";
import { useTransactionDetails } from "@/hooks/useTransactionDetails";
import { useCore } from "@/hooks/useCore";

export default defineComponent({
  name: "ExportWrapper",
  props: {},
  setup() {
    const route = useRoute();
    const exportData = useExportData();

    watch(
      () => exportData.exportParams,
      (value) => {
        router.replace(
          getExportLocation(route.params.step as ExportStep, value),
        );
      },
      { deep: true },
    );

    const transactionDetails = useTransactionDetails({
      tx: exportData.transactionStatusRef,
    });

    const cancel = () => router.replace({ name: "Balances" });

    const stepDataRef = computed(() => {
      const heading = `Export ${exportData.exportParams.symbol.toUpperCase()} from Sifchain`;
      const steps = [
        {
          id: "select",
          Component: ExportSelect,
          modalProps: {
            heading,
            icon: "interactive/arrow-up",
            onClose: cancel,
          },
        },
        {
          id: "confirm",
          Component: ExportConfirm,
          modalProps: {
            heading,
            icon: "interactive/arrow-up",
            onClose: () =>
              router.replace(
                getExportLocation("select", exportData.exportParams),
              ),
          },
        },
        {
          id: "processing",
          Component: ExportPending,
          modalProps: {
            heading:
              transactionDetails.value?.heading || "Waiting for Confirmation",
            icon: "interactive/arrow-up",
            onClose: cancel,
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
          <Cmp exportData={exportData} />
        </Modal>
      );
    };
  },
});
