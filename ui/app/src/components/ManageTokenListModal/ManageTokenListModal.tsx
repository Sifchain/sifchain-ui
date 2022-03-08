import { defineComponent } from "vue";
import Modal from "../Modal";

const TokenListManager = defineComponent({
  name: "TokenListManager",

  methods: {},
  setup(props) {
    return () => (
      <Modal
        onClose={() => {}}
        heading="Manage"
        icon="interactive/ticket"
        showClose={true}
        class="max-w-[700px] w-[70vw] mt-[-300px]"
      >
        <div class="flex flex-col"></div>
      </Modal>
    );
  },
});

export default TokenListManager;
