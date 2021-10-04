import { flagsStore } from "@/store/modules/flags";
import { createGraphQLClient } from "./createGraphQLClient";

export const createCryptoeconGqlClient = () => {
  const url = `https://api-cryptoeconomics${
    flagsStore.state.devnetCryptoecon ? "-devnet" : ""
  }.sifchain.finance/graphql`;
  return createGraphQLClient(url);
};
