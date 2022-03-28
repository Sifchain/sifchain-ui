export function aprToApy(apr: number, compoundIntervalsPerYear: number) {
  return (
    100 *
    (Math.pow(
      1 + (apr * 0.01) / compoundIntervalsPerYear,
      compoundIntervalsPerYear,
    ) -
      1)
  );
}

export function aprToWeeklyCompoundedApy(apr: number) {
  return aprToApy(apr, 52);
}
