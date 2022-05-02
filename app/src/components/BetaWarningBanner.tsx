import { defineComponent, ref } from "vue";
import AssetIcon from "./AssetIcon";

export default defineComponent({
  name: "BetaWarningBanner",
  setup() {
    const expandedRef = ref(false);

    return () => (
      <div
        class="absolute top-0 right-14 z-20 hidden w-48 flex-col items-end drop-shadow-lg transition-all md:flex"
        style={{
          transform: `translateY(${
            expandedRef.value ? 0 : "calc(-100% + 40px)"
          })`,
        }}
      >
        <div class="bg-accent-gradient w-[80vw] max-w-[990px] rounded-bl p-[20px] text-sm">
          Welcome to our BetaNet! Please be aware that while this has passed
          several public security audits, it is still in Beta. We encourage you
          to first understand how it works before transacting on it and exercise
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
          BetaNet
        </button>
      </div>
    );
  },
});
