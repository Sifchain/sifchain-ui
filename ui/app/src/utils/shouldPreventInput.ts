export const shouldPreventInput = (
  inputValue: string,
  caretPosition: number = 0,
  nextChar: string,
  maxSignificand: number,
  maxMantissa: number,
): boolean => {
  const [significand, mantissa]: string[] = inputValue.split(".") || ["0"];

  const decimalIndex = inputValue.includes(".")
    ? inputValue.indexOf(".")
    : inputValue.length;

  // string can only contain numbers or decimal places
  const nextCharIsDigitOrDecimal = /^\d*\.?\d*$/.test(nextChar);

  // string can only contain one decimal place
  const containsMultipleDecimals = inputValue.includes(".") && nextChar === ".";

  // significand should be less than max allowed digits
  const hitMaxSignificandDigits: boolean =
    significand.length >= maxSignificand &&
    caretPosition <= decimalIndex &&
    nextChar !== ".";

  // mantissa should be the max allowable for the selected token
  const hitMaxMantissaDigits: boolean =
    mantissa?.length > maxMantissa && caretPosition > decimalIndex;

  // prevent next character addition to the amount if any of these conditions are true
  return (
    hitMaxSignificandDigits ||
    hitMaxMantissaDigits ||
    !nextCharIsDigitOrDecimal ||
    containsMultipleDecimals
  );
};
