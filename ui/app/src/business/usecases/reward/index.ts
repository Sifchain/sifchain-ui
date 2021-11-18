import { UsecaseContext } from "..";
import {
  CryptoeconomicsRewardType,
  CryptoeconomicsUserData,
} from "../../services/CryptoeconomicsService";
import { Claim } from "./claim";
import { Network } from "@sifchain/sdk";
import { Services } from "../../services";

export const BLOCK_TIME_MS = 1000 * 60 * 200;

export const VS_STORAGE_KEY = "NOTIFIED_VS_STORAGE";
export const LM_STORAGE_KEY = "NOTIFIED_LM_STORAGE";

export default function rewardActions({
  services,
  store,
}: UsecaseContext<keyof Services, "wallet">) {
  return {
    claim: Claim(services),
  };
}
