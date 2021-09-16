import { UsecaseContext } from "..";
import { interchainTxEmitter, InterchainTx } from "./_InterchainApi";
import { AssetAmount, Network } from "../../entities";
import InterchainUsecase from ".";

type SerializedTx = InterchainTx & {
  $fromChainNetwork: Network;
  $toChainNetwork: Network;
  $symbol: string;
  $amount: string;
};

const PersistentTxList = (context: UsecaseContext) => {
  const key = "transfer_txs";

  const serialize = (tx: InterchainTx) => {
    const { assetAmount, fromChain, toChain, ...rest } = tx;
    return {
      $symbol: assetAmount.symbol,
      $amount: assetAmount.amount.toBigInt().toString(),
      $fromChainNetwork: fromChain.network,
      $toChainNetwork: toChain.network,
      ...rest,
    } as SerializedTx;
  };
  const deserialize = (serializedTx: SerializedTx): InterchainTx => {
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

  const interchainTxs: InterchainTx[] = getRawList().map((item) =>
    deserialize(item),
  );

  return {
    add: (tx: InterchainTx) => {
      interchainTxs.push(tx);
      setRawList(interchainTxs.map((tx) => serialize(tx)));
    },
    remove: (tx: InterchainTx) => {
      interchainTxs.splice(interchainTxs.indexOf(tx), 1);
      setRawList(interchainTxs.map((tx) => serialize(tx)));
    },
    get: () => interchainTxs,
  };
};

export default function InterchainTxManager(
  context: UsecaseContext,
  interchain: ReturnType<typeof InterchainUsecase>,
) {
  const { services, store } = context;
  const txList = PersistentTxList(context);

  const subscribeToInterchainTx = async (tx: InterchainTx) => {
    const api = interchain(tx.fromChain, tx.toChain);

    const isImport = tx.toChain.network === Network.SIFCHAIN;

    try {
      for await (const ev of api.subscribeToTransfer(tx)) {
        const payload = {
          interchainTx: tx,
          transactionStatus: ev,
        };
        store.tx.pendingTransfers[tx.hash] = payload;

        if (ev.state === "accepted") {
          services.bus.dispatch({
            type: isImport
              ? "PegTransactionPendingEvent"
              : "UnpegTransactionPendingEvent",
            payload,
          });
        } else if (ev.state === "completed") {
          // First emit the event so UI can update balances...
          interchainTxEmitter.emit("tx_complete", tx);

          // Then wait a sec so the balance request finishes before notif appears...
          setTimeout(() => {
            services.bus.dispatch({
              type: isImport
                ? "PegTransactionCompletedEvent"
                : "UnpegTransactionCompletedEvent",
              payload,
            });
          }, 1000);
        } else if (ev.state === "failed") {
          services.bus.dispatch({
            type: isImport
              ? "PegTransactionErrorEvent"
              : "UnpegTransactionErrorEvent",
            payload,
          });
        }
      }
    } catch (error) {
      console.error("got error listening to transfer. stopping", error);
    }
    delete store.tx.pendingTransfers[tx.hash];
    txList.remove(tx);
  };

  const onTxSent = (tx: InterchainTx) => {
    console.log("===onTxSent", tx);
    txList.add(tx);
    subscribeToInterchainTx(tx);
  };

  return {
    listenForSentTransfers: () => {
      interchainTxEmitter.on("tx_sent", onTxSent);
      return () => interchainTxEmitter.off("tx_sent", onTxSent);
    },
    loadSavedTransferList() {
      // Load from storage and subscribe on bootup
      txList.get().forEach((tx) => {
        console.log("listening to saved tx", tx);
        subscribeToInterchainTx(tx);
      });
    },
  };
}
