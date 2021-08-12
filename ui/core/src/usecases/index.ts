import { Services, WithService } from "../services";
import { Store, WithStore } from "../store";
import ethWalletActions from "./wallet/eth";
import cosmoshubWalletActions from "./wallet/cosmoshub";
import clpActions from "./clp";
import walletActions from "./wallet/sif";
import pegActions from "./peg";
import rewardActions from "./reward";
import interchainActions from "./interchain";

export type UsecaseContext<
  T extends keyof Services = keyof Services,
  S extends keyof Store = keyof Store
> = WithService<T> & WithStore<S>;
export type Usecases = ReturnType<typeof createUsecases>;
export function createUsecases(context: UsecaseContext) {
  return {
    interchain: interchainActions(context),
    clp: clpActions(context),
    wallet: {
      cosmoshub: cosmoshubWalletActions(context),
      sif: walletActions(context),
      eth: ethWalletActions(context),
    },
    peg: pegActions(context),
    reward: rewardActions(context),
  };
}
