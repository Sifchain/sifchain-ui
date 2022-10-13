import Modal from "~/components/Modal";
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
            class="text-accent-base underline"
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
          class="flex h-[48px] cursor-pointer items-center px-[16px] font-medium"
          onClick={() => this.agree()}
        >
          <div
            class={[
              "border-accent-base mr-[6px] flex h-[16px] w-[16px] items-center justify-center rounded-sm border border-solid transition-all duration-500",
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
