/* 
  async for future-proofing. At some point, we may want to pull these connections from
  sifnode
*/
export const loadConnectionByChainIds = async ({
  sourceChainId,
  counterpartyChainId,
}: {
  sourceChainId: string;
  counterpartyChainId: string;
}) => {
  return connectionsByChainIds[sourceChainId][counterpartyChainId];
};

const connectionsByChainIds: {
  [chainId: string]: {
    [externalChainId: string]: {
      channelId: string;
    };
  };
} = {
  "sifchain-devnet-042": {
    "cosmoshub-testnet": {
      channelId: "channel-0",
    },
  },
  "cosmoshub-testnet": {
    "sifchain-devnet-042": {
      channelId: "channel-53",
    },
  },
};
