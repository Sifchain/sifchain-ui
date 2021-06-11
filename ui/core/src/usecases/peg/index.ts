import { UsecaseContext } from "..";
import { Address, IAssetAmount } from "../../entities";
import { calculateUnpegFee } from "./utils/calculateUnpegFee";
import { SubscribeToUnconfirmedPegTxs } from "./subscribeToUnconfirmedPegTxs";
import { Unpeg } from "./unpeg";
import { Peg } from "./peg";

/**
 * Shared peg config for use throughout the peg feature
 */
export type PegConfig = { ethConfirmations: number };

export default ({
  services,
  store,
}: UsecaseContext<
  "sif" | "ethbridge" | "bus" | "eth", // Select the services you want to access
  "wallet" | "tx" // Select the store keys you want to access
>) => {
  const config: PegConfig = {
    // listen for 50 confirmations
    // Eventually this should be set on ebrelayer
    // to centralize the business logic
    ethConfirmations: 50,
  };

  // Rename and split this up to subscriptions, commands, queries
  const actions = {
    subscribeToUnconfirmedPegTxs: SubscribeToUnconfirmedPegTxs({
      services,
      store,
      config,
    }),
    getSifTokens: services.sif.getSupportedTokens,
    getEthTokens: services.eth.getSupportedTokens,
    calculateUnpegFee,
    unpeg: Unpeg(services, store),
    peg: Peg(services, store, config),

    // TODO: Move this approval command to within peg and report status via store or some other means
    //       This has been done for convenience but we should not have to know in the view that
    //       approval is required before pegging as that is very much business domain knowledge
    async approve(address: Address, assetAmount: IAssetAmount) {
      return await services.ethbridge.approveBridgeBankSpend(
        address,
        assetAmount,
      );
    },
  };

  return actions;
};
