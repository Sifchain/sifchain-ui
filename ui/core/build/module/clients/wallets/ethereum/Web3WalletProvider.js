var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
import { WalletProvider } from "../WalletProvider";
import { AssetAmount } from "../../../entities";
import Web3 from "web3";
import { erc20TokenAbi } from "./erc20TokenAbi";
import JSBI from "jsbi";
import RateLimitProtector from "../../../utils/RateLimitProtector";
// NOTE(ajoslin): Web3WalletProvider doesn't actually sign anything yet,
// all it has to do is approve amounts to contracts.
export class Web3Transaction {
  constructor(contractAddress) {
    this.contractAddress = contractAddress;
  }
}
export function isEventEmittingProvider(provider) {
  if (!provider || typeof provider === "string") return false;
  return typeof provider.on === "function";
}
export class Web3WalletProvider extends WalletProvider {
  constructor(context, options) {
    super();
    this.context = context;
    this.options = options;
    this.fetchBalance = new RateLimitProtector({
      padding: 100,
    }).buildAsyncShield(this.fetchBalance, this);
  }
  isInstalled(chain) {
    return __awaiter(this, void 0, void 0, function* () {
      return true;
    });
  }
  onProviderEvent(eventName, callback) {
    return __awaiter(this, void 0, void 0, function* () {
      const web3 = yield this.getWeb3();
      if (!isEventEmittingProvider(web3.currentProvider)) return () => {};
      web3.currentProvider.on(eventName, () => callback());
      return () => {
        var _a;
        return (_a = web3.currentProvider) === null || _a === void 0
          ? void 0
          : _a.off(eventName, callback);
      };
    });
  }
  onChainChanged(callback) {
    return this.onProviderEvent("chainChanged", callback);
  }
  onAccountChanged(callback) {
    return this.onProviderEvent("accountsChanged", callback);
  }
  getWeb3() {
    return __awaiter(this, void 0, void 0, function* () {
      if (!this.web3Promise) {
        this.web3Promise = (() =>
          __awaiter(this, void 0, void 0, function* () {
            const provider = yield this.options.getWeb3Provider();
            if (!provider) throw new Error("Web3 provider not found!");
            return new Web3(provider);
          }))();
      }
      return this.web3Promise;
    });
  }
  getRequiredApprovalAmount(chain, tx, assetAmount) {
    return __awaiter(this, void 0, void 0, function* () {
      if (assetAmount.symbol.toLowerCase() === "eth") {
        return AssetAmount(assetAmount.asset, "0");
      }
      // This will popup an approval request in metamask
      const web3 = yield this.getWeb3();
      const tokenContract = new web3.eth.Contract(
        erc20TokenAbi,
        assetAmount.address,
      );
      // TODO - give interface option to approve unlimited spend via web3.utils.toTwosComplement(-1);
      // NOTE - We may want to move this out into its own separate function.
      // Although I couldn't think of a situation we'd call allowance separately from approve
      const hasAlreadyApprovedSpend = yield tokenContract.methods
        .allowance(tx.fromAddress, tx.msgs[0].contractAddress)
        .call();
      if (
        JSBI.lessThan(
          JSBI.BigInt(hasAlreadyApprovedSpend),
          assetAmount.toBigInt(),
        )
      ) {
        return assetAmount;
      }
      return AssetAmount(assetAmount.asset, "0");
    });
  }
  approve(chain, tx, amount) {
    return __awaiter(this, void 0, void 0, function* () {
      const web3 = yield this.getWeb3();
      const tokenContract = new web3.eth.Contract(
        erc20TokenAbi,
        amount.asset.address,
      );
      const requiredAmount = yield this.getRequiredApprovalAmount(
        chain,
        tx,
        amount,
      );
      if (
        requiredAmount === null || requiredAmount === void 0
          ? void 0
          : requiredAmount.greaterThan("0")
      ) {
        const sendArgs = {
          from: tx.fromAddress,
          value: 0,
          gas: 150000,
        };
        const res = yield tokenContract.methods
          .approve(tx.msgs[0].contractAddress, amount.toBigInt().toString())
          .send(sendArgs);
      }
    });
  }
  sign(chain, tx) {
    throw "not implemented; implementation in ethbridge for all eth tx";
  }
  broadcast(chain, tx) {
    throw "not implemented; implementation in ethbridge for all eth tx";
  }
  getEthChainConfig(chain) {
    if (chain.chainConfig.chainType !== "eth") {
      throw new Error(this.constructor.name + " only accepts eth chainTypes");
    }
    return chain.chainConfig;
  }
  isChainSupported(chain) {
    return chain.chainConfig.chainType === "eth";
  }
  connect(chain) {
    return __awaiter(this, void 0, void 0, function* () {
      const web3 = yield this.getWeb3();
      const [address] = yield web3.eth.getAccounts();
      return address;
    });
  }
  hasConnected(chain) {
    return __awaiter(this, void 0, void 0, function* () {
      return false;
    });
  }
  canDisconnect(chain) {
    return false;
  }
  disconnect(chain) {
    return __awaiter(this, void 0, void 0, function* () {});
  }
  fetchBalance(chain, address, symbol) {
    return __awaiter(this, void 0, void 0, function* () {
      const asset = chain.findAssetWithLikeSymbolOrThrow(symbol);
      const web3 = yield this.getWeb3();
      if (asset.symbol === chain.nativeAsset.symbol) {
        return AssetAmount(asset, yield web3.eth.getBalance(address));
      }
      if (!asset.address) {
        return AssetAmount(asset, "0");
      }
      const contract = new web3.eth.Contract(
        erc20TokenAbi,
        asset.address.toLowerCase(),
      );
      let amount = "0";
      try {
        amount = yield contract.methods.balanceOf(address).call();
      } catch (error) {
        console.error("token fetch error", asset);
      }
      return AssetAmount(asset, amount);
    });
  }
  fetchBalances(chain, address) {
    return __awaiter(this, void 0, void 0, function* () {
      console.log("running");
      return Promise.all(
        chain.assets.map((asset) =>
          __awaiter(this, void 0, void 0, function* () {
            return this.fetchBalance(chain, address, asset.symbol);
          }),
        ),
      );
    });
  }
}
//# sourceMappingURL=Web3WalletProvider.js.map
