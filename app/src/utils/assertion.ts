export const isNil = (value: unknown): value is null | undefined =>
  value === undefined || value === null;

export const isNilOrWhitespace = (
  value: string | null | undefined,
): value is null | undefined => value?.trim() === "";
