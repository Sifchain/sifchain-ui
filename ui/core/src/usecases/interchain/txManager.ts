import { UsecaseContext } from "..";
import { AssetAmount, Network, TransactionStatus } from "../../entities";
import InterchainUsecase from ".";
import { BridgeTx, bridgeTxEmitter } from "../../clients/bridges/BaseBridge";

type SerializedTx = BridgeTx & {
  $fromChainNetwork: Network;
  $toChainNetwork: Network;
  $symbol: string;
  $amount: string;
};

const PersistentTxList = (context: UsecaseContext) => {
  const key = "transfer_txs";

  const serialize = (tx: BridgeTx) => {
    const { assetAmount, fromChain, toChain, ...rest } = tx;
    return {
      $symbol: assetAmount.symbol,
      $amount: assetAmount.amount.toBigInt().toString(),
      $fromChainNetwork: fromChain.network,
      $toChainNetwork: toChain.network,
      ...rest,
    } as SerializedTx;
  };
  const deserialize = (serializedTx: SerializedTx): BridgeTx => {
    const {
      $amount,
      $symbol,
      $fromChainNetwork,
      $toChainNetwork,
      ...rest
    } = serializedTx;
    return {
      ...rest,
      assetAmount: AssetAmount($symbol, $amount),
      fromChain: context.services.chains.get($fromChainNetwork),
      toChain: context.services.chains.get($toChainNetwork),
    };
  };

  const getRawList = (): SerializedTx[] => {
    try {
      const raw = context.services.storage.getItem(key);
      const array = JSON.parse(raw || "[]") || [];
      return array;
    } catch (error) {
      context.services.storage.setItem(key, "[]");
      return [];
    }
  };
  const setRawList = (list: SerializedTx[]) => {
    context.services.storage.setItem(key, JSON.stringify(list));
  };

  const BridgeTxs: BridgeTx[] = getRawList().map((item) => deserialize(item));

  return {
    add: (tx: BridgeTx) => {
      BridgeTxs.push(tx);
      setRawList(BridgeTxs.map((tx) => serialize(tx)));
    },
    remove: (tx: BridgeTx) => {
      BridgeTxs.splice(BridgeTxs.indexOf(tx), 1);
      setRawList(BridgeTxs.map((tx) => serialize(tx)));
    },
    get: () => BridgeTxs,
  };
};

export default function BridgeTxManager(
  context: UsecaseContext,
  interchain: ReturnType<typeof InterchainUsecase>,
) {
  const { services, store } = context;
  const txList = PersistentTxList(context);

  const subscribeToBridgeTx = async (tx: BridgeTx) => {
    const bridge = interchain(tx.fromChain, tx.toChain);

    const isImport = tx.toChain.network === Network.SIFCHAIN;

    const payload = {
      bridgeTx: tx,
      transactionStatus: {
        state: "accepted",
        hash: tx.hash,
      } as TransactionStatus,
    };
    store.tx.pendingTransfers[tx.hash] = payload;

    services.bus.dispatch({
      type: isImport
        ? "PegTransactionPendingEvent"
        : "UnpegTransactionPendingEvent",
      payload,
    });

    try {
      const didComplete = await bridge.awaitTransferCompletion(tx);
      if (!didComplete) {
        // Silent failure... for one reason or another, we're just done.
      } else {
        // First emit the event so UI can update balances...
        bridgeTxEmitter.emit("tx_complete", tx);

        // Then wait a sec so the balance request finishes before notif appears...
        setTimeout(() => {
          services.bus.dispatch({
            type: isImport
              ? "PegTransactionCompletedEvent"
              : "UnpegTransactionCompletedEvent",
            payload: {
              bridgeTx: tx,
              transactionStatus: {
                state: "completed",
                hash: tx.hash,
              },
            },
          });
        }, 750);
      }
    } catch (error) {
      services.bus.dispatch({
        type: isImport
          ? "PegTransactionErrorEvent"
          : "UnpegTransactionErrorEvent",
        payload: {
          bridgeTx: tx,
          transactionStatus: {
            state: "failed",
            hash: tx.hash,
            memo: error.message,
          },
        },
      });
    }
    delete store.tx.pendingTransfers[tx.hash];
    txList.remove(tx);
  };

  const onTxSent = (tx: BridgeTx) => {
    console.log("===onTxSent", tx);
    txList.add(tx);
    subscribeToBridgeTx(tx);
  };

  return {
    listenForSentTransfers: () => {
      bridgeTxEmitter.on("tx_sent", onTxSent);
      return () => bridgeTxEmitter.off("tx_sent", onTxSent);
    },
    loadSavedTransferList() {
      // Load from storage and subscribe on bootup
      txList.get().forEach((tx) => {
        console.log("listening to saved tx", tx);
        subscribeToBridgeTx(tx);
      });
    },
  };
}
