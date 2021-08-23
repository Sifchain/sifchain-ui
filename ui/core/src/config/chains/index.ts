import ethereum from "./ethereum";
import sifchain from "./sifchain";
import cosmoshub from "./cosmoshub";
// import iris from "./iris";
import akash from "./akash";
import sentinel from "./sentinel";

import { NetworkEnv } from "../getEnv";
import { Network } from "../../entities";

export const chainConfigByNetworkEnv = Object.fromEntries(
  Object.values(NetworkEnv).map((env) => {
    return [
      env as NetworkEnv,
      {
        [Network.SIFCHAIN]: sifchain[env],
        [Network.COSMOSHUB]: cosmoshub[env],
        // [Network.IRIS]: iris[env],
        [Network.AKASH]: akash[env],
        [Network.SENTINEL]: sentinel[env],
        [Network.ETHEREUM]: ethereum[env],
      },
    ];
  }),
);
