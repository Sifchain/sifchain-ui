import { defineComponent, PropType } from "vue";
import Modal from "@/components/Modal";
import { reactive } from "@vue/reactivity";
import { IconName } from "@/componentsLegacy/utilities/AssetIcon";
import { IAsset } from "@sifchain/sdk";

export default defineComponent({
  name: "ImportModal",
  props: {
    asset: { type: Object as PropType<IAsset> },
    amount: { type: String },
    network: { type: String },
    onClose: { type: Function as PropType<() => void> },
  },
  setup(props) {
    return () => (
      <Modal
        iconName="interactive/arrow-down"
        heading={`Import ${props.asset?.name}`}
        onClose={() => props.onClose?.()}
      >
        <div />;
      </Modal>
    );
  },
});
