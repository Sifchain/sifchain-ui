import { defineComponent } from "vue";
import { AppCookies, NetworkEnv } from "@sifchain/sdk";

// This is for internal testing & development only.
// Once we release the ability to switch environments
// as a feature we can refactor this to look nice.
export default defineComponent({
  setup() {
    const appCookies = AppCookies();
    const env = appCookies.getEnv();

    if (typeof env === "undefined") {
      return () => null;
    }

    const networkEnv: NetworkEnv = env as NetworkEnv;

    const styles = {
      mainnet: "bg-green-500 text-white",
      devnet: "bg-cyan-500 text-white",
      testnet: "bg-yellow-500 text-white",
      staging: "bg-blue-500 text-white",
      localnet: "bg-orange-500 text-white",
      panel: "bg-red-500 text-white",
      tempnet: "bg-indigo-500 text-white",
    };

    const classesByNetworkEnv = {
      [NetworkEnv.MAINNET]: styles.mainnet,
      [NetworkEnv.LOCALNET]: styles.localnet,
      [NetworkEnv.TESTNET]: styles.testnet,
      [NetworkEnv.STAGING]: styles.staging,
      [NetworkEnv.DEVNET]: styles.devnet,
      [NetworkEnv.TEMPNET]: styles.tempnet,
    };

    const classNames = classesByNetworkEnv[networkEnv];

    const selected = networkEnv
      ? Object.entries(NetworkEnv).find((e) => e[1] === networkEnv)?.[0]
      : null;

    return () => (
      <div class="fixed bottom-0 left-4 h-6 w-36 overflow-hidden rounded-t shadow md:left-64">
        {selected && (
          <div
            class={[
              "grid h-full place-items-center font-semibold",
              classNames ?? "",
            ]}
          >
            {selected}
          </div>
        )}
        <select
          value={networkEnv}
          class={["absolute left-0 top-0 h-full w-full opacity-0"]}
          onInput={(e) => {
            appCookies.setEnv(
              (e.target as HTMLInputElement).value as NetworkEnv,
            );
            window.location.reload();
          }}
        >
          {Object.entries(NetworkEnv).map(([key, value]) => (
            <option
              class={[classNames, "p-2"]}
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
