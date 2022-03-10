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
];

const PRODUCTION_DEPLOYMENT_URL =
  "sifchain-ui-(staging|master)-sifchain.vercel.app";

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
            type: "header",
            key: "x-vercel-deployment-url",
            value: PRODUCTION_DEPLOYMENT_URL,
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
            type: "header",
            key: "x-vercel-deployment-url",
            value: PRODUCTION_DEPLOYMENT_URL,
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
    ],
  };

  fs.writeFile(vercelConfigPath, JSON.stringify(nextVercelConfig, null, 2));
}

main();
