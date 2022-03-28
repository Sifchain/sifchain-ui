import { Amount, format } from "@sifchain/sdk";

export const getClaimableAmountString = (amount?: number) => {
  if (!amount) return "0";
  if (amount < 0.0001) return "<0.0001";
  return (
    format(Amount((amount || 0).toFixed(18)), {
      mantissa: 4,
      zeroFormat: "0",
    }) || "0"
  );
};
