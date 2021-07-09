import { computed, DefineComponent, defineComponent } from "vue";
import { RouteLocationRaw, useRoute } from "vue-router";
import { ImportStep, useImportData, getImportLocation } from "./useImportData";

import ImportSelect from "./Select";
import ImportConfirm from "./Confirm";
import ImportPending from "./Pending";
import Modal, { ModalProps } from "@/components/Modal";
import router from "@/router";

export default defineComponent({
  props: {},
  setup() {
    const route = useRoute();
    const importData = useImportData();

    const cancel = () => router.replace({ name: "Balances" });

    const steps: Array<{
      id: ImportStep;
      Component: DefineComponent | Function;
      modalProps: ModalProps;
    }> = [
      {
        id: "select",
        Component: ImportSelect,
        modalProps: {
          heading: "Import Token",
          icon: "interactive/arrow-down",
        },
      },
      {
        id: "confirm",
        Component: ImportConfirm,
        modalProps: {
          heading: "Import Token to Sifchain",
          showBack: true,
          onBack: () =>
            router.replace(
              getImportLocation("select", importData.importParams),
            ),
        },
      },
      {
        id: "pending",
        Component: ImportPending,
        modalProps: {
          heading: "Awaiting Import Confirmation",
          icon: "interactive/arrow-down",
        },
      },
    ];

    const stepIdRef = computed(() => String(route.params.step || "select"));

    const stepDataRef = computed(
      () => steps.find((step) => step.id === stepIdRef.value) || steps[0],
    );

    return () => {
      let { id, Component, modalProps } = stepDataRef.value;
      const Cmp = Component as any;
      return (
        <Modal {...modalProps} onClose={cancel}>
          <Cmp importData={importData} />
        </Modal>
      );
    };
  },
});
