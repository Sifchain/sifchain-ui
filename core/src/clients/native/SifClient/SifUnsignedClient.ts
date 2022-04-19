import {
  AuthExtension,
  BroadcastMode,
  CosmosClient,
  LcdClient,
  setupAuthExtension,
} from "@cosmjs/launchpad";

import { NativeDexClient } from "../NativeDexClient";
import { ClpExtension, setupClpExtension } from "./x/clp";
import {
  DispensationExtension,
  setupDispensationExtension,
} from "./x/dispensation";
import { EthbridgeExtension, setupEthbridgeExtension } from "./x/ethbridge";

type CustomLcdClient = LcdClient &
  AuthExtension &
  ClpExtension &
  EthbridgeExtension &
  DispensationExtension;

function createLcdClient(
  apiUrl: string,
  broadcastMode: BroadcastMode | undefined,
): CustomLcdClient {
  return LcdClient.withExtensions(
    { apiUrl, broadcastMode },
    setupAuthExtension,
    setupClpExtension,
    setupEthbridgeExtension,
    setupDispensationExtension,
  );
}

type IClpApi = ClpExtension["clp"];
type IEthbridgeApi = EthbridgeExtension["ethbridge"];
type IDispensationApi = DispensationExtension["dispensation"];

export class SifUnSignedClient
  extends CosmosClient
  implements IClpApi, IEthbridgeApi
{
  protected readonly lcdClient: CustomLcdClient;
  rpcUrl: string;
  apiUrl: string;
  private nativeDexClientPromise: Promise<NativeDexClient>;
  constructor(
    apiUrl: string,
    rpcUrl = "http://localhost:26657",
    broadcastMode?: BroadcastMode,
  ) {
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
    this.getPmtpParams = this.lcdClient.clp.getPmtpParams;
    this.getPool = this.lcdClient.clp.getPool;
    this.burn = this.lcdClient.ethbridge.burn;
    this.lock = this.lcdClient.ethbridge.lock;
    this.claim = this.lcdClient.dispensation.claim;
    this.nativeDexClientPromise = (async () => {
      const chainId = await this.getChainId();
      const cxn = NativeDexClient.connect(rpcUrl, apiUrl, chainId);
      return cxn;
    })();
  }

  loadNativeDexClient() {
    return this.nativeDexClientPromise;
  }

  // Clp Extension
  swap: IClpApi["swap"];
  getPools: IClpApi["getPools"];
  getAssets: IClpApi["getAssets"];
  addLiquidity: IClpApi["addLiquidity"];
  createPool: IClpApi["createPool"];
  getLiquidityProvider: IClpApi["getLiquidityProvider"];
  removeLiquidity: IClpApi["removeLiquidity"];
  getPool: IClpApi["getPool"];
  getPmtpParams: IClpApi["getPmtpParams"];

  // Ethbridge Extension
  burn: IEthbridgeApi["burn"];
  lock: IEthbridgeApi["lock"];

  // Dispensation
  claim: IDispensationApi["claim"];
}
