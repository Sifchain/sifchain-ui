import { createGraphQLClient } from "./createGraphQLClient";

export const createFaucetGraphqlClient = () => {
  const url = `https://rowan-faucet.vercel.app/api/graphql`;
  return createGraphQLClient(url);
};
