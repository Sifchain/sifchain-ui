import { IAsset, Network } from "@sifchain/sdk";
import {
  LiquidityClient,
  LiquidityContext,
} from "@sifchain/sdk/src/clients/liquidity";
import { TokenRegistryContext } from "@sifchain/sdk/src/clients/native/TokenRegistry";
import Web3 from "web3";
import createChainsService, {
  ChainsServiceContext,
} from "./ChainsService/ChainsService";
import clpService, { ClpServiceContext } from "./ClpService";
import createDataService from "./DataService";
import createDispensationService, {
  IDispensationServiceContext,
} from "./DispensationService";
import ethbridgeService, { EthbridgeServiceContext } from "./EthbridgeService";
import eventBusService, { EventBusServiceContext } from "./EventBusService";
import createIBCService, { IBCServiceContext } from "./IBCService/IBCService";
import sifService, { SifServiceContext } from "./SifService";
import storageService, { StorageServiceContext } from "./StorageService";
import TokenRegistryService from "./TokenRegistryService";
import createWalletService, { WalletServiceContext } from "./WalletService";

export type Services = ReturnType<typeof createServices>;

export type WithService<T extends keyof Services = keyof Services> = {
  services: Pick<Services, T>;
};

export type ServiceContext = {
  blockExplorerUrl: string;
  vanirUrl: string;
  assets: IAsset[];
} & SifServiceContext &
  ClpServiceContext &
  EthbridgeServiceContext &
  ClpServiceContext &
  EventBusServiceContext &
  IDispensationServiceContext & // add contexts from other APIs
  StorageServiceContext &
  IBCServiceContext &
  ChainsServiceContext &
  WalletServiceContext &
  TokenRegistryContext &
  LiquidityContext;

export function createServices(context: ServiceContext) {
  const ChainsService = createChainsService(context);
  const IBCService = createIBCService(context);
  const EthbridgeService = ethbridgeService(context);
  const SifService = sifService(context);
  const ClpService = clpService(context);
  const EventBusService = eventBusService(context);
  const DispensationService = createDispensationService(context);
  const DataService = createDataService(context.vanirUrl);
  const StorageService = storageService(context);
  const WalletService = createWalletService({
    ...context,
    chains: ChainsService.list(),
  });
  const tokenRegistryService = new TokenRegistryService(context);
  const liquidityService = new LiquidityClient(
    context,
    ChainsService.get(Network.SIFCHAIN),
  );

  /* 

    Let's leave the metadata logging in place at least until IBC is off the ground. 
    I have to look this up for someone several times a day.
    
    - McCall
    
  */

  try {
    if (!globalThis.window) throw "";
    if (localStorage.DO_NOT_SPAM) throw "";
    if (location.hostname !== "dex.sifchain.finance") {
      setTimeout(() => {
        IBCService.logIBCNetworkMetadata();
      }, 8 * 1000);
    }
  } catch (e) {
    // do nothing
  }

  return {
    Web3: Web3,
    chains: ChainsService,
    ibc: IBCService,
    clp: ClpService,
    sif: SifService,
    ethbridge: EthbridgeService,
    bus: EventBusService,
    dispensation: DispensationService,
    storage: StorageService,
    wallet: WalletService,
    tokenRegistry: tokenRegistryService,
    liquidity: liquidityService,
    data: DataService,
  };
}
