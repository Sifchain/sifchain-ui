import { CosmosWalletProvider } from "./CosmosWalletProvider";
import { WalletProviderContext } from "../WalletProvider";

import {
  WalletController,
  ConnectType,
  WalletStates,
  WalletStatus,
} from "@terra-money/wallet-provider";

import {
  LCDClient,
  Coins,
  Msg,
  BankMsg,
  CreateTxOptions,
} from "@terra-money/terra.js";
import { MsgTransfer } from "@terra-money/terra.js/dist/core/ibc-transfer/msgs/MsgTransfer";
import { Coin } from "@terra-money/terra.js/dist/core/Coin";
import * as TWP from "@terra-money/wallet-provider";
import { Chain, IAssetAmount, AssetAmount } from "../../../entities";
import { OfflineSigner, OfflineDirectSigner } from "@cosmjs/proto-signing";
import {
  NativeDexTransaction,
  NativeDexSignedTransaction,
} from "../../../services/utils/SifClient/NativeDexTransaction";
import { EncodeObject } from "@cosmjs/proto-signing";
import { SubscribeToTx } from "clients/bridges/EthBridge/subscribeToTx";
import {
  BroadcastTxResult,
  BroadcastTxSuccess,
  BroadcastTxFailure,
} from "@cosmjs/launchpad";
import {
  SigningStargateClient,
  StargateClient,
  IndexedTx,
} from "@cosmjs/stargate";
import { KeplrWalletProvider } from "./KeplrWalletProvider";
import { NativeAminoTypes } from "../../../services/utils/SifClient/NativeAminoTypes";
import { parseRawLog } from "@cosmjs/stargate/build/logs";

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

    await new Promise<void>(async (resolve, reject) => {
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

  // The only thing that works for us is the Terra wallet's `post` method, which both
  // signs and sends. We just do a "noop" sign here then do the actual post in the broadcast method.
  async sign(
    chain: Chain,
    tx: NativeDexTransaction<EncodeObject>,
  ): Promise<NativeDexSignedTransaction<EncodeObject>> {
    if (!tx.msgs[0]?.typeUrl.includes("MsgTransfer")) {
      throw new Error(
        "Sifchain Terra Station wallet integration currently supports ONLY IBC Transfers!",
      );
    }
    return new NativeDexSignedTransaction<EncodeObject>(tx);
  }

  async broadcast(
    chain: Chain,
    signedTx: NativeDexSignedTransaction<EncodeObject>,
  ): Promise<BroadcastTxResult> {
    const tx = signedTx.raw;

    const chainConfig = this.getIBCChainConfig(chain);
    const stargate = await StargateClient.connect(chainConfig.rpcUrl);

    const controller = this.getWalletController(chain);
    const converter = new NativeAminoTypes();
    const msgs = tx.msgs.map(converter.toAmino.bind(converter));

    // The Terra dist has a MsgTransfer type in it, but it isn't fully supported by the wallet controller yet.
    // We have to do a little monkey-patching to make the Terra wallet take it.

    // Terra Coin type doesn't have a fromAmino, which is used by MsgTransfer.fromAmino...
    // @ts-ignore
    Coin.fromAmino = Coin.fromData;

    // @ts-ignore
    const transfer = MsgTransfer.fromAmino(msgs[0]).toData();

    // Returned transfer doesn't have a toJSON object, which is required for Terra Station...
    const envelope = {
      ...transfer,
      toJSON: () => JSON.stringify(transfer),
    };

    const txDraft = {
      msgs: [envelope],
      memo: tx.memo || "",
      // Fee is auto-calculated by Terra Station
    };

    // @ts-ignore
    const res = await controller.post(txDraft, {
      terraAddress: tx.fromAddress,
    });

    // The ibc tx from terra station doesn't give us any rawLog data, so
    // we fetch the inflight TX to get it.
    let txResponseData: IndexedTx | null = null;
    if (res.success) {
      let retries = 25;
      while (!txResponseData && retries-- > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        txResponseData = await stargate.getTx(res.result.txhash);
      }
    }

    if (!txResponseData) {
      res.success = false;
    }

    if (res.success) {
      // @ts-ignore
      return {
        transactionHash: res.result.txhash,
        rawLog: txResponseData?.rawLog || res.result.raw_log,
        logs: parseRawLog(txResponseData?.rawLog || res.result.raw_log),
      } as BroadcastTxSuccess;
    } else {
      return {
        transactionHash: res.result.txhash,
        height: res.result.height,
        rawLog: txResponseData?.rawLog || res.result.raw_log,
        logs: parseRawLog(txResponseData?.rawLog || res.result.raw_log),
        code: -1,
      } as BroadcastTxFailure;
    }
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
