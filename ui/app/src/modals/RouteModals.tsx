import { defineComponent, computed } from "vue";
import { IconName } from "@/componentsLegacy/utilities/AssetIcon";
import Modal from "@/components/Modal";
import { useSetupRouteModals } from "./hooks";

export default defineComponent({
  name: "RouteModal",
  setup() {
    const { state, closeRouteModal } = useSetupRouteModals();

    const currentRef = computed(() => state.stack[state.stack.length - 1]);
    const currentIndexRef = computed(() => state.stack.length - 1);

    return () =>
      !!currentRef.value && (
        <Modal
          heading={currentRef.value.definition.heading(currentRef.value.props)}
          icon={
            currentRef.value.definition.icon(currentRef.value.props) as IconName
          }
          showClose={currentIndexRef.value === 0}
          showBack={currentIndexRef.value > 0}
          onClose={() => {
            closeRouteModal(currentRef.value.id);
          }}
        >
          <currentRef.value.definition.Component
            {...currentRef.value.props}
            onClose={() => {
              closeRouteModal(currentRef.value.id);
            }}
          />
        </Modal>
      );
  },
});
