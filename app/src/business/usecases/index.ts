import { Services, WithService } from "../services";
import { Store, WithStore } from "../store";
import clpActions from "./clp";
import walletActions from "./wallet/sif";
import interchainActions from "./interchain";
import rewardActions from "./reward";

export type UsecaseContext<
  T extends keyof Services = keyof Services,
  S extends keyof Store = keyof Store,
> = WithService<T> & WithStore<S>;
export type Usecases = ReturnType<typeof createUsecases>;
export function createUsecases(context: UsecaseContext) {
  return {
    interchain: interchainActions(context),
    clp: clpActions(context),
    wallet: {
      sif: walletActions(context),
    },
    reward: rewardActions(context),
  };
}
