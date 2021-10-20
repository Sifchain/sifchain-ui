import { CosmosWalletProvider } from "./CosmosWalletProvider";
import { WalletProviderContext } from "../WalletProvider";

import {
  WalletController,
  ConnectType,
  WalletStates,
  WalletStatus,
} from "@terra-money/wallet-provider";

import { LCDClient, Coins, StdFee, Msg, BankMsg } from "@terra-money/terra.js";
import { MsgTransfer } from "@terra-money/terra.js/dist/core/ibc-transfer/msgs/MsgTransfer";
import { Coin } from "@terra-money/terra.js/dist/core/Coin";
import * as TWP from "@terra-money/wallet-provider";
import { Chain, IAssetAmount, AssetAmount } from "../../../entities";
import { OfflineSigner, OfflineDirectSigner } from "@cosmjs/proto-signing";
import {
  NativeDexTransaction,
  NativeDexSignedTransaction,
} from "services/utils/SifClient/NativeDexTransaction";
import { EncodeObject } from "@cosmjs/proto-signing";
import { SubscribeToTx } from "clients/bridges/EthBridge/subscribeToTx";
import { BroadcastTxResult } from "@cosmjs/launchpad";
import { SigningStargateClient, StargateClient } from "@cosmjs/stargate";
import { KeplrWalletProvider } from "./KeplrWalletProvider";
import { NativeAminoTypes } from "../../../services/utils/SifClient/NativeAminoTypes";

// @ts-ignore
window.TWP = TWP;

// Wait 1 tick for subscription to active (you just have to)
const nextTick = () => new Promise((r) => setTimeout(r, 0));

const waitForConnectionStatus = (
  controller: WalletController,
  status: WalletStatus,
): Promise<WalletStates> => {
  return new Promise((resolve, reject) => {
    const states = controller.states();
    const subscription = states.subscribe(
      (value: WalletStates) => {
        if (value.status === status) {
          resolve(value);
          subscription.unsubscribe();
        }
      },
      (e: Error) => {
        reject(e);
        subscription.unsubscribe();
      },
    );
  });
};

export class TerraStationWalletProvider extends CosmosWalletProvider {
  private controllerChainIdLookup: Record<string, WalletController> = {};

  private getLcdClient(chain: Chain) {
    const config = this.getIBCChainConfig(chain);
    return new LCDClient({
      URL: config.restUrl,
      chainID: config.chainId,
    });
  }
  private getWalletController(chain: Chain) {
    const config = this.getIBCChainConfig(chain);
    if (!this.controllerChainIdLookup[config.chainId]) {
      const name = config.chainId.includes("bombay") ? "testnet" : "mainnet";

      const terraChainConfig = {
        name,
        chainID: config.chainId,
        lcd: config.restUrl,
      };
      this.controllerChainIdLookup[config.chainId] = new WalletController({
        defaultNetwork: terraChainConfig,
        walletConnectChainIds: {
          0: terraChainConfig,
          1: terraChainConfig,
        },
      });
    }
    return this.controllerChainIdLookup[config.chainId];
  }

