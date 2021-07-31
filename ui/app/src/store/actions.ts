import { Network } from "../../../core/src";

export type Actions = {
  type: "CONNECT_WALLET";
  payload: {
    network: Network;
  };
};
