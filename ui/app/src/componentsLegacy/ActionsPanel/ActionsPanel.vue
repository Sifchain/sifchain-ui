<script lang="ts">
import { defineComponent, PropType } from "vue";
import WithWallet from "@/componentsLegacy/WithWallet/WithWallet.vue";
import SifButton from "@/componentsLegacy/SifButton/SifButton.vue";
import Icon from "@/componentsLegacy/Icon/Icon.vue";

export default defineComponent({
  components: {
    WithWallet,
    SifButton,
  },
  props: {
    nextStepAllowed: Boolean,
    nextStepMessage: String,
    connectType: String as PropType<
      "connectToAny" | "connectToAll" | "connectToSif"
    >,
  },
  emits: ["nextstepclick"],
  setup(_, { emit }) {
    return {
      handleNextStepClicked() {
        emit("nextstepclick");
      },
    };
  },
});
</script>

<template>
  <div class="actions">
    <WithWallet :connectType="connectType">
      <template v-slot:disconnected="{ requestDialog, connectCta }">
        <SifButton primary block @click="requestDialog">
          {{ connectCta }}
        </SifButton>
      </template>
      <template v-slot:connected
        ><div>
          <SifButton
            v-if="nextStepMessage"
            data-handle="actions-go"
            block
            primary
            :disabled="!nextStepAllowed"
            @click="handleNextStepClicked"
          >
            {{ nextStepMessage }}
          </SifButton>
        </div></template
      >
    </WithWallet>
  </div>
</template>

<style lang="scss" scoped>
.actions {
  padding-top: 1rem;
}
.wallet-status {
  font-size: $fs_sm;
}
</style>
