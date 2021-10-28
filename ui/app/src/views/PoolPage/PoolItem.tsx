import AssetIcon from "@/components/AssetIcon";
import { Button } from "@/components/Button/Button";
import { TokenIcon } from "@/components/TokenIcon";
import { formatAssetAmount } from "@/componentsLegacy/shared/utils";
import { prettyNumber } from "@/utils/prettyNumber";
import {
  Amount,
  AssetAmount,
  format,
  IAssetAmount,
  Network,
} from "@sifchain/sdk";
import { computed, defineComponent, PropType, ref } from "vue";
import { usePoolCalculator } from "@sifchain/sdk/src/usecases/clp/calculators/addLiquidityCalculator";
import {
  COLUMNS_LOOKUP,
  PoolDataItem,
  PoolRewardProgram,
} from "./usePoolPageData";
import { useUserPoolData } from "./useUserPoolData";
import { useChains } from "@/hooks/useChains";
import { useRowanPrice } from "@/componentsLegacy/RowanPrice/useRowanPrice";
import { getRewardProgramDisplayData } from "../RewardsPage/components/RewardSection";
import { Tooltip } from "@/components/Tooltip";
import {
  CompetitionsLookup,
  Competition,
  COMPETITION_TYPE_DISPLAY_DATA,
} from "../LeaderboardPage/useCompetitionData";
import { flagsStore } from "@/store/modules/flags";
import { RouterLink } from "vue-router";

