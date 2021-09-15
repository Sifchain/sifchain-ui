const assets = require("../../../config/networks/ethereum--deprecated/assets.ethereum.mainnet.json");

const addr = {};
assets.assets.forEach((asset) => {
  if (asset.address) {
    addr[asset.symbol.toLowerCase()] = asset.address;
  }
});

console.log(JSON.stringify(addr, null, 2));
