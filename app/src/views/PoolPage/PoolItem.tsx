import { AccountPool } from "@/business/store/pools";
import AssetIcon from "@/components/AssetIcon";
import { Button } from "@/components/Button/Button";
import { TokenIcon } from "@/components/TokenIcon";
import { TokenNetworkIcon } from "@/components/TokenNetworkIcon/TokenNetworkIcon";
import { formatAssetAmount } from "@/components/utils";
import { useChains, useNativeChain } from "@/hooks/useChains";
import { PoolStat } from "@/hooks/usePoolStats";
import { useRowanPrice } from "@/hooks/useRowanPrice";
import { isNil, isNilOrWhitespace } from "@/utils/assertion";
import { prettyNumber } from "@/utils/prettyNumber";
import { AssetAmount, IAssetAmount, Network, Pool } from "@sifchain/sdk";
import { LiquidityProviderData } from "@sifchain/sdk/build/typescript/generated/proto/sifnode/clp/v1/types";
import { computed, defineComponent, PropType } from "vue";
import {
  Competition,
  CompetitionsLookup,
} from "../LeaderboardPage/useCompetitionData";
import { COLUMNS_LOOKUP, PoolRewardProgram } from "./usePoolPageData";
import { useUserPoolData } from "./useUserPoolData";

export default defineComponent({
  name: "PoolItem",
  props: {
    unLockable: { type: Boolean, required: true },
    unlock: {
      type: Object as PropType<{
        nativeAssetAmount: string;
        externalAssetAmount: string;
        ready: boolean;
        eta?: string;
        expiration?: string;
        onRemoveRequest: () => any;
        isRemovalDisabled: boolean;
        isRemovalInProgress: boolean;
        onCancelRequest: () => any;
        isCancelDisabled: boolean;
        isCancelInProgress: boolean;
      }>,
      required: false,
    },
    currentRewardPeriod: {
      type: Object as PropType<
        | {
            endEta: string;
          }
        | undefined
      >,
      required: false,
    },
    pool: {
      type: Object as PropType<Pool>,
      required: true,
    },
    poolStat: {
      type: Object as PropType<PoolStat>,
      required: false,
    },
    accountPool: {
      type: Object as PropType<AccountPool>,
      required: false,
    },
    bonusRewardPrograms: {
      type: Array as PropType<PoolRewardProgram[]>,
      required: true,
    },
    competitionsLookup: {
      type: Object as PropType<CompetitionsLookup>,
      required: false,
    },
    liquidityProvider: {
      type: Object as PropType<LiquidityProviderData>,
      required: false,
    },
  },
  data() {
    return {
      expanded: false,
    };
  },
  setup(props) {
    return {
      userPoolData: useUserPoolData({
        externalAsset: computed(() => props.pool.externalAmount!.symbol),
      }),
      rowanPrice: useRowanPrice(),
    };
  },
  methods: {
    toggleExpanded() {
      this.expanded = !this.expanded;
    },
  },
  computed: {
    competitions(): Competition[] {
      return this.competitionsLookup
        ? (Object.values(this.competitionsLookup).filter(
            (item) => item != null,
          ) as Competition[])
        : [];
    },
    myPoolValue(): string | undefined {
      if (
        !this.accountPool ||
        !this.poolStat ||
        this.rowanPrice.isLoading.value
      )
        return;

      const externalAmount = AssetAmount(
        this.accountPool.lp.asset,
        this.accountPool.lp.externalAmount,
      ).toDerived();
      const nativeAmount = AssetAmount(
        useChains().get(Network.SIFCHAIN).nativeAsset,
        this.accountPool.lp.nativeAmount,
      ).toDerived();

      const nativeDollarAmount = nativeAmount.multiply(
        this.rowanPrice.data.value ?? 0,
      );
      const externalDollarAmount = externalAmount.multiply(
        this.poolStat.priceToken ?? 0,
      );

      return prettyNumber(
        nativeDollarAmount.add(externalDollarAmount).toNumber(),
      );
    },
    externalAmount(): IAssetAmount {
      return this.$props.pool.externalAmount!;
    },
    nativeAmount(): IAssetAmount {
      return this.$props.pool.nativeAmount!;
    },
    formattedPoolStat() {
      if (!this.$props.poolStat) return undefined;
    },
    details(): [string, JSX.Element][] {
      if (!this.expanded) return []; // don't compute unless expanded
      return [
        this.accountPool?.lp && [
          "Your Liquidity",
          <div class="flex items-center">
            {String(
              +formatAssetAmount(
                AssetAmount(
                  useNativeChain().nativeAsset,
                  this.accountPool.lp.nativeAmount,
                ),
              ),
            )}
            <TokenIcon
              assetValue={useNativeChain().nativeAsset}
              size={14}
              class="ml-[2px]"
            />
            ,<span class="ml-[4px]" />
            {String(
              +formatAssetAmount(
                AssetAmount(
                  this.accountPool.lp.asset,
                  this.accountPool.lp.externalAmount,
                ),
              ),
            )}
            <TokenIcon
              assetValue={this.accountPool.lp.asset}
              class="ml-[2px]"
              size={14}
            />
          </div>,
        ],
        [
          "Rewards paid to the pool for current period",
          <span class="flex items-center font-mono">
            {typeof this.poolStat?.rewardPeriodNativeDistributed === "number"
              ? (this.poolStat?.rewardPeriodNativeDistributed).toLocaleString()
              : "..."}
            <TokenIcon
              assetValue={useNativeChain().nativeAsset}
              size={14}
              class="ml-[3px]"
            />
          </span>,
        ],
        this.currentRewardPeriod !== undefined && [
          "Rewards time remaining for current period",
          <span class="font-mono">{this.currentRewardPeriod.endEta}</span>,
        ],
        [
          `Network Pooled ${this.externalAmount.displaySymbol.toUpperCase()}`,
          <span class="font-mono">
            {prettyNumber(+formatAssetAmount(this.externalAmount), 5)}
          </span>,
        ],
        [
          `Network Pooled ROWAN`,
          <span class="font-mono">
            {prettyNumber(+formatAssetAmount(this.nativeAmount), 5)}
          </span>,
        ],
        [
          `Price of Token USD`,
          <span class="font-mono">
            {this.$props.poolStat?.priceToken != null
              ? `$${prettyNumber(
                  parseFloat(
                    this.$props.poolStat?.priceToken.toString() || "0",
                  ),
                )}`
              : "..."}
          </span>,
        ],
        [
          "Arbitrage Opportunity",
          <span
            class={[
              "font-mono",
              this.$props.poolStat?.arb == null
                ? "text-gray-800"
                : +(this.$props.poolStat?.arb || 0) < 0
                ? "text-connected-base"
                : "text-danger-base",
            ]}
          >
            {this.$props.poolStat?.arb == null ? (
              "N/A"
            ) : (
              <>
                {Math.abs(+this.$props.poolStat?.arb).toFixed(3)}%{" "}
                <Button.InlineHelp class="!text-gray-600">
                  This is the arbitrage opportunity available based on a
                  differential between the price of this token on Sifchain and
                  its price on CoinMarketCap. If the percentage is green, it
                  means the token is currently cheaper in Sifchain than
                  CoinMarketCap.
                </Button.InlineHelp>
              </>
            )}
          </span>,
        ],
        [
          "Trade Volume 24hr",
          <span class="font-mono">
            {typeof this.$props.poolStat?.volume === "number"
              ? prettyNumber(this.$props.poolStat?.volume)
              : "..."}
          </span>,
        ],
      ].filter(Boolean) as [string, JSX.Element][];
    },
  },

  render() {
    const tableItemClass =
      "border-gray-input_outline flex h-[28px] items-center justify-between border-b border-solid px-[6px] text-sm font-medium last:border-none";

    return (
      <div class="group w-full border-b border-solid border-gray-200 border-opacity-80 py-[10px] align-middle last:border-none last:border-transparent">
        <div
          onClick={() => this.toggleExpanded()}
          class="flex h-[32px] w-full cursor-pointer items-center justify-between font-mono font-medium group-hover:opacity-80"
        >
          <div class={["flex items-center", COLUMNS_LOOKUP.token.class]}>
            <TokenIcon assetValue={this.nativeAmount.asset} size={22} />
            <TokenNetworkIcon
              assetValue={this.externalAmount.asset}
              size={22}
              class="ml-[4px]"
            />
            <div class="ml-[10px] font-sans uppercase">
              ROWAN / {this.externalAmount.displaySymbol.toUpperCase()}
            </div>
            {this.externalAmount.asset.decommissioned &&
              this.externalAmount.asset.decommissionReason && (
                <Button.InlineHelp>
                  {this.externalAmount.asset.decommissionReason}
                </Button.InlineHelp>
              )}
            <div class="ml-[10px]" />
          </div>
          <div
            class={[
              COLUMNS_LOOKUP.poolTvl.class,
              "flex items-center font-mono",
            ]}
          >
            {typeof this.$props.poolStat?.poolTVL === "number"
              ? this.$props.poolStat.poolTVL.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })
              : "..."}
          </div>
          <div
            class={[COLUMNS_LOOKUP.apy.class, "flex items-center font-mono"]}
          >
            {!isNil(this.$props.poolStat?.poolApr)
              ? `${(this.$props.poolStat?.poolApr ?? 0).toFixed(2)}%`
              : "..."}
          </div>
          <div
            class={[
              COLUMNS_LOOKUP.userShare.class,
              "flex items-center font-mono",
            ]}
          >
            {!!this.userPoolData.myPoolShare?.value
              ? `${parseFloat(this.userPoolData.myPoolShare.value).toFixed(2)}%`
              : ""}
          </div>
          <div
            class={[
              COLUMNS_LOOKUP.userValue.class,
              "flex items-center font-mono",
            ]}
          >
            {this.myPoolValue == null
              ? ""
              : !this.myPoolValue
              ? "..."
              : `$${this.myPoolValue}`}
          </div>
          <div class="flex flex-1 justify-end text-right">
            <button>
              <AssetIcon
                size={24}
                class={[
                  "text-accent-base transition-all",
                  this.expanded ? "rotate-180" : "rotate-0",
                ]}
                icon="interactive/chevron-down"
              />
            </button>
          </div>
        </div>
        {this.expanded && (
          <section
            id={`expandable-${this.pool.symbol()}`}
            class="bg-gray-base pointer-events-auto mt-[10px] flex w-full flex-row justify-between overflow-hidden rounded p-[12px]"
          >
            <div>
              <div class="border-gray-input_outline align w-[442px] self-center rounded-sm border border-solid">
                {this.details.map(([key, value], index) => (
                  <div
                    key={index}
                    class="border-gray-input_outline flex h-[28px] items-center justify-between border-b border-solid px-[6px] text-sm font-medium last:border-none"
                  >
                    <span>{key}</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
              {this.unlock !== undefined && (
                <section>
                  <header class="mt-2 mb-0.5">
                    <p class="text-md font-bold">Unbonding request</p>
                  </header>
                  <div class="border-gray-input_outline align w-[442px] self-center rounded-sm border border-solid">
                    <div class={tableItemClass}>
                      <span>Unbonding assets</span>
                      <span class="flex items-center">
                        {this.unlock.nativeAssetAmount}{" "}
                        <TokenIcon
                          assetValue={useNativeChain().nativeAsset}
                          size={14}
                          class="ml-[2px]"
                        />
                        , {this.unlock.externalAssetAmount}{" "}
                        <TokenIcon
                          assetValue={this.pool.externalAmount.asset}
                          size={14}
                          class="ml-[2px]"
                        />
                      </span>
                    </div>
                    {this.unlock.ready
                      ? !isNilOrWhitespace(this.unlock.expiration) && (
                          <div class={tableItemClass}>
                            <span>Estimated time remaining to claim</span>
                            <span>{this.unlock.expiration}</span>
                          </div>
                        )
                      : !isNilOrWhitespace(this.unlock.eta) && (
                          <div class={tableItemClass}>
                            <span>Estimated time remaining</span>
                            <span>{this.unlock.eta}</span>
                          </div>
                        )}
                    <div class="flex flex-row align-middle">
                      {this.$store.state.flags.liquidityUnlockCancellation && (
                        <Button.CallToActionSecondary
                          class="text-danger-base h-[36px] text-[14px] uppercase disabled:bg-inherit"
                          disabled={this.unlock.isCancelDisabled}
                          onClick={this.unlock.onCancelRequest}
                        >
                          {this.unlock.isCancelInProgress ? (
                            <AssetIcon
                              size={36}
                              icon="interactive/anim-racetrack-spinner"
                            />
                          ) : (
                            "Cancel"
                          )}
                        </Button.CallToActionSecondary>
                      )}
                      {this.unlock.ready && (
                        <Button.CallToActionSecondary
                          class="text-connected-base h-[36px] text-[14px] uppercase disabled:bg-inherit"
                          disabled={this.unlock.isRemovalDisabled}
                          onClick={this.unlock.onRemoveRequest}
                        >
                          {this.unlock.isRemovalInProgress ? (
                            <AssetIcon
                              size={36}
                              icon="interactive/anim-racetrack-spinner"
                            />
                          ) : (
                            "Claim"
                          )}
                        </Button.CallToActionSecondary>
                      )}
                    </div>
                  </div>
                </section>
              )}
            </div>
            <div class="p-[4px]">
              {!this.externalAmount.asset.decommissioned && (
                <Button.Inline
                  to={{
                    name: "AddLiquidity",
                    params: {
                      externalAsset: this.externalAmount.symbol.toLowerCase(),
                    },
                  }}
                  replace
                  class="!text-accent-base w-[140px] !bg-black"
                  icon="interactive/plus"
                >
                  Add Liquidity
                </Button.Inline>
              )}
              {this.$store.state.flags.newLiquidityUnlockProcess
                ? this.$props.unLockable && (
                    <Button.Inline
                      to={{
                        name: "UnbondLiquidity",
                        params: {
                          externalAsset:
                            this.externalAmount.symbol.toLowerCase(),
                        },
                      }}
                      replace
                      class="!text-accent-base mt-[6px] w-[140px] !bg-black"
                      icon="interactive/minus"
                    >
                      Unbond Liquidity
                    </Button.Inline>
                  )
                : !!this.userPoolData.myPoolShare?.value && (
                    <Button.Inline
                      to={{
                        name: "RemoveLiquidity",
                        params: {
                          externalAsset:
                            this.externalAmount.symbol.toLowerCase(),
                        },
                      }}
                      replace
                      class="!text-accent-base mt-[6px] w-[140px] !bg-black"
                      icon="interactive/minus"
                    >
                      Remove Liquidity
                    </Button.Inline>
                  )}
            </div>
          </section>
        )}
      </div>
    );
  },
});
