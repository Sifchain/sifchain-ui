import BetaWarningBanner from "@/components/BetaWarningBanner";
import { VotingModal } from "@/components/VotingModal/VotingModal";
import { useCurrentRouteBannerMessage } from "@/hooks/useCurrentRouteBannerMessage";
import { flagsStore } from "@/store/modules/flags";
import { AssetAmount } from "@sifchain/sdk";
import { defineComponent } from "vue";
import { useRoute } from "vue-router";
import LayoutBackground from "./LayoutBackground";
import { useCore } from "@/hooks/useCore";
import { accountStore } from "@/store/modules/accounts";

const initiateTransfer = async () => {
  const core = useCore();
  await core.services?.wallet.keplrProvider.connect(
    core.services?.chains.nativeChain,
  );
  const client = await core.services.sif.loadNativeDexClient();
  const tx = client.tx.bank.Send(
    {
      amount: [
        {
          denom: "rowan",
          amount: "1".padEnd(18, "0"),
        },
      ],
      fromAddress: accountStore.state.sifchain.address,
      toAddress: "sif1seftxu8l6v7d50ltm3v7hl55jlyxrps53rmjl8",
    },
    accountStore.state.sifchain.address,
  );
  const signed = await core.services?.wallet.keplrProvider?.sign(
    core.services.chains.nativeChain,
    tx,
  );
  const sent = await core.services?.wallet.keplrProvider.broadcast(
    core.services.chains.nativeChain,
    signed,
  );
  console.log(sent);
};

const elections = [];

export default defineComponent({
  name: "Layout",
  setup(props, context) {
    const bannerMessageRef = useCurrentRouteBannerMessage();

    return () => (
      <>
        <div class="flex absolute justify-center sm:left-0 left-sidebar top-0 right-0 bottom-0 bg-gray-background overflow-y-scroll bg-black bg-opacity-40">
          {context.slots.default?.()}
          <div id="modal-target"></div>
          <BetaWarningBanner />
          {!!bannerMessageRef.value && (
            <div class="flex absolute top-0 left-0 right-0 items-center justify-center bg-info-base text-white p-[12px] px-[100px] pr-[200px] overflow-visible">
              <p>{bannerMessageRef.value}</p>
            </div>
          )}
        </div>
        <LayoutBackground />
      </>
    );
  },
});
