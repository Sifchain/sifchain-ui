import { defineComponent } from "@vue/runtime-core";
import { ref } from "vue";
import { useRoute } from "vue-router";
import Modal from "@/components/Modal";
import router from "@/router";
import { ImportParams } from "./Main";

export default defineComponent({
  name: "ImportPendingModal",
  props: {},
  setup() {
    const route = useRoute();
    const importParams = route.query as ImportParams;
    return () => (
      <Modal
        showClose
        heading="Waiting For Confirmation"
        onClose={() => {
          router.replace({ name: "Balances" });
        }}
      >
        <h1>Design will be here!</h1>
      </Modal>
    );
  },
});
