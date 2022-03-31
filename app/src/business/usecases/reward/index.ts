import { UsecaseContext } from "..";
import { Claim } from "./claim";

import { Services } from "../../services";

export const BLOCK_TIME_MS = 1000 * 60 * 200;

export const VS_STORAGE_KEY = "NOTIFIED_VS_STORAGE";
export const LM_STORAGE_KEY = "NOTIFIED_LM_STORAGE";

export default function rewardActions({
  services,
}: UsecaseContext<keyof Services, "wallet">) {
  return {
    claim: Claim(services),
  };
}
