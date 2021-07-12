import { ChainConfig } from "./../utils/parseConfig";
// Everything here represents services that are effectively remote data storage
export * from "./EthereumService/utils/getMetamaskProvider";

import ethereumService, { EthereumServiceContext } from "./EthereumService";
import ethbridgeService, { EthbridgeServiceContext } from "./EthbridgeService";
import sifService, { SifServiceContext } from "./SifService";
import clpService, { ClpServiceContext } from "./ClpService";
import eventBusService, { EventBusServiceContext } from "./EventBusService";
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
} & EthereumServiceContext &
  SifServiceContext &
  ClpServiceContext &
  EthbridgeServiceContext &
  ClpServiceContext &
  EventBusServiceContext &
  IDispensationServiceContext & // add contexts from other APIs
  CryptoeconomicsServiceContext &
  StorageServiceContext; // add contexts from other APIs

export function createServices(context: ServiceContext) {
  const EthereumService = ethereumService(context);
  const EthbridgeService = ethbridgeService(context);
  const SifService = sifService(context);
  const ClpService = clpService(context);
  const EventBusService = eventBusService(context);
  const DispensationService = createDispensationService(context);

  const CryptoeconomicsService = cryptoeconomicsService(context);
  const StorageService = storageService(context);
  return {
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
