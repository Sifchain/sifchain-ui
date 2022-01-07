export const shouldPreventInput = (
  currentInputValue: string,
  caretPosition: number = 0,
  userInput: string,
  maxSignificand: number,
  maxMantissa: number,
): boolean => {
  const [significand, mantissa]: string[] = currentInputValue.split(".") || [
    "0",
  ];

  const decimalIndex = currentInputValue.includes(".")
    ? currentInputValue.indexOf(".")
    : currentInputValue.length;

  // string can only contain numbers or decimal places
  const userInputIsDigitOrDecimal = /^\d*\.?\d*$/.test(userInput);

  // string can only contain one decimal place
  const containsMultipleDecimals =
    currentInputValue.includes(".") && userInput === ".";

  // significand should be less than max allowed digits
  const hitMaxSignificandDigits: boolean =
    (significand.length >= maxSignificand &&
      caretPosition <= decimalIndex &&
      userInput !== ".") ||
    userInput.length > maxSignificand;

  // mantissa should be the max allowable for the selected token
  const hitMaxMantissaDigits: boolean =
    (mantissa?.length > maxMantissa && caretPosition > decimalIndex) ||
    userInput.length > maxMantissa;

  // prevent next character addition to the amount if any of these conditions are true
  return (
    hitMaxSignificandDigits ||
    hitMaxMantissaDigits ||
    !userInputIsDigitOrDecimal ||
    containsMultipleDecimals
  );
};
