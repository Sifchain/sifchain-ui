import {
  EthBridge,
  EthBridgeContext,
} from "@sifchain/sdk/src/clients/bridges/EthBridge/EthBridge";

export type EthbridgeServiceContext = EthBridgeContext;

export class EthbridgeService extends EthBridge {}

export default EthBridge.create;
