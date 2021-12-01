import { NativeDexClient, SifchainChain } from "../../clients";
import testnetConfig from "../../config/networks/sifchain/config.testnet.json";
import { SIFCHAIN_TESTNET } from "../../config/chains/sifchain/sifchain-testnet";
import assetData from "../../config/networks/sifchain/assets.sifchain.devnet";
import { IAsset } from "../../entities";
import { DirectSecp256k1HdWalletProvider } from "../../clients/wallets";

const assets = assetData.assets as IAsset[];

// @ts-ignore
SIFCHAIN_TESTNET.keplrChainInfo.gasPriceStep = {
  low: "2500000000000000000",
  medium: "2500000000000000000",
  high: "2500000000000000000",
};

const { MNEMONIC } = process.env;

describe("SwapClient", () => {
  test("swap", async () => {
    const sifchainChain = new SifchainChain({
      assets,
      chainConfig: SIFCHAIN_TESTNET,
    });
    const client = await NativeDexClient.connectByChain(sifchainChain);

    const wallet = DirectSecp256k1HdWalletProvider.create(testnetConfig, {
      mnemonic: MNEMONIC ?? "",
    });

    const address = await wallet.connect(sifchainChain);
    console.log("address", address);

    // @ts-ignore
    NativeDexClient.feeTable.transfer.amount[0].denom = "rowan";
    // @ts-ignore
    NativeDexClient.feeTable.transfer.amount[0].amount = "2500000000000000000";
    // @ts-ignore
    NativeDexClient.feeTable.transfer.gas = "500000";

    const tx = client.tx.clp.Swap(
      {
        sentAsset: {
          symbol: "rowan",
        },
        receivedAsset: {
          symbol: "cusdt",
        },
        signer: address,
        sentAmount: "1000000000000000000",
        minReceivingAmount: "1",
      },
      address,
    );
    const signed = await wallet.sign(sifchainChain, tx);
    const sent = await wallet.broadcast(sifchainChain, signed);

    console.log("sent", sent);
  });
});
