<script lang="tsx">
import { defineComponent, useCssModule } from "vue";
import { AppCookies, SifEnv, sifEnvsByIndex } from "@sifchain/sdk";

// This is for internal testing & development only.
// Once we release the ability to switch environments
// as a feature we can refactor this to look nice.
export default defineComponent({
  setup() {
    const styles = useCssModule();
    let env = AppCookies().getEnv();

    const NoCookie = () => null;

    if (typeof env === "undefined") {
      return () => null;
    }

    let sifEnv: SifEnv = env as SifEnv;
    if (env && sifEnvsByIndex[+env]) {
      sifEnv = sifEnvsByIndex[+env];
    }

    const Cmp = () =>
      ({
        [SifEnv.MAINNET]: (
          <div class={[styles.panel, styles.mainnet]}>MAINNET</div>
        ),
        [SifEnv.TESTNET]: (
          <div class={[styles.panel, styles.testnet]}>TESTNET</div>
        ),
        [SifEnv.LOCALNET]: (
          <div class={[styles.panel, styles.localnet]}>LOCALNET</div>
        ),
        [SifEnv.DEVNET]: (
          <div class={[styles.panel, styles.devnet]}>DEVNET</div>
        ),
        [SifEnv.DEVNET_042]: (
          <div class={[styles.panel, styles.devnet]}>DEVNET_042</div>
        ),
      }[sifEnv] || <NoCookie />);

    return () => <Cmp />;
  },
});
</script>
<style lang="scss" module>
.panel {
  z-index: 100;
  position: fixed;
  top: 0;
  left: 0;
  background: white;
  font-family: "Inter", sans-serif;
  padding: 3px 6px;
  border-bottom-right-radius: 6px;
}
.mainnet {
  background: rgba(255, 38, 0, 0.5);
}
.testnet {
  background: rgba(255, 96, 228, 0.5);
}
.localnet {
  background: rgba(16, 227, 255, 0.5);
}
.devnet {
  background: rgba(255, 216, 41, 0.5);
}
</style>
