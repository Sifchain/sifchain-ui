import { WalletProvider, WalletProviderContext } from "../WalletProvider";
import {
  Chain,
  IAssetAmount,
  EthChainConfig,
  AssetAmount,
} from "../../../entities";
import { provider } from "web3-core";
import Web3 from "web3";
import { erc20TokenAbi } from "./erc20TokenAbi";

export class Web3WalletProvider extends WalletProvider {
  constructor(
    public context: WalletProviderContext,
    private options: {
      getWeb3Provider: () => Promise<provider>;
    },
  ) {
    super();
  }

  getEthChainConfig(chain: Chain): EthChainConfig {
    if (chain.chainConfig.chainType !== "eth") {
      throw new Error(this.constructor.name + " only accepts eth chainTypes");
    }
    return chain.chainConfig as EthChainConfig;
  }

  isChainSupported(chain: Chain) {
    return chain.chainConfig.chainType === "eth";
  }

  async getWeb3() {
    const provider = await this.options.getWeb3Provider();
    if (!provider) throw new Error("Web3 provider not found!");
    return new Web3(provider);
  }

  async connect(chain: Chain): Promise<string> {
    const web3 = await this.getWeb3();
    const [address] = await web3.eth.getAccounts();
    return address;
  }
  hasConnected(chain: Chain): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  canDisconnect(chain: Chain): boolean {
    throw new Error("Method not implemented.");
  }
  disconnect(chain: Chain): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async fetchBalances(chain: Chain, address: string): Promise<IAssetAmount[]> {
    const web3 = await this.getWeb3();

    return Promise.all(
      chain.assets.map(async (asset) => {
        if (asset.symbol === chain.nativeAsset.symbol) {
          return AssetAmount(asset, await web3.eth.getBalance(address));
        }
        if (!asset.address) {
          return AssetAmount(asset, "0");
        }
        const contract = new web3.eth.Contract(erc20TokenAbi, asset.address);
        let amount = "0";
        try {
          amount = await contract.methods.balanceOf(asset.address).call();
        } catch (error) {
          console.error("token fetch error", asset);
        }
        return AssetAmount(asset, amount);
      }),
    );
  }
}
