import { NativeDexClient, SifchainChain } from "../clients";
import testnetConfig from "../config/networks/sifchain/config.testnet.json";
import { SIFCHAIN_TESTNET } from "../config/chains/sifchain/sifchain-testnet";
import assetData from "../config/networks/sifchain/assets.sifchain.devnet";
import { TokenRegistry } from "../clients/native/TokenRegistry";
import { IAsset } from "../entities";
import { DirectSecp256k1HdWalletProvider } from "../clients/wallets";

const assets = assetData.assets as IAsset[];

const {
  MNEMONIC = "volcano immense another fold spread degree patient machine sheriff sick agree pitch",
} = process.env;

async function run() {
  const sifchainChain = new SifchainChain({
    assets,
    chainConfig: SIFCHAIN_TESTNET,
  });
  const client = await NativeDexClient.connectByChain(sifchainChain);
  const tokenRegistry = TokenRegistry(testnetConfig);

  const wallet = DirectSecp256k1HdWalletProvider.create(testnetConfig, {
    mnemonic: MNEMONIC,
  });

  const address = await wallet.connect(sifchainChain);

  const tx = client.tx.clp.Swap(
    {
      sentAsset: {
        symbol: "rowan",
      },
      receivedAsset: {
        symbol: "cusdt",
      },
      signer: address,
      sentAmount: "100000",
      minReceivingAmount: "1",
    },
    address,
  );

  // @ts-ignore
  tx.fee.price.denom = "rowan";

  const signed = await wallet.sign(sifchainChain, tx);
  const sent = await wallet.broadcast(sifchainChain, signed);

  console.log(sent);
}
