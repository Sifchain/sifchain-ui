import fs from "fs/promises";
import path from "path";

const BLOCKED_COUNTRY_CODES = [
  "AL",
  "US",
  "BA",
  "ME",
  "MK",
  "XK",
  "RS",
  "BY",
  "MM",
  "CI",
  "CU",
  "CD",
  "CF",
  "IR",
  "IQ",
  "LR",
  "KP",
  "SD",
  "SY",
  "ZW",
  "YE",
  "VE",
  "NI",
  "ML",
  "BI",
  "LB",
  "LY",
  "SO",
  "AS",
  "GU",
  "MP",
  "PR",
  "UM",
  "VI",
  "RU",
];

async function main() {
  const vercelConfigPath = path.resolve("./vercel.json");
  const vercelConfigText = await fs.readFile(vercelConfigPath, "utf8");

  const vercelConfig = JSON.parse(vercelConfigText);

  const nextVercelConfig = {
    ...vercelConfig,
    redirects: [
      // Redirect all blocked countries to the root of the site.
      {
        source: "/(.*)",
        destination: "https://sifchain.finance/legal-disclamer",
        has: [
          {
            type: "host",
            value: "(dex|staging).sifchain.finance",
          },
          {
            type: "header",
            key: "x-vercel-ip-country",
            value: BLOCKED_COUNTRY_CODES.join("|"),
          },
        ],
        permanent: false,
      },
      // Redirect Crimea.
      {
        source: "/(.*)",
        destination: "https://sifchain.finance/legal-disclamer",
        has: [
          {
            type: "host",
            value: "(dex|staging).sifchain.finance",
          },
          {
            type: "header",
            key: "x-vercel-ip-country",
            value: "UA",
          },
          {
            type: "header",
            key: "x-vercel-ip-country-region",
            value: "13",
          },
        ],
        permanent: false,
      },
      // Redirect NZ-AUK (test).
      {
        source: "/(.*)",
        destination: "https://www.youtube.com/watch?v=np-gqrLTfQA",
        has: [
          {
            type: "host",
            value: "(devnet|testnet).sifchain.finance",
          },
          {
            type: "header",
            key: "x-vercel-ip-country",
            value: "NZ",
          },
          {
            type: "header",
            key: "x-vercel-ip-country-region",
            value: "AUK",
          },
        ],
        permanent: false,
      },
    ],
  };

  fs.writeFile(vercelConfigPath, JSON.stringify(nextVercelConfig, null, 2));
}

main();
