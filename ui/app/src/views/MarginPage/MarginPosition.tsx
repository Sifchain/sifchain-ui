import { defineComponent, PropType } from "vue";

import * as MarginV1Types from "@sifchain/sdk/src/generated/proto/sifnode/margin/v1/types";
import * as CLPV1Types from "@sifchain/sdk/src/generated/proto/sifnode/clp/v1/types";
import {
  AssetAmount,
  createSdk,
  formatAssetAmount,
  IAssetAmount,
  NetworkEnv,
} from "@sifchain/sdk";
import { TokenNetworkIcon } from "@/components/TokenNetworkIcon/TokenNetworkIcon";
import { POSITION_COLUMNS_BY_ID } from "./data";
import { Pool } from "@sifchain/sdk/src/generated/proto/sifnode/clp/v1/types";
import { useNativeChain } from "@/hooks/useChains";
import { marginStore } from "@/store/modules/margin";

import { Pool as SdkPool } from "@sifchain/sdk";
import { NativeDexClient } from "@sifchain/sdk/src/clients";
import { accountStore } from "@/store/modules/accounts";
import { useCore } from "@/hooks/useCore";
import { Button } from "@/components/Button/Button";

const sdk = createSdk({
  environment: NetworkEnv.DEVNET,
});

export const MarginPosition = defineComponent({
  props: {
    position: {
      type: Object as PropType<MarginV1Types.MTP>,
      required: true,
    },
  },
  methods: {
    async closePosition() {
      const client = await NativeDexClient.connectByChain(useNativeChain());

      const txDraft = client.tx.margin.Close(
        {
          signer: accountStore.state.sifchain.address,
          id: this.position.id,
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
        } else {
          marginStore.fetchAccountPositions();
          useCore().services.bus.dispatch({
            type: "SuccessEvent",
            payload: {
              message: `${this.custodyAssetAmount.displaySymbol.toUpperCase()} Position Closed`,
            },
          });
        }
      } catch (error) {
        console.error(error);
      }
    },
  },
  computed: {
    collateralAssetAmount(): IAssetAmount {
      return AssetAmount(
        this.position.collateralAsset,
        this.position.collateralAmount,
      );
    },
    custodyAssetAmount(): IAssetAmount {
      return AssetAmount(
        this.position.custodyAsset,
        this.position.custodyAmount,
      );
    },
    liabilitiesPAssetAmount(): IAssetAmount {
      return AssetAmount(
        this.position.custodyAsset,
        this.position.liabilitiesP,
      );
    },
    pnl(): IAssetAmount {
      if (!marginStore.getters.stablePool) return AssetAmount("cusdt", "0");

      const stableAsset = useNativeChain().forceGetAsset(
        marginStore.getters.stablePool.externalAsset!.symbol,
      );
      const poolEntities = marginStore.getters.poolEntities;

      const collateralUsdQuote = sdk.liquidity.swap.createSwapQuote({
        fromAmount: this.collateralAssetAmount,
        ...sdk.liquidity.swap.findSwapFromToPool({
          fromAsset: this.collateralAssetAmount,
          toAsset: stableAsset,
          pools: poolEntities,
        }),
      });
      const liabilitiesUsdQuote = sdk.liquidity.swap.createSwapQuote({
        fromAmount: this.liabilitiesPAssetAmount,
        ...sdk.liquidity.swap.findSwapFromToPool({
          fromAsset: this.liabilitiesPAssetAmount,
          toAsset: stableAsset,
          pools: poolEntities,
        }),
      });
      const custodyUsdQuote = sdk.liquidity.swap.createSwapQuote({
        fromAmount: this.custodyAssetAmount,
        ...sdk.liquidity.swap.findSwapFromToPool({
          fromAsset: this.custodyAssetAmount,
          toAsset: stableAsset,
          pools: poolEntities,
        }),
      });

      // CustodyAmount / (LiabilitiesP + CollateralAmount )
      return AssetAmount(
        useNativeChain().forceGetAsset(
          marginStore.getters.stablePool.externalAsset!.symbol,
        ),
        custodyUsdQuote.toAmount.amount.divide(
          liabilitiesUsdQuote.toAmount.amount.add(
            collateralUsdQuote.toAmount.amount,
          ),
        ),
      );
    },
  },
  render() {
    return (
      <div class="font-mono w-full py-2 border-bottom border-solid border-opacity-50 font-medium group-hover:opacity-80">
        <div class="flex items-center">
          <div
            class={["flex items-center", POSITION_COLUMNS_BY_ID.asset.class]}
          >
            <TokenNetworkIcon
              assetValue={this.custodyAssetAmount.asset}
              size={22}
            />
            <div class="ml-[4px]">
              {this.custodyAssetAmount.displaySymbol.toUpperCase()}
            </div>
          </div>
          <div class={["flex items-center", POSITION_COLUMNS_BY_ID.side.class]}>
            <span class="text-connected-base">Long</span>{" "}
          </div>
          <div class={["flex items-center", POSITION_COLUMNS_BY_ID.size.class]}>
            {formatAssetAmount(this.custodyAssetAmount)}
          </div>
          <div class={["flex items-center", POSITION_COLUMNS_BY_ID.pnl.class]}>
            ~${formatAssetAmount(this.pnl)}{" "}
          </div>
          <div
            class={[
              "flex items-center justify-end",
              POSITION_COLUMNS_BY_ID.actions.class,
            ]}
          >
            <Button.Inline onClick={() => this.closePosition()}>
              Close
            </Button.Inline>
          </div>
        </div>
        {/* <div> */}
        {/*   {asset.displaySymbol.toUpperCase()} Liabilities:{" "} */}
        {/*   {formatAssetAmount( */}
        {/*     AssetAmount(asset, pool.externalLiabilities), */}
        {/*   )} */}
        {/* </div> */}
        {/* <div> */}
        {/*   {asset.displaySymbol.toUpperCase()} Custody:{" "} */}
        {/*   {pool.externalCustody} */}
        {/* </div> */}
        {/* <div> */}
        {/*   ROWAN Liabilities:{" "} */}
        {/*   {formatAssetAmount( */}
        {/*     AssetAmount("rowan", pool.nativeLiabilities), */}
        {/*   )} */}
        {/* </div> */}
        {/* <div> */}
        {/*   ROWAN Custody:{" "} */}
        {/*   {formatAssetAmount( */}
        {/*     AssetAmount("rowan", pool.nativeCustody), */}
        {/*   )} */}
        {/* </div> */}
        {/* <div>Health: {pool.health}</div> */}
        {/* <div>Interest Rate: {pool.interestRate}</div> */}
      </div>
    );
  },
});
