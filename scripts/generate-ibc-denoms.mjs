fetch("https://api.sifchain.finance/tokenregistry/entries")
  .then((r) => {
    return r.json();
  })
  .then(async (r) => {
    const { assets } = await fetch(
      "https://raw.githubusercontent.com/Sifchain/sifchain-ui/develop/core/src/assets.sifchain.mainnet.json",
    ).then((r) => r.json());
    const whitelist = [];
    for (let entry of r.result.registry.entries) {
      const isNative = entry.denom === entry.base_denom;
      console.log({ isNative, denom: entry.denom });
      if (isNative) {
        // cdai -> dai
        const rawDenom = entry.denom.startsWith("c")
          ? entry.denom.substring(1)
          : entry.denom;
        // rowan -> xrowan, wbtc -> wbtc
        const counterpartyBaseDenom =
          +entry.decimals <= 10
            ? rawDenom.toLowerCase()
            : `x${rawDenom}`.toLowerCase();
        console.log({ counterpartyBaseDenom });
        const ibcHash = await digestMessage(
          `transfer/channel-32/${counterpartyBaseDenom}`,
        );
        const asset = assets.find((a) => a.symbol === entry.denom);
        if (!asset) {
          console.error("could not find asset for symbol: " + entry.denom);
          continue;
        }
        const vectorUrl = `https://raw.githubusercontent.com/Sifchain/sifchain-ui/develop/app/public/images/tokens/${rawDenom.toUpperCase()}.svg`;
        const logoUris = await fetch(vectorUrl)
          .then((r) => r.text())
          .then((r) => {
            if (r.includes("404: Not Found")) throw "";
            return {
              svg: vectorUrl,
            };
          })
          .catch((e) => {
            return {
              png: asset.imageUrl,
            };
          })
          .catch((e) => {
            console.error(e);
          });
        if (!logoUris) {
          console.error("logo uris not found for " + entry.denom);
          continue;
        }
        const osmosisWhitelistEntry = {
          description: `${asset.homeNetwork
            .split("")
            .map((c, i) => (i === 0 ? c.toUpperCase() : c.toLowerCase()))
            .join("")} ${rawDenom.toUpperCase()} Token`,
          denom_units: [
            {
              denom: ibcHash,
              exponent: 0,
              aliases: [counterpartyBaseDenom],
            },
            {
              denom: rawDenom,
              exponent: Math.min(~~+entry.decimals, 10),
              aliases: [],
            },
          ],
          base: ibcHash,
          display: rawDenom,
          symbol: rawDenom.toUpperCase(),
          logo_URIs: logoUris,
        };
        whitelist.push(osmosisWhitelistEntry);
      }
    }
    console.log({ whitelist });
    console.log(JSON.stringify(whitelist, null, 2));
  });

async function digestMessage(message) {
  const msgUint8 = new TextEncoder().encode(message); // encode as (utf-8) Uint8Array
  console.log(msgUint8);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8); // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(""); // convert bytes to hex string
  return "ibc/" + hashHex.toUpperCase();
}

// `port/denomTrace/baseDenom`
digestMessage("transfer/channel-32/urowan").then((digestHex) =>
  console.log(digestHex),
);

digestMessage("transfer/channel-32/xrowan").then((digestHex) =>
  console.log(digestHex),
);
