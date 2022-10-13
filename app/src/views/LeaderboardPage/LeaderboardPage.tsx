import { IAsset } from "@sifchain/sdk";
import {
  defineComponent,
  onMounted,
  onUnmounted,
  ref,
  TransitionGroup,
} from "vue";
import { RouterLink } from "vue-router";

import AssetIcon, { IconName } from "~/components/AssetIcon";
import { Button } from "~/components/Button/Button";
import Layout from "~/components/Layout";
import PageCard from "~/components/PageCard";
import {
  SelectDropdown,
  SelectDropdownOption,
} from "~/components/SelectDropdown";
import { TokenIcon } from "~/components/TokenIcon";
import { Tooltip } from "~/components/Tooltip";
import { useBoundRoute } from "~/hooks/useBoundRoute";
import { useNativeChain } from "~/hooks/useChains";
import { useCore } from "~/hooks/useCore";
import router from "~/router";
import { LeaderboardPodium } from "./children/LeaderboardPodium";
import { LeaderboardRow } from "./children/LeaderboardRow";
import { getCompetitionPrizeDistributionByRank } from "./getCompetitionPrizeDistribution";
import TermsModal from "./TermsModal";
import {
  Competition,
  COMPETITIONS,
  CompetitionType,
  COMPETITION_TYPE_DISPLAY_DATA,
  COMPETITION_UNIVERSAL_SYMBOL,
  LeaderboardItem,
  useLeaderboardData,
} from "./useCompetitionData";

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
    const hasAgreed = useCore().services.storage.getJSONItem<boolean>(
      "leaderboard_toc_agreed",
    );
    return {
      isSelectOpen: false,
      hasAgreed,
      isAgreeModalOpen: !hasAgreed,
    };
  },
  methods: {
    setAgreed(agreed: boolean) {
      this.hasAgreed = agreed;
      useCore().services.storage.setJSONItem<boolean>(
        "leaderboard_toc_agreed",
        agreed,
      );
    },
  },
  watch: {
    availableCompetitions(competitions: Competition[]) {
      const availableTypes = competitions.map((c) => c.type);
      if (
        !availableTypes.includes(
          router.currentRoute.value.params.type as CompetitionType,
        )
      ) {
        router.replace({
          name: "Leaderboard",
          params: {
            type: availableTypes[0],
            symbol: this.symbol || "",
          },
        });
      }
    },
  },
  computed: {
    isDataReady(): boolean {
      return Boolean(this.hasAgreed && !this.isLoading);
    },
    availableCompetitions(): Competition[] {
      return Object.values(
        this.competitionsRes.data.value?.[
          this.symbol || COMPETITION_UNIVERSAL_SYMBOL
        ] || {},
      ).filter((item) => item != null) as Competition[];
    },
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
                <div class="ml-[8px]">{data.displayName}</div>
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
    prizeDistributionByRank(): Map<number, number> {
      if (!this.items.length || !this.currentCompetition) {
        return new Map();
      }
      return getCompetitionPrizeDistributionByRank(
        this.currentCompetition,
        this.items,
      );
    },
  },
  render() {
    if (this.isLoading) {
      return (
        <Layout>
          <div class="absolute left-0 top-[180px] flex w-full justify-center">
            <div class="flex h-[80px] w-[80px] items-center justify-center rounded-lg bg-black bg-opacity-50">
              <AssetIcon icon="interactive/anim-racetrack-spinner" size={64} />
            </div>
          </div>
        </Layout>
      );
    }
    return (
      <Layout>
        {this.isAgreeModalOpen && (
          <TermsModal
            onAgree={() => {
              this.setAgreed(true);
              this.isAgreeModalOpen = false;
            }}
          />
        )}
        <PageCard
          key={this.currentKey}
          heading={(() => {
            if (!this.currentCompetition) return <div />;
            const heading = (
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
                <Button.InlineHelp>
                  {this.currentCompetition?.description}
                </Button.InlineHelp>
              </div>
            );
            if (this.competitionSelectOptions.length === 1) return heading;
            return (
              <SelectDropdown
                options={ref(this.competitionSelectOptions)}
                onChangeValue={(value: string) =>
                  (this.symbol =
                    value === COMPETITION_UNIVERSAL_SYMBOL ? "" : value)
                }
                key={this.currentCompetition?.symbol}
                value={ref(
                  this.currentCompetition?.symbol ||
                    COMPETITION_UNIVERSAL_SYMBOL,
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
                    "flex min-w-[350px] cursor-pointer items-center",
                    this.isSelectOpen ? "text-opacity-80" : "",
                  ]}
                >
                  {heading}
                  <AssetIcon
                    class={[
                      "ml-[6px] flex-shrink-0 opacity-50 transition-all duration-100",
                      this.isSelectOpen && "rotate-180",
                    ]}
                    size={24}
                    icon={"interactive/chevron-down"}
                  />
                </div>
              </SelectDropdown>
            );
          })()}
          headingClass={"!text-lg"}
          class={[
            "w-[950px] max-w-none rounded-t-none",
            !this.hasAgreed && "blur-md filter",
          ]}
          headerAction={
            this.currentCompetition ? (
              <div class="flex items-center">
                <div class="mr-[84px] flex items-center">
                  <div class="text-accent-base">Days Remaining</div>
                  <div class="bg-accent-base ml-[4px] flex h-[25px] items-center rounded-[20px] px-[8px] font-medium text-gray-300">
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
                  class="!h-[48px] !px-[16px] !text-lg"
                >
                  Swap
                </Button.Inline>
              </div>
            ) : undefined
          }
          withOverflowSpace
        >
          <div
            class={[
              "absolute bottom-[100%] left-0 right-0 flex items-center justify-between",
            ]}
          >
            <div
              class={[
                "text-bold text-accent-base ml-[1px] flex h-[32px] cursor-pointer items-center rounded-t-sm bg-black px-[30px] hover:underline",
              ]}
              onClick={() => (this.isAgreeModalOpen = true)}
            >
              <AssetIcon
                icon="interactive/check"
                size={20}
                class="mr-[4px] mt-[2px]"
              />
              Competition Terms and Conditions
            </div>
            <section class="flex items-center justify-between">
              {this.availableCompetitions.map((competition) => (
                <RouterLink
                  to={{
                    name: "Leaderboard",
                    params: {
                      type: competition.type,
                      symbol: this.symbol || "",
                    },
                  }}
                  class={[
                    "text-bold ml-[1px] flex h-[32px] cursor-pointer items-center rounded-t-sm px-[30px]",
                    this.currentType === competition.type
                      ? "text-accent-base bg-black"
                      : "text-gray-825 bg-gray-300 hover:opacity-80",
                  ]}
                >
                  {COMPETITION_TYPE_DISPLAY_DATA[competition.type].title(
                    competition,
                  )}
                  <Tooltip
                    content={COMPETITION_TYPE_DISPLAY_DATA[
                      competition.type
                    ].description(competition)}
                  >
                    <Button.InlineHelp
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      // @ts-ignore
                      onClick={() => {
                        window.open(
                          COMPETITION_TYPE_DISPLAY_DATA[competition.type].link(
                            competition,
                          ),
                        );
                      }}
                    />
                  </Tooltip>
                </RouterLink>
              ))}
            </section>
          </div>
          <div class={[this.isReloading && "opacity-50 blur-[3px] filter"]}>
            {this.items.length >= 3 && (
              <div class="flex items-end justify-around">
                {[this.items[1], this.items[0], this.items[2]].map((item) => (
                  <LeaderboardPodium
                    key={item.name}
                    pendingReward={
                      this.prizeDistributionByRank.get(item.rank) ?? 0
                    }
                    item={item}
                    competition={this.currentCompetition!}
                  />
                ))}
              </div>
            )}
            <div class="mt-[45px]" />
            {
              /* Show self-item if you're in top 3 or below top 15 */
              this.accountItem &&
                this.items?.length > 0 &&
                (this.accountItem.rank >
                  this.items[this.items.length - 1]?.rank ||
                  this.accountItem.rank <= 3) && (
                  <LeaderboardRow
                    item={this.accountItem}
                    competition={this.currentCompetition!}
                    pendingReward={
                      this.prizeDistributionByRank.get(this.accountItem.rank) ??
                      0
                    }
                    maximumRank={this.maximumRank}
                    class="mb-[30px]"
                    isMyself
                  />
                )
            }
            <TransitionGroup
              name="flip-list"
              key={this.currentCompetition!.displayName}
            >
              {(this.items.length > 3 ? this.items.slice(3) : this.items).map(
                (item) => {
                  return (
                    <LeaderboardRow
                      competition={this.currentCompetition!}
                      pendingReward={
                        this.prizeDistributionByRank.get(item.rank) ?? 0
                      }
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
          </div>
          <div class="h-4" />
        </PageCard>
      </Layout>
    );
  },
});
