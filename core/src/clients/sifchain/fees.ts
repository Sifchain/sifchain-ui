import { calculateFee, GasPrice } from "@cosmjs/stargate";

// NOTE: Don't know where these value came from
// only as it to keep thing same as before

export const DEFAULT_GAS_PRICE = GasPrice.fromString("0.5rowan");

export const DEFAULT_FEE = calculateFee(250_000, DEFAULT_GAS_PRICE);
