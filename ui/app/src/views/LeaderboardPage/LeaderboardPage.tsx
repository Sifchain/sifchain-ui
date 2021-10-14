import AssetIcon, { IconName } from "@/components/AssetIcon";
import { Button } from "@/components/Button/Button";
import PageCard from "@/components/PageCard";
import { Tooltip } from "@/components/Tooltip";
import Layout from "@/componentsLegacy/Layout/Layout";
import { useBoundRoute } from "@/hooks/useBoundRoute";
import {
  defineComponent,
  onMounted,
  onUnmounted,
  ref,
  TransitionGroup,
} from "vue";
import {
  CompetitionType,
  LeaderboardItem,
  useLeaderboardData,
  COMPETITION_TYPE_DISPLAY_DATA,
  Competition,
  COMPETITION_UNIVERSAL_SYMBOL,
  COMPETITIONS,
} from "./useCompetitionData";
import { LeaderboardRow } from "./children/LeaderboardRow";
import { LeaderboardPodium } from "./children/LeaderboardPodium";
import { RouterLink } from "vue-router";
import router from "@/router";
import {
  SelectDropdown,
  SelectDropdownOption,
} from "@/components/SelectDropdown";
import { Asset } from "@sifchain/sdk/src/generated/proto/sifnode/clp/v1/types";
import { useNativeChain } from "@/hooks/useChains";
import { TokenIcon } from "@/components/TokenIcon";
import { IAsset } from "@sifchain/sdk";

