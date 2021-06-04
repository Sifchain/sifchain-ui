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
const hostDefaultEnvs = [
  { test: /dex\.sifchain\.finance$/, net: SifEnv.MAINNET },
  { test: /testnet\.sifchain\.finance$/, net: SifEnv.TESTNET },
  { test: /devnet\.sifchain\.finance$/, net: SifEnv.DEVNET },
  { test: /sifchain\.vercel\.app$/, net: SifEnv.DEVNET },
  { test: /gateway\.pinata\.cloud$/, net: SifEnv.DEVNET },
  { test: /localhost$/, net: SifEnv.LOCALNET },
];

export function getSifEnv(hostname: string) {
  for (const { test, net } of hostDefaultEnvs) {
    if (test.test(hostname)) {
      return net;
    }
  }
  return null;
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

  const sifEnv = getSifEnv(hostname);
  if (sifEnv !== null) {
    if (typeof cookieTag === "undefined") {
      return profileLookup[sifEnv];
    }
    if (isSifEnv(cookieTag) && profileLookup[cookieTag]) {
      return profileLookup[cookieTag];
    }
  }

  throw new Error("Canno:t render environment");
}
