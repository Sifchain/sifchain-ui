import { UsecaseContext } from "..";
import { calculateUnpegFee } from "./utils/calculateUnpegFee";
import { SubscribeToUnconfirmedPegTxs } from "./subscribeToUnconfirmedPegTxs";
import { Unpeg } from "./unpeg";
import { Peg } from "./peg";

/**
 * Shared peg config for use throughout the peg feature
 */
export type PegConfig = { ethConfirmations: number };

export default ({ services, store }: UsecaseContext) => {
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
    getSifTokens: () => services.sif.getSupportedTokens(),
    getEthTokens: () => services.eth.getSupportedTokens(),
    calculateUnpegFee,
    unpeg: Unpeg(services, store),
    peg: Peg(services, store, config),
  };

  return actions;
};
