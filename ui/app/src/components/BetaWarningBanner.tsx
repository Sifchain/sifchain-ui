import { defineComponent, onMounted, onUnmounted, ref, watch } from "vue";
import AssetIcon from "./AssetIcon";

export default defineComponent({
  name: "BetaWarningBanner",
  props: {},
  setup() {
    const expandedRef = ref(false);

    return () => (
      <div
        class="absolute top-0 left-[20px] transition-all z-20 drop-shadow-lg"
        style={{
          transform: `translateY(${
            expandedRef.value ? 0 : "calc(-100% + 40px)"
          })`,
        }}
      >
        <div class="p-[20px] bg-accent-gradient text-sm w-[90vw] max-w-[990px] rounded-br">
          Welcome to our BetaNet! Please be aware that while this has passed
          several public security audits, it is still in Beta. We encourage you
          to first understand how it works before transacting on it and exercise
          caution at all times.{" "}
          <a
            class="underline"
            target="_blank"
            href="https://docs.sifchain.finance/resources/betanet-launch"
          >
            Here's a list of security measures taken
          </a>
          , but please note that all transactions conducted are at your own
          risk. This platform is not open to US users.
        </div>
        <button
          class="bg-accent-accent_gradient_to h-[40px] px-[14px] flex items-center rounded-b"
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
