import { defineComponent } from "@vue/runtime-core";
import { ref } from "vue";
import router from "@/router";
import Modal from "@/components/Modal";

export default defineComponent({
  name: "ImportPendingModal",
  props: {},
  setup() {
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
