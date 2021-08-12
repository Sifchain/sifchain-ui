import { CoreConfig } from "./../utils/parseConfig";
import { IAsset, Chain, JsonChainConfig } from "../entities";
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
  chains: JsonChainConfig[];
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
