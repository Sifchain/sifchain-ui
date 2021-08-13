import { UsecaseContext } from "..";
import { IAssetAmount, Chain, TransactionStatus } from "../../entities";
import {
  InterchainApi,
  ExecutableTransaction,
  ChainTransferTransaction,
  InflightTransaction,
} from "./_InterchainApi";
import { SubscribeToTx } from "../peg/utils/subscribeToTx";
import { SifchainChain, EthereumChain } from "../../services/ChainsService";
import { isSupportedEVMChain } from "../utils";

const ETH_CONFIRMATIONS = 50;

export default function createEthereumSifchainApi(
  context: UsecaseContext,
  ethereumChain: EthereumChain,
  sifchainChain: SifchainChain,
) {
  return new EthereumSifchainInterchainApi(
    context,
    ethereumChain,
    sifchainChain,
  );
}

class EthereumSifchainInterchainApi
  extends InterchainApi
  implements InterchainApi {
  subscribeToTx: ReturnType<typeof SubscribeToTx>;

  constructor(context: UsecaseContext, fromChain: Chain, toChain: Chain) {
    super(context, fromChain, toChain);
    this.subscribeToTx = SubscribeToTx(this.context);
  }

  async prepareTransfer(
    assetAmount: IAssetAmount,
    fromAddress: string,
    toAddress: string,
  ) {
    const execute = async (executableTx: ExecutableTransaction) => {
      console.log("execute", executableTx);
      // Get approval
      if (assetAmount.asset.symbol !== "eth") {
        executableTx.emit("approve_started");
        try {
          await this.context.services.ethbridge.approveBridgeBankSpend(
            fromAddress,
            assetAmount,
          );
        } catch (error) {
          executableTx.emit("approve_error");
          return;
        }
        executableTx.emit("approved");
      }

      executableTx.emit("signing");

      const isNativeAsset = this.context.services.chains
        .getAll()
        .some((chain: Chain) => {
          return (
            chain.findAssetWithLikeSymbol(assetAmount.asset.symbol)?.symbol ===
            chain.nativeAsset.symbol
          );
        });

      const lockOrBurnFn = isNativeAsset
        ? this.context.services.ethbridge.burnToSifchain
        : this.context.services.ethbridge.lockToSifchain;

      const pegTx = lockOrBurnFn(toAddress, assetAmount, ETH_CONFIRMATIONS);
      this.subscribeToTx(pegTx);

      const hash = await new Promise<string>((resolve) => {
        pegTx.onTxHash((hash) => {
          resolve(hash.txHash);
        });
      });
      executableTx.emit("sent", { hash });
    };
    return new ExecutableTransaction(
      execute,
      this.fromChain.id,
      this.toChain.id,
      fromAddress,
      toAddress,
      assetAmount,
    );
  }

  async subscribeToTransfer(transferTx: ChainTransferTransaction) {
    const status: TransactionStatus = {
      state: "accepted",
      hash: transferTx.hash,
    };
    if (
      transferTx.fromChainId !== this.fromChain.id ||
      transferTx.toChainId !== this.toChain.id
    ) {
      throw new Error("Cannot subscribe!");
    }

    const inflightTx = new InflightTransaction(status);

    const run = async () => {
      const pegTx = this.context.services.ethbridge.createPegTx(
        ETH_CONFIRMATIONS,
        transferTx.fromSymbol,
        transferTx.hash,
      );
      const unsubscribe = this.subscribeToTx(pegTx);

      try {
        await new Promise((resolve, reject) => {
          pegTx.onComplete(resolve);
          pegTx.onError(reject);
        });
      } catch (error) {
        inflightTx.update("failed", { memo: error.message });
        return;
      } finally {
        unsubscribe();
      }
      inflightTx.update("completed");
    };

    run();
    return inflightTx;
  }
}