export default defineComponent({
  name: "PoolItem",
  props: {
    pool: {
      type: Object as PropType<PoolDataItem["pool"]>,
      required: true,
    },
    poolStat: {
      type: Object as PropType<PoolDataItem["poolStat"]>,
      required: false,
    },
    accountPool: {
      type: Object as PropType<PoolDataItem["accountPool"]>,
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
      if (!this.accountPool || !this.poolStat) return;

      const externalAmount = AssetAmount(
        this.accountPool.lp.asset,
        this.accountPool.lp.externalAmount,
      );
      const nativeAmount = AssetAmount(
        useChains().get(Network.SIFCHAIN).nativeAsset,
        this.accountPool.lp.nativeAmount,
      );
      const formattedExternal = formatAssetAmount(externalAmount);
      const formattedNative = formatAssetAmount(nativeAmount);

      if (this.rowanPrice.isLoading.value) return "";

      return prettyNumber(
        parseFloat(formattedExternal) *
          parseFloat(this.poolStat.priceToken || "0") +
          parseFloat(formattedNative) *
            parseFloat(this.rowanPrice.data.value || "0"),
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
                  parseFloat(this.$props.poolStat?.priceToken || "0"),
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
          "Pool Depth USD",
          <span class="font-mono">
            {this.$props.poolStat?.poolDepth != null
              ? `${prettyNumber(
                  parseFloat(this.$props.poolStat?.poolDepth || "0"),
                )}`
              : "..."}
          </span>,
        ],
        [
          "Trade Volume 24hr",
          <span class="font-mono">
            {this.$props.poolStat?.volume != null
              ? prettyNumber(parseFloat(this.$props.poolStat?.volume || "0"))
              : "..."}
          </span>,
        ],
      ];
    },
  },

  render() {
    return (
      <div class="w-full py-[10px] border-dashed border-b border-white border-opacity-40 last:border-none group">
        <div
          onClick={() => this.toggleExpanded()}
          class="cursor-pointer font-mono w-full flex justify-between items-center font-medium h-[32px] font-sans group-hover:opacity-80"
        >
          <div class={["flex items-center", COLUMNS_LOOKUP.token.class]}>
            <TokenIcon assetValue={this.nativeAmount.asset} size={22} />
            <TokenIcon
              assetValue={this.externalAmount.asset}
              size={22}
              class="ml-[4px]"
            />
            <div class="ml-[10px] uppercase font-sans">
              ROWAN / {this.externalAmount.displaySymbol.toUpperCase()}
            </div>
            {this.externalAmount.asset.decommissioned &&
              this.externalAmount.asset.decommissionReason && (
                <Button.InlineHelp>
                  {this.externalAmount.asset.decommissionReason}
                </Button.InlineHelp>
              )}
            <div class="ml-[10px]" />
            {this.bonusRewardPrograms.map((program) => (
              <Tooltip
                content={
                  <div class="text-sm">
                    <span class="font-semibold">{program.displayName}</span>: +
                    {program.summaryAPY.toFixed(2)}% APY until{" "}
                    {new Date(program.endDateTimeISO).toLocaleDateString()}.
                    <br />
                    <div class="mt-[6px]">{program.description}</div>
                  </div>
                }
                key={program.rewardProgramName}
              >
                <AssetIcon
                  class="mr-[4px] opacity-70"
                  size={16}
                  icon={
                    getRewardProgramDisplayData(program.rewardProgramName).icon
                  }
                />
              </Tooltip>
            ))}
            {this.competitions.length > 0 && (
              <Tooltip
                content={
                  <div class="text-sm">
                    <div class="font-semibold text-md">
                      {this.competitions[0].displayName}
                    </div>

                    {this.competitions.map((competition) => (
                      <>
                        <div class="mt-[6px]">
                          {COMPETITION_TYPE_DISPLAY_DATA[
                            competition.type
                          ].title(competition)}{" "}
                          Competition
                        </div>
                        <ul
                          class="list-disc list-inside mt-[4px]"
                          style={{ listStyleType: "disc" }}
                        >
                          <li>
                            {prettyNumber(competition.rewardBucket, 0)}{" "}
                            {competition.rewardAsset.displaySymbol.toUpperCase()}{" "}
                            prize pool
                          </li>
                          <li>
                            Ends {competition.endDateTime.toLocaleDateString()}
                          </li>
                        </ul>
                      </>
                    ))}
                    <div class="mt-[6px]">
                      Click to see your ranking and prizes.
                    </div>
                  </div>
                }
              >
                <RouterLink
                  // @ts-ignore
                  onClick={(e: Event) => {
                    e.stopPropagation();
                  }}
                  to={{
                    name: "Leaderboard",
                    params: {
                      type: this.competitions[0].type,
                      symbol: this.competitions[0].symbol,
                    },
                  }}
                >
                  <AssetIcon
                    class="h-[16px] text-accent-base"
                    icon="interactive/wreath"
                  />
                </RouterLink>
              </Tooltip>
            )}
          </div>
          <div
            class={[
              COLUMNS_LOOKUP.totalAPY.class,
              "font-mono flex items-center",
            ]}
          >
            {this.$props.poolStat?.poolAPY != null
              ? `${(
                  parseFloat(this.$props.poolStat?.poolAPY || "0") +
                  parseFloat(this.$props.poolStat?.rewardAPY || "0")
                ).toFixed(2)}%`
              : "..."}
          </div>
          <div
            class={[
              COLUMNS_LOOKUP.userShare.class,
              "font-mono flex items-center",
            ]}
          >
            {!!this.userPoolData.myPoolShare?.value
              ? `${parseFloat(this.userPoolData.myPoolShare.value).toFixed(2)}%`
              : ""}
          </div>
          <div
            class={[
              COLUMNS_LOOKUP.userValue.class,
              "font-mono flex items-center",
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
              ></AssetIcon>
            </button>
          </div>
        </div>
        {this.expanded && (
          <section
            id={`expandable-${this.pool.symbol()}`}
            class={[
              "h-[193px] mt-[10px] p-[12px] flex flex-row justify-between bg-gray-base w-full rounded overflow-hidden pointer-events-none pointer-events-auto",
            ]}
          >
            <div class="w-[482px] rounded-sm border border-solid border-gray-input_outline align self-center">
              {this.details.map(([key, value], index) => (
                <div
                  key={index}
                  class="h-[28px] px-[6px] flex items-center justify-between text-sm font-medium border-b border-solid border-gray-input_outline last:border-none"
                >
                  <span>{key}</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
            <div class="p-[4px]">
              {!this.externalAmount.decommissioned && (
                <Button.Inline
                  to={{
                    name: "AddLiquidity",
                    params: {
                      externalAsset: this.externalAmount.symbol.toLowerCase(),
                    },
                  }}
                  replace
                  class="w-[140px] !bg-black !text-accent-base"
                  icon="interactive/plus"
                >
                  Add Liquidity
                </Button.Inline>
              )}
              {!!this.userPoolData.myPoolShare?.value && (
                <Button.Inline
                  to={{
                    name: "RemoveLiquidity",
                    params: {
                      externalAsset: this.externalAmount.symbol.toLowerCase(),
                    },
                  }}
                  replace
                  class="w-[140px] !bg-black !text-accent-base mt-[6px]"
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
