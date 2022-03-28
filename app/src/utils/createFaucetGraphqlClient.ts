import { createGraphQLClient } from "./createGraphQLClient";

export const createFaucetGraphqlClient = () => {
  const url = `https://rowan-faucet.vercel.app/api/graphql`;
  // const url = `http://localhost:3000/api/graphql`;
  return createGraphQLClient(url);
};
