import { AppCookies } from "./AppCookies";

export enum NetworkEnv {
  MAINNET = "mainnet",
  TESTNET = "testnet",
  DEVNET = "devnet",
  LOCALNET = "localnet",
}

export const profileLookup = {
  [NetworkEnv.MAINNET]: {
    tag: NetworkEnv.MAINNET,
    ethAssetTag: "ethereum.mainnet",
    sifAssetTag: "sifchain.mainnet",
  },
  get [0]() {
    return this[NetworkEnv.MAINNET];
  },
  [NetworkEnv.TESTNET]: {
    tag: NetworkEnv.TESTNET,
    ethAssetTag: "ethereum.testnet",
    sifAssetTag: "sifchain.mainnet",
  },
  get [1]() {
    return this[NetworkEnv.TESTNET];
  },
  [NetworkEnv.DEVNET]: {
    tag: NetworkEnv.DEVNET,
    ethAssetTag: "ethereum.devnet",
    sifAssetTag: "sifchain.mainnet",
  },
  get [2]() {
    return this[NetworkEnv.DEVNET];
  },
  [NetworkEnv.LOCALNET]: {
    tag: NetworkEnv.LOCALNET,
    ethAssetTag: "ethereum.localnet",
    sifAssetTag: "sifchain.localnet",
  },
  get [3]() {
    return this[NetworkEnv.LOCALNET];
  },
} as const;

// Here we list hostnames that have default env settings
const hostDefaultEnvs = [
  { test: /dex\.sifchain\.finance$/, net: NetworkEnv.MAINNET },
  { test: /testnet\.sifchain\.finance$/, net: NetworkEnv.TESTNET },
  { test: /devnet\.sifchain\.finance$/, net: NetworkEnv.DEVNET },
  { test: /sifchain\.vercel\.app$/, net: NetworkEnv.DEVNET },
  { test: /gateway\.pinata\.cloud$/, net: NetworkEnv.DEVNET },
  { test: /localhost$/, net: NetworkEnv.LOCALNET },
];

export function getNetworkEnv(hostname: string) {
  for (const { test, net } of hostDefaultEnvs) {
    if (test.test(hostname)) {
      return net;
    }
  }
  return null;
}

export function isNetworkEnv(a: string): a is NetworkEnv {
  console.log(NetworkEnv);
  const envKeys = Object.values(NetworkEnv);
  return envKeys.includes(a as NetworkEnv);
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

  const env = getNetworkEnv(hostname);
  if (env !== null) {
    if (typeof cookieTag === "undefined") {
      return profileLookup[env];
    }
    if (profileLookup[cookieTag]) {
      return profileLookup[cookieTag];
    }
  }
  throw new Error(`Cannot render environment ${env} ${cookieTag}`);
}
