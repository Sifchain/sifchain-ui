import sifchain from "./sifchain";
import cosmoshub from "./cosmoshub";
import { NetworkEnv } from "../getEnv";
import { Network } from "../../entities";

export const chainConfigByNetworkEnv = Object.fromEntries(
  Object.values(NetworkEnv).map((env) => {
    return [
      env as NetworkEnv,
      {
        [Network.SIFCHAIN]: sifchain[env],
        [Network.COSMOSHUB]: cosmoshub[env],
        [Network.ETHEREUM]: null,
      },
    ];
  }),
);
