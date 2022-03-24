var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { CosmosClient, LcdClient, setupAuthExtension, } from "@cosmjs/launchpad";
import { NativeDexClient } from "../../../clients";
import { setupClpExtension } from "./x/clp";
import { setupDispensationExtension, } from "./x/dispensation";
import { setupEthbridgeExtension } from "./x/ethbridge";
function createLcdClient(apiUrl, broadcastMode) {
    return LcdClient.withExtensions({ apiUrl: apiUrl, broadcastMode: broadcastMode }, setupAuthExtension, setupClpExtension, setupEthbridgeExtension, setupDispensationExtension);
}
export class SifUnSignedClient extends CosmosClient {
    constructor(apiUrl, wsUrl = "ws://localhost:26657/websocket", rpcUrl = "http://localhost:26657", broadcastMode) {
        super(apiUrl, broadcastMode);
        this.rpcUrl = rpcUrl;
        this.apiUrl = apiUrl;
        this.lcdClient = createLcdClient(apiUrl, broadcastMode);
        this.swap = this.lcdClient.clp.swap;
        this.getPools = this.lcdClient.clp.getPools;
        this.getAssets = this.lcdClient.clp.getAssets;
        this.addLiquidity = this.lcdClient.clp.addLiquidity;
        this.createPool = this.lcdClient.clp.createPool;
        this.getLiquidityProvider = this.lcdClient.clp.getLiquidityProvider;
        this.removeLiquidity = this.lcdClient.clp.removeLiquidity;
        this.getPool = this.lcdClient.clp.getPool;
        this.burn = this.lcdClient.ethbridge.burn;
        this.lock = this.lcdClient.ethbridge.lock;
        this.claim = this.lcdClient.dispensation.claim;
        this.nativeDexClientPromise = (() => __awaiter(this, void 0, void 0, function* () {
            const chainId = yield this.getChainId();
            const cxn = NativeDexClient.connect(rpcUrl, apiUrl, chainId);
            return cxn;
        }))();
    }
    loadNativeDexClient() {
        return this.nativeDexClientPromise;
    }
}
//# sourceMappingURL=SifUnsignedClient.js.map