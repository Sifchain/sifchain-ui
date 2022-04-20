import { TxHash, Address, IAsset, IAssetAmount } from "@sifchain/sdk";

type Msg = { type: string; value: any }; // make entity

export type IWalletServiceState = {
  address: Address;
  accounts: Address[];
  connected: boolean;
  balances: IAssetAmount[];
  log: string;
};

export type IWalletService = {
  getState: () => IWalletServiceState;
  onProviderNotFound(handler: () => void): () => void;
  onChainIdDetected(handler: (chainId: string) => void): () => void;
  isConnected(): boolean;
  getSupportedTokens: () => IAsset[];
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  transfer(params: any): Promise<TxHash>;
  getBalance(address?: Address, asset?: IAsset): Promise<IAssetAmount[]>;
  signAndBroadcast(msg: Msg, memo?: string): Promise<any>;
  setPhrase(phrase: string): Promise<Address>;
  purgeClient(): void;
};