export default defineComponent({
  name: "LeaderboardPage",
  setup() {
    const symbolRef = ref(
      String(router.currentRoute.value.params.symbol || ""),
    );
    useBoundRoute({
      params: {
        symbol: symbolRef,
      },
      query: {},
    });

    const data = useLeaderboardData({
      symbol: symbolRef,
    });

    let fetchTimeoutId: NodeJS.Timeout;
    async function fetchLoop() {
      // Re-fetch on a loop, and immediately if cached
      [data.transactionRes, data.volumeRes, data.accountRes].forEach((res) => {
        if (!res.isLoading.value) res.reload.value();
      });

      // If user has tab open in background, don't refetch until they come back.
      if (document.visibilityState !== "visible") {
        document.addEventListener("visibilitychange", onVisibilityChange);
      } else {
        fetchTimeoutId = setTimeout(fetchLoop, 1 * 60 * 1000);
      }
    }
    function onVisibilityChange() {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      fetchLoop();
    }

    onMounted(() => {
      fetchLoop();
    });
    onUnmounted(() => {
      clearTimeout(fetchTimeoutId);
    });
    return { ...data, symbol: symbolRef };
  },
  data() {
    return {
      isSelectOpen: false,
    };
  },
  computed: {
    competitionSelectOptions(): SelectDropdownOption[] {
      return Object.keys(COMPETITIONS)
        .sort((a, b) => a.localeCompare(b))
        .map((key) => {
          const data = COMPETITIONS[key as keyof typeof COMPETITIONS];
          return {
            content: (
              <div class="flex items-center">
                {data.icon.type === "AssetIcon" ? (
                  <AssetIcon
                    icon={data.icon.icon as IconName}
                    size={24}
                    class="text-accent-base"
                  />
                ) : (
                  <TokenIcon
                    assetValue={useNativeChain().lookupAssetOrThrow(key)}
                    size={24}
                  />
                )}
                <div class="ml-[6px]">{data.displayName}</div>
              </div>
            ),
            value: key,
          };
        });
    },
    currentCompetition(): Competition | null {
      return (
        this.competitionsRes.data.value?.[
          this.symbol || COMPETITION_UNIVERSAL_SYMBOL
        ]?.[this.currentType] || null
      );
    },
    currentType(): CompetitionType {
      return router.currentRoute.value.params.type as CompetitionType;
    },
    currentKey(): string {
      return router.currentRoute.value.fullPath;
    },
    items(): LeaderboardItem[] {
      return (
        (this.currentType === "vol" ? this.volumeData : this.transactionData) ||
        []
      );
    },
    accountItem(): LeaderboardItem | null {
      return this.accountData?.[this.currentType] ?? null;
    },
    maximumRank(): number {
      return Math.max(
        this.items?.[this.items.length - 1]?.rank || 0,
        this.accountItem?.rank || 0,
      );
    },
    daysRemaining(): number {
      if (!this.currentCompetition) return 0;
      console.log(this.currentCompetition);
      return Math.max(
        0,
        Math.ceil(
          (this.currentCompetition?.endDateTime.getTime() - Date.now()) /
            (1000 * 60 * 60 * 24),
        ),
      );
    },
  },
  render() {
    if (this.isLoading) {
      return (
        <Layout>
          <div class="absolute left-0 top-[180px] w-full flex justify-center">
            <div class="flex items-center justify-center bg-black bg-opacity-50 rounded-lg h-[80px] w-[80px]">
              <AssetIcon icon="interactive/anim-racetrack-spinner" size={64} />
            </div>
          </div>
        </Layout>
      );
    }
    return (
      <Layout>
        <PageCard
          key={this.currentKey}
          heading={
            <SelectDropdown
              options={ref(this.competitionSelectOptions)}
              onChangeValue={(value: string) =>
                (this.symbol =
                  value === COMPETITION_UNIVERSAL_SYMBOL ? "" : value)
              }
              key={this.currentCompetition?.symbol}
              value={ref(
                this.currentCompetition?.symbol || COMPETITION_UNIVERSAL_SYMBOL,
              )}
              tooltipProps={{
                onShow: () => {
                  this.isSelectOpen = true;
                },
                onHide: () => {
                  this.isSelectOpen = false;
                },
              }}
            >
              <div
                class={[
                  "flex items-center cursor-pointer min-w-[350px]",
                  this.isSelectOpen ? "text-opacity-80" : "",
                ]}
              >
                {this.currentCompetition && (
                  <div class="flex items-center">
                    {this.currentCompetition?.iconType === "AssetIcon" ? (
                      <AssetIcon
                        icon={this.currentCompetition?.icon as IconName}
                        size={32}
                        class="text-accent-base"
                      />
                    ) : (
                      <TokenIcon
                        assetValue={this.currentCompetition?.icon as IAsset}
                        size={32}
                      />
                    )}
                    <div class="ml-[6px]">
                      {this.currentCompetition?.displayName}
                    </div>
                  </div>
                )}
                <AssetIcon
                  class={[
                    "ml-[6px] transition-all duration-100 flex-shrink-0 opacity-50",
                    this.isSelectOpen && "rotate-180",
                  ]}
                  size={24}
                  icon={"interactive/chevron-down"}
                />
              </div>
            </SelectDropdown>
          }
          headingClass={"!text-lg"}
          class="max-w-none w-[900px] rounded-tr-none"
          headerAction={
            !!this.currentCompetition && (
              <div class="flex items-center">
                <div class="mr-[84px] flex items-center">
                  <div class="text-accent-base">Days Remaining</div>
                  <div class="ml-[4px] bg-accent-base h-[25px] px-[8px] rounded-[20px] text-gray-300 flex items-center font-medium">
                    {this.daysRemaining}
                  </div>
                </div>
                <Button.Inline
                  style={{
                    textShadow: "0px 1px 1px rgba(0, 0, 0, 0.2)",
                  }}
                  iconClass="!w-[24px] !h-[24px]"
                  active
                  icon="navigation/swap"
                  to={{
                    name: "Swap",
                    query: {
                      ...(this.symbol && {
                        toSymbol: this.symbol,
                      }),
                    },
                  }}
                  class="!h-[48px] !text-lg !px-[16px]"
                >
                  Swap
                </Button.Inline>
              </div>
            )
          }
          withOverflowSpace
        >
          <div class="flex absolute bottom-[100%] left-0 right-0 flex items-center justify-end">
            <section class="flex items-center">
              {(["txn", "vol"] as Array<CompetitionType>).map((type) => (
                <RouterLink
                  to={{
                    name: "Leaderboard",
                    params: { type, symbol: this.symbol || "" },
                  }}
                  class={[
                    "cursor-pointer h-[32px] px-[30px] flex items-center text-bold rounded-t-sm ml-[1px]",
                    this.currentType === type
                      ? "text-accent-base bg-black"
                      : "bg-gray-300 text-gray-825 hover:opacity-80",
                  ]}
                >
                  {COMPETITION_TYPE_DISPLAY_DATA[type].title}
                  <Tooltip
                    content={COMPETITION_TYPE_DISPLAY_DATA[type].description}
                  >
                    <Button.InlineHelp
                      onClick={() =>
                        window.open(COMPETITION_TYPE_DISPLAY_DATA[type].link)
                      }
                    />
                  </Tooltip>
                </RouterLink>
              ))}
            </section>
          </div>
          <>
            <p class="mb-[24px] mt-[16px] w-[600px]">
              {this.currentCompetition!.description}
            </p>
            {this.items.length >= 3 && (
              <div class="flex items-end justify-around">
                {[this.items[1], this.items[0], this.items[2]].map((item) => (
                  <LeaderboardPodium
                    key={item.name}
                    item={item}
                    type={this.currentType}
                  />
                ))}
              </div>
            )}
            <div class="mt-[45px]" />
            {
              /* Show self-item if you're in top 3 or below top 15 */
              this.accountItem &&
                this.items &&
                (this.accountItem.rank >
                  this.items[this.items.length - 1].rank ||
                  this.accountItem.rank <= 3) && (
                  <LeaderboardRow
                    item={this.accountItem}
                    type={this.currentType}
                    maximumRank={this.maximumRank}
                    class="mb-[30px]"
                    isMyself
                  />
                )
            }
            <TransitionGroup name="flip-list" key={this.currentKey}>
              {(this.items.length > 3 ? this.items.slice(3) : this.items).map(
                (item) => {
                  return (
                    <LeaderboardRow
                      type={this.currentType}
                      key={item.name}
                      item={item}
                      maximumRank={this.maximumRank}
                      class="mb-[10px]"
                      isMyself={item.address === this.accountItem?.address}
                    />
                  );
                },
              )}
            </TransitionGroup>
          </>
          <div class="h-4" />
        </PageCard>
      </Layout>
    );
  },
});
