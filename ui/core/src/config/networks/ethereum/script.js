const assets = require("./assets.ethereum.sifchain-testnet.json");

require("./right.json").forEach((data) => {
  const match = assets.assets.find(
    (a) => a.symbol.toLowerCase() === data.symbol.toLowerCase(),
  );
  if (match) {
    match.address = data.token;
  }
});
require("fs").writeFileSync(
  "./assets.ethereum.sifchain-testnet-042.json",
  JSON.stringify(assets, null, 2),
);
