/**
 * parses a string that represents a number by removing `_` separators
 * @param x number string
 * @returns string
 */
export const sanitizeNumericString = (x: string) => x.replace(/\_/g, "");
