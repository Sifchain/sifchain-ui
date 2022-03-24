var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { SigningStargateClient } from "@cosmjs/stargate";
import { stringToPath } from "@cosmjs/crypto";
import { TxRaw } from "@cosmjs/stargate/build/codec/cosmos/tx/v1beta1/tx";
import { NativeDexSignedTransaction } from "../../native";
import { TokenRegistry } from "../../native/TokenRegistry";
import { CosmosWalletProvider } from "./CosmosWalletProvider";
export class DirectSecp256k1HdWalletProvider extends CosmosWalletProvider {
    constructor(context, options) {
        super(context);
        this.context = context;
        this.options = options;
        this.tokenRegistry = TokenRegistry(context);
    }
    static create(context, options) {
        return new DirectSecp256k1HdWalletProvider(context, options);
    }
    isInstalled(chain) {
        return __awaiter(this, void 0, void 0, function* () {
            return true;
        });
    }
    hasConnected(chain) {
        return __awaiter(this, void 0, void 0, function* () {
            return false;
        });
    }
    isChainSupported(chain) {
        return chain.chainConfig.chainType === "ibc";
    }
    canDisconnect(chain) {
        return false;
    }
    disconnect(chain) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Cannot disconnect");
        });
    }
    // inconsequential change for git commit
    getSendingSigner(chain) {
        return __awaiter(this, void 0, void 0, function* () {
            const chainConfig = this.getIBCChainConfig(chain);
            // cosmos = m/44'/118'/0'/0
            const parts = [
                `m`,
                `44'`,
                `${chainConfig.keplrChainInfo.bip44.coinType}'`,
                `0'`,
                `0`,
            ];
            const wallet = yield DirectSecp256k1HdWallet.fromMnemonic(this.options.mnemonic || "", {
                hdPaths: [stringToPath(parts.join("/"))],
                prefix: chainConfig.keplrChainInfo.bech32Config.bech32PrefixAccAddr,
            });
            return wallet;
        });
    }
    connect(chain) {
        return __awaiter(this, void 0, void 0, function* () {
            const wallet = yield this.getSendingSigner(chain);
            const [account] = yield wallet.getAccounts();
            if (!(account === null || account === void 0 ? void 0 : account.address)) {
                throw new Error("No address to connect to");
            }
            return account.address;
        });
    }
    sign(chain, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            const chainConfig = this.getIBCChainConfig(chain);
            const signer = yield this.getSendingSigner(chain);
            const stargate = yield SigningStargateClient.connectWithSigner(chainConfig.rpcUrl, signer);
            const signed = yield stargate.sign(tx.fromAddress, tx.msgs, {
                amount: [tx.fee.price],
                gas: tx.fee.gas,
            }, tx.memo);
            return new NativeDexSignedTransaction(tx, signed);
        });
    }
    broadcast(chain, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            const signed = tx.signed;
            if (signed.bodyBytes == null)
                throw new Error("Invalid signedTx, possibly it was not proto signed.");
            const chainConfig = this.getIBCChainConfig(chain);
            const signer = yield this.getSendingSigner(chain);
            const stargate = yield SigningStargateClient.connectWithSigner(chainConfig.rpcUrl, signer);
            const result = yield stargate.broadcastTx(Uint8Array.from(TxRaw.encode(signed).finish()));
            return result;
        });
    }
}
//# sourceMappingURL=DirectSecp256k1HdWalletProvider.js.map