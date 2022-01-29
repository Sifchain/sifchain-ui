import { defineComponent } from "@vue/runtime-core";
import * as CLPV1Types from "@sifchain/sdk/src/generated/proto/sifnode/clp/v1/types";
import { PropType } from "vue";
import { useNativeChain } from "@/hooks/useChains";
import {
  AssetAmount,
  formatAssetAmount,
  IAsset,
  toBaseUnits,
} from "@sifchain/sdk";
import { Button } from "@/components/Button/Button";
import { TokenIcon } from "@/components/TokenIcon";
import { TokenNetworkIcon } from "@/components/TokenNetworkIcon/TokenNetworkIcon";
import { NativeDexClient } from "@sifchain/sdk/src/clients";
import { accountStore } from "@/store/modules/accounts";
import { useCore } from "@/hooks/useCore";

export const MarginPool = defineComponent({
  name: "MarginPool",
  props: {
    pool: {
      type: Object as PropType<CLPV1Types.Pool>,
      required: true,
    },
  },
  computed: {
    externalAsset(): IAsset {
      return useNativeChain().forceGetAsset(this.pool.externalAsset!.symbol);
    },
  },
  methods: {
    async openPosition() {
      const client = await NativeDexClient.connectByChain(useNativeChain());

      const rowan = useNativeChain().nativeAsset;
      let humanAmount = window.prompt(
        "Enter rowan amount to use as collateral",
      );
      debugger;
      if (!humanAmount) return;

      const amount = toBaseUnits(humanAmount, rowan);
      const txDraft = client.tx.margin.OpenLong(
        {
          signer: accountStore.state.sifchain.address,
          collateralAsset: "rowan",
          collateralAmount: amount,
          borrowAsset: this.externalAsset.symbol,
        },
        accountStore.state.sifchain.address,
      );
      try {
        const signedTx = await useCore().services.wallet.keplrProvider.sign(
          useNativeChain(),
          txDraft,
        );
        const sentTx = await useCore().services.wallet.keplrProvider.broadcast(
          useNativeChain(),
          signedTx,
        );
        const txStatus = client.parseTxResult(sentTx);
        console.log(sentTx, txStatus);
        if (txStatus.state !== "accepted") {
          useCore().services.bus.dispatch({
            type: "TransactionErrorEvent",
            payload: {
              txStatus,
              message: txStatus.memo || "There was an error removing liquidity",
            },
          });
        }
      } catch (error) {
        console.error(error);
      }
    },
  },
  render() {
    const asset = useNativeChain().forceGetAsset(
      this.pool.externalAsset!.symbol,
    );
    return (
      <div class="font-mono w-full p-2 mb-2 border border-opacity-50 border-solid border-white font-medium group-hover:opacity-80">
        <section class="flex justify-between">
          <div>
            <div class="flex items-center">
              <TokenIcon
                assetValue={useNativeChain().forceGetAsset("rowan")}
                size={22}
              />
              <TokenNetworkIcon assetValue={asset} size={22} class="ml-[4px]" />
              <div class="ml-[10px] uppercase font-sans ">
                <b>ROWAN / {asset.displaySymbol.toUpperCase()}</b>
              </div>
            </div>
            <div>
              {asset.displaySymbol.toUpperCase()} Liabilities:{" "}
              {formatAssetAmount(
                AssetAmount(asset, this.pool.externalLiabilities),
              )}
            </div>
            <div>
              {asset.displaySymbol.toUpperCase()} Custody:{" "}
              {this.pool.externalCustody}
            </div>
            <div>
              ROWAN Liabilities:{" "}
              {formatAssetAmount(
                AssetAmount("rowan", this.pool.nativeLiabilities),
              )}
            </div>
            <div>
              ROWAN Custody:{" "}
              {formatAssetAmount(AssetAmount("rowan", this.pool.nativeCustody))}
            </div>
            <div>Health: {this.pool.health}</div>
            <div>Interest Rate: {this.pool.interestRate}</div>
          </div>
          {!!accountStore.state.sifchain.address && (
            <div>
              <Button.Inline onClick={() => this.openPosition()}>
                + New Position
              </Button.Inline>
            </div>
          )}
        </section>
      </div>
    );
  },
});
