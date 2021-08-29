<script lang="tsx">
import { defineComponent, useCssModule } from "vue";
import { AppCookies, NetworkEnv, networkEnvsByIndex } from "@sifchain/sdk";

// This is for internal testing & development only.
// Once we release the ability to switch environments
// as a feature we can refactor this to look nice.
export default defineComponent({
  setup() {
    const styles = useCssModule();
    const appCookies = AppCookies();
    let env = appCookies.getEnv();

    const NoCookie = () => null;

    if (typeof env === "undefined") {
      return () => null;
    }

    let networkEnv: NetworkEnv = env as NetworkEnv;
    if (env && networkEnvsByIndex[+env]) {
      networkEnv = networkEnvsByIndex[+env];
    }

    const Cmp = () =>
      ({
        [NetworkEnv.MAINNET]: (
          <div class={[styles.panel, styles.mainnet]}>MAINNET</div>
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
        [NetworkEnv.DEVNET_042]: (
          <div class={[styles.panel, styles.devnet]}>DEVNET_042</div>
        ),
        [NetworkEnv.TESTNET_042_IBC]: (
          <div class={[styles.panel, styles.devnet]}>TESTNET_042_IBC</div>
        ),
      }[networkEnv] || <NoCookie />);

    return () => (
      <div class="bottom-0 left-[240px] h-[30px] w-[150px] fixed rounded-t overflow-hidden">
        <Cmp />
        <select
          class={["absolute left-0 top-0 w-full h-full opacity-0"]}
          value={env}
          onInput={(e) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            appCookies.setEnv(NetworkEnv[e.target.value]);
            window.location.reload();
          }}
        >
          {Object.keys(NetworkEnv).map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
      </div>
    );
  },
});
</script>
<style lang="scss" module>
.panel {
  z-index: 100;
  width: 100%;
  height: 100%;
  background: white;
  font-family: "Inter", sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
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
