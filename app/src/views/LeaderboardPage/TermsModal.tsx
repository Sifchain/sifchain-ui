import Modal from "@/components/Modal";
import { defineComponent, PropType } from "@vue/runtime-core";

export default defineComponent({
  name: "TermsModal",
  props: {
    onAgree: {
      type: Function as PropType<() => void>,
      required: true,
    },
  },
  data() {
    return {
      isAgreed: false,
    };
  },
  methods: {
    agree() {
      this.isAgreed = true;
      setTimeout(() => {
        this.onAgree();
      }, 50);
    },
  },
  render() {
    return (
      <Modal
        showClose={false}
        backdropClickToClose={false}
        heading="Competition Terms and Conditions"
        icon="interactive/check"
        onClose={() => {}}
      >
        <p class="text-md">
          <a
            class="underline text-accent-base"
            href="https://forms.gle/CKUEtz7P4H2PCnJd9"
            rel="noopener noreferrer"
            target="_blank"
          >
            Navigate here
          </a>{" "}
          to accept the terms and conditions for this event.
          <br />
          <br /> Agreement with these terms are required to participate,
          including receiving rewards. Participation without accepting the
          waiver will exclude you from receiving rewards.
        </p>
        <br />
        <label
          class="flex items-center px-[16px] font-medium h-[48px] cursor-pointer"
          onClick={() => this.agree()}
        >
          <div
            class={[
              "w-[16px] h-[16px] transition-all border border-solid border-2 rounded-sm border-accent-base transition-all duration-500 mr-[6px] flex items-center justify-center",
            ]}
          >
            {this.isAgreed && "✓"}
          </div>
          I have reviewed the terms & conditions and provided my responses.
        </label>
      </Modal>
    );
  },
});
