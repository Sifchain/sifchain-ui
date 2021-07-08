import axios from "axios";
import { KEPLR_CONFIG } from "../config";

export async function addLiquidity({
  externalAsset,
  externalAmount,
  nativeAmount,
}) {
  let response;
  try {
    response = await axios.post("/clp/addLiquidity", {
      base_req: {
        chain_id: "sifchain-local",
        from: KEPLR_CONFIG.options.address,
      },
      external_asset: {
        source_chain: "sifchain",
        symbol: externalAsset,
        ticker: externalAsset,
      },
      external_asset_amount: externalAmount,
      native_asset_amount: nativeAmount,
      signer: KEPLR_CONFIG.options.address,
    });
    console.log(response);
  } catch (error) {
    console.error(error);
  }
  return response;
}

// {
//   "base_req": {
//     "chain_id": "sifchain-local",
//     "from": "sif1m625hcmnkc84cgmef6upzzyfu6mxd4jkpnfwwl"
//   },
//   "external_asset": {
//     "source_chain": "sifchain",
//     "symbol": "ceth",
//     "ticker": "ceth"
//   },
//   "external_asset_amount": "5000000000000000000",
//   "native_asset_amount": "6024096390000000000000",
//   "signer": "sif1m625hcmnkc84cgmef6upzzyfu6mxd4jkpnfwwl"
// }
