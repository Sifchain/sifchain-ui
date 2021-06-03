import { AppCookies } from "./AppCookies";

export enum SifEnv {
  MAINNET,
  TESTNET,
  DEVNET,
  LOCALNET,
}

const profileLookup = {
  [SifEnv.DEVNET]: {
    tag: "devnet",
    ethAssetTag: "ethereum.devnet",
    sifAssetTag: "sifchain.mainnet",
  },
  [SifEnv.TESTNET]: {
    tag: "testnet",
    ethAssetTag: "ethereum.testnet",
    sifAssetTag: "sifchain.mainnet",
  },
  [SifEnv.MAINNET]: {
    tag: "mainnet",
    ethAssetTag: "ethereum.mainnet",
    sifAssetTag: "sifchain.mainnet",
  },
  [SifEnv.LOCALNET]: {
    tag: "localnet",
    ethAssetTag: "ethereum.localnet",
    sifAssetTag: "sifchain.localnet",
  },
};

// Here we list hostnames that have default env settings
const hostDefaultEnvs = {
  "dex.sifchain.finance": SifEnv.MAINNET,
  "testnet.sifchain.finance": SifEnv.TESTNET,
  "devnet.sifchain.finance": SifEnv.DEVNET,
  "gateway.pinata.cloud": SifEnv.DEVNET,
  localhost: SifEnv.LOCALNET,
};

type SifchainHostname = keyof typeof hostDefaultEnvs;

export function isSifchainHostname(val: string): val is SifchainHostname {
  return typeof hostDefaultEnvs[val as SifchainHostname] === "number";
}

export function isSifEnv(a: any): a is SifEnv {
  const envKeys = Object.values(SifEnv).filter((s) => typeof s === "number");
  return envKeys.includes(parseInt(a));
}

type GetEnvArgs = {
  location: { hostname: string };
  cookies?: Pick<AppCookies, "getEnv">;
};

export function getEnv({
  location: { hostname },
  cookies = AppCookies(),
}: GetEnvArgs) {
  const cookieTag = cookies.getEnv();

  if (isSifchainHostname(hostname)) {
    if (typeof cookieTag === "undefined") {
      return profileLookup[hostDefaultEnvs[hostname]];
    }
    if (isSifEnv(cookieTag) && profileLookup[cookieTag]) {
      return profileLookup[cookieTag];
    }
  }

  throw new Error("Cannot render environment");
}
