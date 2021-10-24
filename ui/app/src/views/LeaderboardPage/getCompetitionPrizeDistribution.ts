import { Competition, LeaderboardItem } from "./useCompetitionData";

export const getCompetitionPrizeDistributionByRank = (
  competition: Competition,
  items: LeaderboardItem[],
) => {
  const map = new Map<number, number>();

  if (competition.type === "vol") {
    const total = items.reduce((acc, item) => acc + item.value, 0);
    items.forEach((item) => {
      map.set(item.rank, (item.value / total) * competition.rewardBucket);
    });
  } else if (competition.type === "txn") {
    const firstPlaceWeight = 1.75;
    const lastPlaceWeight = 0.25;
    items.forEach((item) => {
      const inversePlacement = competition.winners - item.rank;

      const multiplier =
        lastPlaceWeight +
        ((firstPlaceWeight - lastPlaceWeight) * inversePlacement) /
          (competition.winners - 1);
      map.set(
        item.rank,
        (competition.rewardBucket / competition.winners) * multiplier,
      );
    });
  }

  return map;
};
