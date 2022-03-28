<template>
  <ModalView
    :requestClose="requestClose"
    :isOpen="isOpen"
    data-handle="confirmation-modal"
  >
    <div class="modal-inner">
      <ConfirmationModalAsk
        v-if="state === 'confirming'"
        @confirmed="$emit('confirmed')"
        :title="title"
        :confirmButtonText="confirmButtonText"
      >
        <template v-slot:body>
          <slot name="ConfirmStateEnum.Selecting"></slot>
        </template>
      </ConfirmationModalAsk>

      <ConfirmationModalSigning
        v-else
        :state="state"
        @closerequested="requestClose"
        :transactionHash="transactionHash"
        :transactionStateMsg="transactionStateMsg"
      >
        <template v-slot:signing>
          <slot :name="state ? 'signing' : 'common'"></slot>
        </template>

        <template v-slot:confirmed>
          <slot :name="state ? 'confirmed' : 'common'"></slot>
        </template>

        <template v-slot:rejected>
          <slot :name="state ? 'rejected' : 'common'"></slot>
        </template>

        <template v-slot:failed>
          <slot :name="state ? 'failed' : 'common'"></slot>
        </template>
        <template v-slot:out_of_gas>
          <slot :name="state ? 'out_of_gas' : 'common'"></slot>
        </template>
      </ConfirmationModalSigning>
    </div>
  </ModalView>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { computed } from "@vue/reactivity";
import ModalView from "@/componentsLegacy/ModalView/ModalView.vue";
import ConfirmationModalAsk from "@/componentsLegacy/ConfirmationModalAsk/ConfirmationModalAsk.vue";
import ConfirmationModalSigning from "@/componentsLegacy/ConfirmationModalSigning/ConfirmationModalSigning.vue";
import { ConfirmState, ConfirmStateEnum } from "../../types";

export default defineComponent({
  inheritAttrs: false,
  props: {
    // Function to request the window is closed this function must reset the confirmation state to selecting
    requestClose: Function,

    // Confirmation state: ConfirmStateEnum.Selecting | ConfirmStateEnum.Confirming | ConfirmStateEnum.Signing | "confirmed" | ConfirmStateEnum.Rejected | "failed";
    // This component acts on this state to determine which panel to show
    state: {
      type: String as PropType<ConfirmState>,
      default: ConfirmStateEnum.Confirming,
    },

    // The text on the 'confirm' button
    confirmButtonText: String,

    // The title of the ask modal
    title: String,

    // TODO: Revisit if we need these here or can make them part of the content
    transactionHash: String,
    transactionStateMsg: String,
  },

  setup(props) {
    const isOpen = computed(() => {
      return [
        ConfirmStateEnum.Approving,
        ConfirmStateEnum.Confirming,
        ConfirmStateEnum.Signing,
        "failed",
        ConfirmStateEnum.Rejected,
        "confirmed",
        "out_of_gas",
      ].includes(props.state);
    });

    return {
      isOpen,
    };
  },

  components: {
    ModalView,
    ConfirmationModalAsk,
    ConfirmationModalSigning,
  },
});
</script>

<style scoped lang="scss">
.modal-inner {
  display: flex;
  flex-direction: column;
  padding: 30px 20px 20px 20px;
  min-height: 50vh;
}
</style>
