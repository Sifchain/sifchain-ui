import { Network } from "../entities";
import { AppCookies } from "./AppCookies";

export enum NetworkEnv {
  MAINNET = "mainnet",
  TESTNET = "testnet",
  DEVNET = "devnet",
  LOCALNET = "localnet",
}

type AssetTag = `${Network}.${NetworkEnv}`;

type ProfileLookup = Record<
  NetworkEnv | number,
  {
    tag: NetworkEnv;
    ethAssetTag: AssetTag;
    sifAssetTag: AssetTag;
    cosmoshubAssetTag: AssetTag;
  }
>;

export const profileLookup: ProfileLookup = {
  [NetworkEnv.MAINNET]: {
    tag: NetworkEnv.MAINNET,
    ethAssetTag: "ethereum.mainnet",
    sifAssetTag: "sifchain.mainnet",
    cosmoshubAssetTag: "cosmoshub.mainnet",
  },
  [NetworkEnv.TESTNET]: {
    tag: NetworkEnv.TESTNET,
    ethAssetTag: "ethereum.testnet",
    sifAssetTag: "sifchain.devnet",
    cosmoshubAssetTag: "cosmoshub.testnet",
  },
  [NetworkEnv.DEVNET]: {
    tag: NetworkEnv.DEVNET,
    ethAssetTag: "ethereum.devnet",
    sifAssetTag: "sifchain.devnet",
    cosmoshubAssetTag: "cosmoshub.testnet",
  },
  [NetworkEnv.LOCALNET]: {
    tag: NetworkEnv.LOCALNET,
    ethAssetTag: "ethereum.localnet",
    sifAssetTag: "sifchain.localnet",
    cosmoshubAssetTag: "cosmoshub.testnet",
  },
} as const;

// Here we list hostnames that have default env settings
const hostDefaultEnvs = [
  { test: /dex\.sifchain\.finance$/, net: NetworkEnv.MAINNET },
  { test: /testnet\.sifchain\.finance$/, net: NetworkEnv.TESTNET },
  { test: /devnet\.sifchain\.finance$/, net: NetworkEnv.DEVNET },
  { test: /sifchain\.vercel\.app$/, net: NetworkEnv.DEVNET },
  { test: /gateway\.pinata\.cloud$/, net: NetworkEnv.DEVNET },
  { test: /localhost$/, net: NetworkEnv.DEVNET },
];

export function getNetworkEnv(hostname: string) {
  for (const { test, net } of hostDefaultEnvs) {
    if (test.test(hostname)) {
      return net;
    }
  }
  return null;
}

export function isNetworkEnvSymbol(a: any): a is NetworkEnv {
  return Object.values(NetworkEnv).includes(a);
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
  const defaultNetworkEnv = getNetworkEnv(hostname);

  let sifEnv: NetworkEnv | null;

  if (isNetworkEnvSymbol(cookieEnv)) {
    sifEnv = cookieEnv;
  } else {
    sifEnv = defaultNetworkEnv;
  }

  if (sifEnv != null && profileLookup[sifEnv]) {
    return profileLookup[sifEnv];
  }

  console.error(new Error(`Cannot render environment ${sifEnv} ${cookieEnv}`));

  return profileLookup[NetworkEnv.MAINNET];
}
