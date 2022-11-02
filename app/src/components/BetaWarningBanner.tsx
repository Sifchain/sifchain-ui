import { defineComponent, ref } from "vue";
import AssetIcon from "./AssetIcon";

export default defineComponent({
  name: "BetaWarningBanner",
  setup() {
    const expandedRef = ref(false);

    return () => (
      <div
        class="absolute top-0 right-14 z-20 flex w-48 flex-col items-end drop-shadow-lg transition-all"
        style={{
          transform: `translateY(${
            expandedRef.value ? 0 : "calc(-100% + 40px)"
          })`,
        }}
      >
        <div class="bg-accent-gradient w-[80vw] max-w-[990px] rounded-bl p-[20px] text-sm">
          Welcome to our MainNet-Beta! We encourage you to first understand how
          everything works before transacting on the DEX, and to exercise
          caution at all times.{" "}
          <a
            class="underline"
            target="_blank"
            href="https://docs.sifchain.finance/network-security/betanet-launch"
          >
            Here's a list of security measures taken
          </a>
          , but please note that all transactions conducted are at your own
          risk.
        </div>
        <button
          class="bg-accent-accent_gradient_to flex h-[40px] items-center rounded-b px-[14px]"
          onClick={() => (expandedRef.value = !expandedRef.value)}
        >
          <AssetIcon
            icon={
              expandedRef.value
                ? "interactive/chevron-up"
                : "interactive/warning"
            }
            size={20}
            class="mr-[10px]"
          />
          MainNet-Beta
        </button>
      </div>
    );
  },
});
