import Web3 from "web3";
import { AbiItem } from "web3-utils";

import json from "../../../../../smart-contracts/build/contracts/BridgeBank.json";

export async function getBridgeBankContract(web3: Web3, address: string) {
  return new web3.eth.Contract(json.abi as AbiItem[], address);
}
