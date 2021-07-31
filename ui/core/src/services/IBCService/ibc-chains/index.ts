import sifchain from "./sifchain";
import cosmoshub from "./cosmoshub/";
import { NetworkEnv } from "../../../config/getEnv";
import { Network } from "../../../entities";

export const chainConfigByNetworkEnv = Object.fromEntries(
  Object.values(NetworkEnv).map((env) => {
    return [
      env,
      {
        [Network.SIFCHAIN]: sifchain[env],
        [Network.COSMOSHUB]: cosmoshub[env],
        [Network.ETHEREUM]: null,
      },
    ];
  }),
);
