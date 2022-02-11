<script lang="tsx">
import { defineComponent, onMounted, useCssModule } from "vue";
import { AppCookies, NetworkEnv, networkEnvsByIndex } from "@sifchain/sdk";

// This is for internal testing & development only.
// Once we release the ability to switch environments
// as a feature we can refactor this to look nice.
export default defineComponent({
  setup() {
    const styles = useCssModule();
    const appCookies = AppCookies();
    let env = appCookies.getEnv();

    if (typeof env === "undefined") {
      return () => null;
    }

    let networkEnv: NetworkEnv = env as NetworkEnv;
    if (env && networkEnvsByIndex[+env]) {
      networkEnv = networkEnvsByIndex[+env];
    }

    const classesByNetworkEnv = {
      [NetworkEnv.MAINNET]: styles.mainnet,
      [NetworkEnv.LOCALNET]: styles.localnet,
      [NetworkEnv.TESTNET]: styles.testnet,
      [NetworkEnv.TESTNET_042_IBC]: styles.testnet,
      [NetworkEnv.DEVNET]: styles.devnet,
      [NetworkEnv.DEVNET_042]: styles.devnet,
    };

    const classNames = classesByNetworkEnv[networkEnv];

    return () => (
      <div class="bottom-0 left-[240px] h-[30px] w-[150px] fixed rounded-t hidden overflow-hidden">
        {networkEnv && classNames ? (
          <div class={[styles.panel, classNames]}>
            {
              Object.entries(NetworkEnv).find((e) =>
                e[1] === networkEnv ? true : false,
              )?.[0]
            }
          </div>
        ) : null}
        <select
          value={networkEnv}
          class={["absolute left-0 top-0 w-full h-full opacity-0"]}
          onInput={(e) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            appCookies.setEnv(e.target.value);
            window.location.reload();
          }}
        >
          {Object.entries(NetworkEnv).map(([key, value]) => (
            <option
              selected={key === networkEnv.toLowerCase()}
              key={key}
              value={value}
            >
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
