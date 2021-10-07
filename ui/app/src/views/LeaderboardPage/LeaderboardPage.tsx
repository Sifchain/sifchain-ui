import AssetIcon from "@/components/AssetIcon";
import { Button } from "@/components/Button/Button";
import PageCard from "@/components/PageCard";
import { Tooltip } from "@/components/Tooltip";
import Layout from "@/componentsLegacy/Layout/Layout";
import { useBoundRoute } from "@/hooks/useBoundRoute";
import { defineComponent, ref, TransitionGroup } from "vue";
import {
  COMPETITION_END_DATE,
  LeaderboardCompetitionType,
  LeaderboardItem,
  useLeaderboardData,
} from "./useLeaderboardData";
import { LeaderboardRow } from "./children/LeaderboardRow";
import { LeaderboardPodium } from "./children/LeaderboardPodium";
import { RouterLink } from "vue-router";
import router from "@/router";

export default defineComponent({
  name: "LeaderboardPage",
  setup() {
    return useLeaderboardData();
  },
  computed: {
    currentType(): LeaderboardCompetitionType {
      return router.currentRoute.value.params
        .type as LeaderboardCompetitionType;
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
      return Math.max(
        0,
        Math.ceil(
          (COMPETITION_END_DATE.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        ),
      );
    },
  },
  render() {
    return (
      <Layout>
        <PageCard
          key={this.currentType}
          heading={`${
            this.currentType === "txn" ? "Tx" : "Volume"
          } Leaderboard`}
          iconName="interactive/check"
          class="max-w-none w-[850px] rounded-tr-none"
          headerAction={
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
                to="/swap"
                class="!h-[48px] !text-lg !px-[16px]"
              >
                Swap
              </Button.Inline>
            </div>
          }
          withOverflowSpace
        >
          <div class="flex absolute bottom-[100%] right-0 flex items-center">
            {(["txn", "vol"] as Array<LeaderboardCompetitionType>).map(
              (type) => (
                <RouterLink
                  to={{ name: "Leaderboard", params: { type } }}
                  key={type}
                  class={[
                    "cursor-pointer h-[32px] px-[30px] flex items-center text-bold rounded-t-sm ml-[1px]",
                    this.currentType === type
                      ? "text-accent-base bg-black"
                      : "bg-gray-300 text-gray-825 hover:opacity-80",
                  ]}
                >
                  {type === "vol" ? "Swap Volume" : "Swap Tx Count"}
                  <Button.InlineHelp size={16} iconClass="text-accent-base">
                    Help!
                  </Button.InlineHelp>
                </RouterLink>
              ),
            )}
          </div>
          {this.isLoading ? (
            <div class="absolute left-0 top-[180px] w-full flex justify-center">
              <div class="flex items-center justify-center bg-black bg-opacity-50 rounded-lg h-[80px] w-[80px]">
                <AssetIcon
                  icon="interactive/anim-racetrack-spinner"
                  size={64}
                />
              </div>
            </div>
          ) : (
            <>
              {this.items.length >= 3 && (
                <div class="flex items-end justify-around">
                  <TransitionGroup name="flip-list">
                    {[this.items[1], this.items[0], this.items[2]].map(
                      (item) => (
                        <LeaderboardPodium
                          key={item.name}
                          item={item}
                          type={this.currentType}
                        />
                      ),
                    )}
                  </TransitionGroup>
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
              <TransitionGroup name="flip-list">
                {this.items.slice(3).map((item) => {
                  return (
                    <LeaderboardRow
                      type={this.currentType}
                      key={item.name}
                      item={item}
                      maximumRank={this.maximumRank}
                      class="mb-[10px]"
                      isMyself={item.rank === this.accountItem?.rank}
                    />
                  );
                })}
              </TransitionGroup>
            </>
          )}

          <div class="h-4" />
        </PageCard>
      </Layout>
    );
  },
});
