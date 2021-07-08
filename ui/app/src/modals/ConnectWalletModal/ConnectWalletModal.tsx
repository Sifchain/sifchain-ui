import { defineComponent, PropType } from "vue";
import { effect } from "@vue/reactivity";
import { useCore } from "@/hooks/useCore";
import AssetIconVue from "@/componentsLegacy/utilities/AssetIcon.vue";

export type ConnectWalletModalProps = {
  closeOnSifchainConnect?: boolean;
  closeOnEthereumConnect?: boolean;
};

export default defineComponent({
  name: "ConnectWalletModal",
  props: {
    onClose: { type: Function as PropType<() => void>, required: true },
    closeOnSifchainConnect: {
      type: Boolean,
    },
    closeOnEthereumConnect: {
      type: Boolean,
    },
  },
  setup(props) {
    const { usecases, store } = useCore();

    effect(() => {
      if (props.closeOnSifchainConnect && store.wallet.sif.isConnected) {
        props.onClose();
      } else if (props.closeOnEthereumConnect && store.wallet.eth.isConnected) {
        props.onClose();
      }
    });

    return () => (
      <>
        <div class="bg-gray-base p-4">
          {!store.wallet.eth.isConnected ? (
            <button
              class="bg-accent-base h-[48px] text-white flex items-center justify-center rounded w-full"
              onClick={() => usecases.wallet.eth.connectToEthWallet()}
            >
              <img
                class="w-5 h-5 mr-1"
                src={require("@/assets/metamask.png")}
              />
              Connect Metamask
            </button>
          ) : (
            <>
              <p class="flex items-center">
                Metamask Connected{" "}
                <AssetIconVue icon="interactive/tick" class="w-3 h-3 ml-1" />
              </p>
              <div class="bg-black text-white relative h-[48px] rounded w-full overflow-hidden">
                <input
                  class="outline-none bg-transparent w-full h-full absolute left-0 top-0 border-none"
                  value={store.wallet.eth.address}
                  readonly
                  onClick={(e) =>
                    (e.target as HTMLInputElement).setSelectionRange(0, 99999)
                  }
                />
              </div>
            </>
          )}
        </div>
        <div class="bg-gray-base p-4 mt-[10px]">
          {!store.wallet.sif.isConnected ? (
            <button
              class="bg-accent-base h-[48px] text-white flex items-center justify-center rounded w-full"
              onClick={() => usecases.wallet.sif.connectToSifWallet()}
            >
              <img class="w-5 h-5 mr-1" src={require("@/assets/keplr.jpg")} />
              Connect Keplr
            </button>
          ) : (
            <>
              <p class="flex items-center">
                Keplr Connected{" "}
                <AssetIconVue icon="interactive/tick" class="w-3 h-3 ml-1" />
              </p>
              <div class="bg-black text-white relative h-[48px] rounded w-full overflow-hidden">
                <input
                  class="outline-none bg-transparent w-full h-full absolute left-0 top-0 border-none"
                  value={store.wallet.sif.address}
                  readonly
                  onClick={(e) =>
                    (e.target as HTMLInputElement).setSelectionRange(0, 99999)
                  }
                />
              </div>
            </>
          )}
        </div>

        {store.wallet.sif.isConnected && store.wallet.eth.isConnected && (
          <button
            class="mt-[10px] w-full h-[62px] rounded-[4px] bg-accent-gradient flex items-center justify-center font-sans text-[18px] font-semibold text-white"
            onClick={() => props.onClose()}
          >
            Done
          </button>
        )}
      </>
    );
  },
});
