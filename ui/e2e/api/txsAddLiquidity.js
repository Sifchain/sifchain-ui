import axios from "axios";
import { KEPLR_CONFIG } from "../config";

export async function txsAddLiquidity({
  externalAsset,
  externalAmount,
  nativeAmount,
}) {
  let response;
  try {
    response = await axios.post("/txs", {
      tx: {
        msg: [
          {
            type: "clp/AddLiquidity",
            value: {
              Signer: KEPLR_CONFIG.options.address,
              ExternalAsset: {
                symbol: externalAsset,
              },
              NativeAssetAmount: nativeAmount,
              ExternalAssetAmount: externalAmount,
            },
          },
        ],
        fee: {
          gas: "500000",
          amount: [
            {
              denom: "rowan",
              amount: "325000",
            },
          ],
        },
        memo: "",
        signatures: [
          {
            pub_key: {
              type: "tendermint/PubKeySecp256k1",
              value: KEPLR_CONFIG.options.publickey,
            },
            signature: KEPLR_CONFIG.options.signature,
          },
        ],
      },
      mode: "block",
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
