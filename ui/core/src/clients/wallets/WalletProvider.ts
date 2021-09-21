import { Keplr } from "@keplr-wallet/types";
import {
  Network,
  IAssetAmount,
  Chain,
  IBCChainConfig,
  AssetAmount,
} from "../../entities";
import { KeplrWalletProvider } from "./KeplrWalletProvider";
import {
  SigningStargateClient,
  QueryClient,
  setupIbcExtension,
  setupBankExtension,
  setupAuthExtension,
} from "@cosmjs/stargate";
import { OfflineAminoSigner } from "@cosmjs/amino";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import TokenRegistryService from "../../services/TokenRegistryService";
import { DenomTrace } from "@cosmjs/stargate/build/codec/ibc/applications/transfer/v1/transfer";

export type WalletProviderContext = {
  sifRpcUrl: string;
  sifChainId: string;
  sifApiUrl: string;
};

export abstract class WalletProvider {
  abstract context: WalletProviderContext;

  abstract isChainSupported(chain: Chain): boolean;

  // abstract async isEnabled(chain: Chain): Promise<boolean>;
  abstract connect(chain: Chain): Promise<string>;
  abstract hasConnected(chain: Chain): Promise<boolean>;

  abstract canDisconnect(chain: Chain): boolean;
  abstract disconnect(chain: Chain): Promise<void>;

  abstract fetchBalances(
    chain: Chain,
    address: string,
  ): Promise<IAssetAmount[]>;
}
