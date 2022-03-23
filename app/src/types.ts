export type ConfirmState =
  | "approving"
  | "selecting"
  | "confirming"
  | "signing"
  | "confirmed"
  | "rejected"
  | "out_of_gas"
  | "failed";

export const enum ConfirmStateEnum {
  Approving = "approving",
  Selecting = "selecting",
  Confirming = "confirming",
  Signing = "signing",
  Confirmed = "confirmed",
  Rejected = "rejected",
  OutOfGas = "out_of_gas",
  Failed = "failed",
}
