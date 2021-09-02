// const IBC_REWARDS_START_DATEIME = "2021-08-24T06:48:43+00:00";
const IBC_REWARDS_START_DATE = new Date("2021-08-24T22:38:05.000Z");

const IBC_REWARDS_WEEKS = 7; // 7 week program for ibc rewards

const IBC_REWARDS_END_DATE = new Date(
  IBC_REWARDS_START_DATE.getTime() +
    IBC_REWARDS_WEEKS * 1000 * 60 * 60 * 24 * 7,
);

export const isTimestampWithinRewardsTime = (blockTimestamp: number) => {
  return timestampToDate(blockTimestamp) <= IBC_REWARDS_END_DATE;
};

export const timestampToDate = (blockTimestamp: number) => {
  return new Date(
    IBC_REWARDS_START_DATE.getTime() + blockTimestamp * 60 * 1000,
  );
};
