import sifchain from "./sifchain";
import cosmoshub from "./cosmoshub";
import iris from "./iris";
import akash from "./akash";

import { NetworkEnv } from "../getEnv";
import { Network } from "../../entities";

export const chainConfigByNetworkEnv = Object.fromEntries(
  Object.values(NetworkEnv).map((env) => {
    return [
      env as NetworkEnv,
      {
        [Network.SIFCHAIN]: sifchain[env],
        [Network.COSMOSHUB]: cosmoshub[env],
        [Network.IRIS]: iris[env],
        [Network.AKASH]: akash[env],
        [Network.ETHEREUM]: null,
      },
    ];
  }),
);
