import { CoreConfig } from "./../utils/parseConfig";
import { IAsset, Chain, Network } from "../entities";
// Everything here represents services that are effectively remote data storage
export * from "./EthereumService/utils/getMetamaskProvider";

import createIBCService, { IBCServiceContext } from "./IBCService/IBCService";
import ethereumService, { EthereumServiceContext } from "./EthereumService";
import ethbridgeService, { EthbridgeServiceContext } from "./EthbridgeService";
import sifService, { SifServiceContext } from "./SifService";
import clpService, { ClpServiceContext } from "./ClpService";
import eventBusService, { EventBusServiceContext } from "./EventBusService";
import createChainsService, {
  ChainsServiceContext,
} from "./ChainsService/ChainsService";
import createDispensationService, {
  IDispensationServiceContext,
} from "./DispensationService";
import cryptoeconomicsService, {
  CryptoeconomicsServiceContext,
} from "./CryptoeconomicsService";
import storageService, { StorageServiceContext } from "./StorageService";

export type Services = ReturnType<typeof createServices>;

export type WithService<T extends keyof Services = keyof Services> = {
  services: Pick<Services, T>;
};

export type ServiceContext = {
  blockExplorerUrl: string;
  assets: IAsset[];
} & EthereumServiceContext &
  SifServiceContext &
  ClpServiceContext &
  EthbridgeServiceContext &
  ClpServiceContext &
  EventBusServiceContext &
  IDispensationServiceContext & // add contexts from other APIs
  CryptoeconomicsServiceContext &
  StorageServiceContext &
  IBCServiceContext &
  ChainsServiceContext;

export function createServices(context: ServiceContext) {
  const ChainsService = createChainsService(context);
  const IBCService = createIBCService(context);
  const EthereumService = ethereumService(context);
  const EthbridgeService = ethbridgeService(context);
  const SifService = sifService(context);
  const ClpService = clpService(context);
  const EventBusService = eventBusService(context);
  const DispensationService = createDispensationService(context);
  const CryptoeconomicsService = cryptoeconomicsService(context);
  const StorageService = storageService(context);
  /* 

    Let's leave the metadata logging in place at least until IBC is off the ground. 
    I have to look this up for someone several times a day.
    
    - McCall
    
  */
  try {
    if (!global.window) throw "";
    IBCService.logIBCNetworkMetadata(Network.SIFCHAIN);
    IBCService.logIBCNetworkMetadata(Network.COSMOSHUB);
    EthbridgeService?.fetchAllTokenAddresses();
  } catch (e) {}

  return {
    chains: ChainsService,
    ibc: IBCService,
    clp: ClpService,
    eth: EthereumService,
    sif: SifService,
    ethbridge: EthbridgeService,
    bus: EventBusService,
    dispensation: DispensationService,
    cryptoeconomics: CryptoeconomicsService,
    storage: StorageService,
  };
}