  async connect(chain: Chain) {
    const controller = this.getWalletController(chain);

    await new Promise(async (resolve, reject) => {
      let resolved = false;
      const subscription = controller
        .availableConnectTypes()
        .subscribe(async (value: ConnectType[]) => {
          await nextTick();
          if (value.includes(ConnectType.CHROME_EXTENSION)) {
            resolve();
            resolved = true;
            subscription.unsubscribe();
          }
        });
      // Wait up to a few seconds for Terra chrome extension to show up..
      await new Promise((r) => setTimeout(r, 3000));
      if (!resolved) {
        reject(new Error("Chrome extension not installed"));
        subscription.unsubscribe();
      }
    });
    controller.connect(ConnectType.CHROME_EXTENSION);

    return new Promise<string>((resolve, reject) => {
      const subscription = controller.states().subscribe(
        async (value: WalletStates) => {
          await nextTick();

          if (value.status === WalletStatus.WALLET_CONNECTED) {
            console.log(value.wallets);
            if (!value.wallets.length) {
              reject(new Error("No connections found!"));
            } else {
              resolve(value.wallets[0].terraAddress);
            }
            subscription.unsubscribe();
          }
        },
        (e: Error) => {
          reject(e);
          subscription.unsubscribe();
        },
      );
    });
  }
  async hasConnected(chain: Chain): Promise<boolean> {
    const controller = this.getWalletController(chain);
    return new Promise<boolean>((resolve, reject) => {
      const states = controller.states();
      const subscription = states.subscribe(
        async (value: WalletStates) => {
          await nextTick();
          if (value.status === WalletStatus.WALLET_CONNECTED) {
            controller.connect(ConnectType.CHROME_EXTENSION);
            resolve(true);
          } else if (value.status === WalletStatus.WALLET_NOT_CONNECTED) {
            resolve(false);
          }
          subscription.unsubscribe();
        },
        (e: Error) => {
          reject(e);
          subscription.unsubscribe();
        },
      );
    });
  }
  canDisconnect(chain: Chain): boolean {
    return false;
  }
  disconnect(chain: Chain): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async fetchBalances(chain: Chain, address: string): Promise<IAssetAmount[]> {
    const client = this.getLcdClient(chain);
    const coins = await client.bank.balance(address);

    const balances: IAssetAmount[] = [];
    coins.toArray().forEach((coin) => {
      coin = coin.toDecCoin();
      const asset = chain.lookupAsset(coin.denom);
      if (asset) {
        balances.push(AssetAmount(asset, coin.amount.toString()));
      }
    });
    return balances;
  }

  async sign(
    chain: Chain,
    tx: NativeDexTransaction<EncodeObject>,
  ): Promise<NativeDexSignedTransaction<EncodeObject>> {
    const controller = this.getWalletController(chain);
    const chainConfig = this.getIBCChainConfig(chain);
    const stargate = await StargateClient.connect(chainConfig.rpcUrl);
    const lcdClient = this.getLcdClient(chain);
    const converter = new NativeAminoTypes();
    const msgs = tx.msgs.map(converter.toAmino.bind(converter));

    // const msgs = tx.msgs.map(converter.toAmino.bind(converter));

    const toCamel = (object: Object): Object => {
      return Object.fromEntries(
        Object.entries(object).map(([key, value]) => {
          return [
            key[0] +
              key.slice(1).replace(/[A-Z]/g, (s: string) => s.toUpperCase()),
            typeof value === "object" ? toCamel(object) : value,
          ];
        }),
      );
    };
    const { typeUrl, ...rest } = tx.msgs[0];

    // @ts-ignore
    Coin.fromAmino = Coin.fromData;

    // @ts-ignore
    const transfer = MsgTransfer.fromAmino(msgs[0]).toData();

    const envelope = {
      toJSON: () => JSON.stringify(transfer),
    };

    // @ts-ignore
    const res = controller.post(
      {
        // @ts-ignore
        msgs: [envelope],
        fee: new StdFee(parseFloat(tx.fee.gas), {
          [tx.fee.price.denom]: tx.fee.price.amount,
        }),
        memo: tx.memo || "",
      },
      {
        terraAddress: tx.fromAddress,
      },
    );
    await res;
    throw new Error("Method not implemented.");
  }
  broadcast(
    chain: Chain,
    tx: NativeDexSignedTransaction<EncodeObject>,
  ): Promise<BroadcastTxResult> {
    // noop
    throw new Error("not implemented");
  }

  static create(context: WalletProviderContext) {}
  constructor(public context: WalletProviderContext) {
    super(context);
  }

  async getSendingSigner(
    chain: Chain,
  ): Promise<OfflineSigner & OfflineDirectSigner> {
    return KeplrWalletProvider.prototype.getSendingSigner.call(this, chain);
  }
}
