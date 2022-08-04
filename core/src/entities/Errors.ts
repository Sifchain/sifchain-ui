export enum ErrorCode {
  TX_FAILED_SLIPPAGE,
  TX_FAILED,
  USER_REJECTED,
  UNKNOWN_FAILURE,
  INSUFFICIENT_FUNDS,
  TX_FAILED_OUT_OF_GAS,
  TX_FAILED_NOT_ENOUGH_ROWAN_TO_COVER_GAS,
  TX_FAILED_USER_NOT_ENOUGH_BALANCE,
  MAX_LIQUIDITY_THRESHOLD_REACHED = 40,
  ASSET_POOL_DOES_NOT_EXIST = 41,
}

// This may be removed as it is a UX concern
const ErrorMessages = {
  [ErrorCode.TX_FAILED_SLIPPAGE]:
    "Your transaction has failed - Received amount is below expected",
  [ErrorCode.TX_FAILED]: "Your transaction has failed",
  [ErrorCode.USER_REJECTED]: "You have rejected the transaction",
  [ErrorCode.UNKNOWN_FAILURE]: "There was an unknown failure",
  [ErrorCode.INSUFFICIENT_FUNDS]: "You have insufficient funds",
  [ErrorCode.TX_FAILED_USER_NOT_ENOUGH_BALANCE]: "Not have enough balance",
  [ErrorCode.TX_FAILED_NOT_ENOUGH_ROWAN_TO_COVER_GAS]:
    "Not enough ROWAN to cover the gas fees",
  [ErrorCode.TX_FAILED_OUT_OF_GAS]: "Your transaction has failed - Out of gas",
  [ErrorCode.MAX_LIQUIDITY_THRESHOLD_REACHED]:
    "Unable to swap, reached maximum rowan liquidity threshold",
  [ErrorCode.ASSET_POOL_DOES_NOT_EXIST]:
    "Unable to swap, max rowan liquidity threshold asset pool does not exist",
};

export function getErrorMessage(code: ErrorCode): string {
  return ErrorMessages[code];
}
