export const isNil = (value: unknown): value is null | undefined => {
  return value === undefined || value === null;
};
