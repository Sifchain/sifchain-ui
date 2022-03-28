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
    items.forEach((item, index) => {
      const rank = index + 1;
      const inversePlacement = competition.winners - rank;

      const multiplier =
        lastPlaceWeight +
        ((firstPlaceWeight - lastPlaceWeight) * inversePlacement) /
          (competition.winners - 1);

      map.set(
        rank,
        (competition.rewardBucket / competition.winners) * multiplier,
      );
    });

    const groups: Record<
      string,
      Array<{ prize: number; item: LeaderboardItem }>
    > = {};
    items.forEach((item, index) => {
      groups[item.rank] = groups[item.rank] || [];
      groups[item.rank].push({ item, prize: map.get(index + 1)! });
    });

    Object.entries(groups).forEach(([rank, group]) => {
      if (group.length > 1) {
        const totalPrize = group.reduce(
          (total, { prize }) => (total += prize),
          0,
        );
        map.set(+rank, totalPrize / group.length);
      }
    });
  }

  return map;
};
