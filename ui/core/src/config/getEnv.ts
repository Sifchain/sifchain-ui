import { AppCookies } from "./AppCookies";

export enum SifEnv {
  MAINNET,
  TESTNET,
  DEVNET,
  LOCALNET,
}

const envKeys = Object.values(SifEnv).filter((s) => typeof s === "number");

export function isSifEnv(a: any): a is SifEnv {
  return envKeys.includes(parseInt(a));
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

type GetEnvArgs = {
  location: {
    hostname: string;
  };
  cookies?: Pick<AppCookies, "getEnv">;
};
export function getEnv({
  location: { hostname },
  cookies = AppCookies(),
}: GetEnvArgs) {
  const cookieTag = (cookies.getEnv() as unknown) as SifEnv;

  if (!cookieTag) {
    if (hostname === "dex.sifchain.finance") {
      return profileLookup[SifEnv.MAINNET];
    }
    if (hostname === "testnet.sifchain.finance") {
      return profileLookup[SifEnv.TESTNET];
    }
    if (
      hostname === "devnet.sifchain.finance" ||
      hostname === "gateway.pinata.cloud"
    ) {
      return profileLookup[SifEnv.DEVNET];
    }
    if (hostname === "localhost") {
      return profileLookup[SifEnv.LOCALNET];
    }
  }

  if (profileLookup[cookieTag]) {
    return profileLookup[cookieTag];
  }

  throw new Error("Cannot render environment");
}
