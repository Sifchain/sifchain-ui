<script lang="tsx">
import { defineComponent, useCssModule } from "vue";
import { AppCookies, NetworkEnv } from "@sifchain/sdk";

// This is for internal testing & development only.
// Once we release the ability to switch environments
// as a feature we can refactor this to look nice.
export default defineComponent({
  setup() {
    const styles = useCssModule();
    const env = AppCookies().getEnv();

    const NoCookie = () => null;

    if (typeof env === "undefined") {
      return () => null;
    }

    const Component = () =>
      ({
        [NetworkEnv.MAINNET]: (
          <div class={[styles.panel, styles.mainnet]}>YOU ARE ON MAINNET!</div>
        ),
        [NetworkEnv.TESTNET]: (
          <div class={[styles.panel, styles.testnet]}>TESTNET</div>
        ),
        [NetworkEnv.LOCALNET]: (
          <div class={[styles.panel, styles.localnet]}>LOCALNET</div>
        ),
        [NetworkEnv.DEVNET]: (
          <div class={[styles.panel, styles.devnet]}>DEVNET</div>
        ),
      }[env] || <NoCookie />);

    return () => <Component />;
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
  min-width: 100px;
  border-radius: 5px;
}
.mainnet {
  background: rgb(255, 38, 0);
}
.testnet {
  background: rgb(255, 96, 228);
}
.localnet {
  background: rgb(16, 227, 255);
}
.devnet {
  background: rgb(255, 216, 41);
}
</style>
