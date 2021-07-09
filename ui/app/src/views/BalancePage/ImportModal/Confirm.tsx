import { defineComponent } from "vue";
import { ref } from "vue";
import { useRoute } from "vue-router";
import Modal from "@/components/Modal";
import router from "@/router";
import { ImportParams } from "./Main";

export default defineComponent({
  name: "ImportConfirmModal",
  props: {},
  setup() {
    const route = useRoute();
    const importParams = route.query as ImportParams;

    return () => (
      <Modal
        heading="Confirm Import"
        showClose
        showBack
        onBack={() => {
          router.replace({ name: "Import", query: importParams });
        }}
        onClose={() => {
          router.replace({ name: "Balances" });
        }}
      >
        <button
          onClick={() => {
            router.replace({
              name: "ImportPending",
              query: importParams,
            });
          }}
        >
          Confirm
        </button>
      </Modal>
    );
  },
});
