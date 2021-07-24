import { AppCookies } from "./AppCookies";

export enum SifEnv {
  MAINNET = "mainnet",
  TESTNET = "testnet",
  DEVNET = "devnet",
  LOCALNET = "localnet",
  DEVNET_042 = "devnet_042",
}

// NOTE(ajoslin): support legacy `?_env=n` urls, from
// 0-4
export const sifEnvsByIndex = [
  SifEnv.MAINNET,
  SifEnv.TESTNET,
  SifEnv.DEVNET,
  SifEnv.LOCALNET,
  SifEnv.DEVNET_042,
];

export const profileLookup = {
  [SifEnv.DEVNET]: {
    tag: "devnet",
    ethAssetTag: "ethereum.devnet",
    sifAssetTag: "sifchain.mainnet",
  },
  [SifEnv.DEVNET_042]: {
    tag: "devnet_042",
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
  { test: /dex-v2.*?\.sifchain\.finance$/, net: SifEnv.DEVNET },
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

export function isSifEnvSymbol(a: any): a is SifEnv {
  return Object.values(SifEnv).includes(a) || !!sifEnvsByIndex[a as number];
}

type GetEnvArgs = {
  location: { hostname: string };
  cookies?: Pick<AppCookies, "getEnv">;
};

export function getEnv({
  location: { hostname },
  cookies = AppCookies(),
}: GetEnvArgs) {
  const cookieEnv = cookies.getEnv();
  const defaultSifEnv = getSifEnv(hostname);

  let sifEnv: SifEnv | null;

  if (cookieEnv != null && sifEnvsByIndex[+cookieEnv]) {
    sifEnv = sifEnvsByIndex[+cookieEnv];
  } else if (isSifEnvSymbol(cookieEnv)) {
    sifEnv = cookieEnv as SifEnv;
  } else {
    sifEnv = defaultSifEnv;
  }

  console.log("sifEnv", profileLookup[sifEnv as SifEnv]);

  if (sifEnv != null && profileLookup[sifEnv]) {
    return profileLookup[sifEnv];
  }

  throw new Error("Cannot render environment");
}
