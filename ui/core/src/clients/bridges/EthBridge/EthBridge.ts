import {
  BaseBridge,
  BridgeParams,
  ExecutableTx,
  BridgeTx,
  EthBridgeTx,
} from "../BaseBridge";
import {
  IAsset,
  IAssetAmount,
  getChainsService,
  Network,
  TransactionStatus,
  AssetAmount,
  EthChainConfig,
} from "../../../entities";
import { provider } from "web3-core";
import Web3 from "web3";
import {
  createPegTxEventEmitter,
  PegTxEventEmitter,
} from "../../../services/EthbridgeService/PegTxEventEmitter";
import { confirmTx } from "../../../services/EthbridgeService/utils/confirmTx";
import { Contract } from "web3-eth-contract";
import { erc20TokenAbi } from "../../wallets/ethereum/erc20TokenAbi";
import JSBI from "jsbi";
import { getBridgeBankContract } from "../../../services/EthbridgeService/bridgebankContract";
import { isOriginallySifchainNativeToken } from "../../../usecases/peg/utils/isOriginallySifchainNativeToken";
import { NativeDexClient } from "../../../services/utils/SifClient/NativeDexClient";
import { CosmosWalletProvider } from "../../wallets/cosmos/CosmosWalletProvider";
import Long from "long";
import { BroadcastTxResult } from "@cosmjs/launchpad";
import {
  parseTxFailure,
  parseEthereumTxFailure,
} from "../../../services/SifService/parseTxFailure";
import { isBroadcastTxFailure } from "@cosmjs/launchpad";
import { SubscribeToTx } from "../../../usecases/peg/utils/subscribeToTx";
import { createIteratorSubject } from "../../../utils/iteratorSubject";

export type EthBridgeContext = {
  sifApiUrl: string;
  sifWsUrl: string;
  sifRpcUrl: string;
  sifChainId: string;
  bridgebankContractAddress: string;
  bridgetokenContractAddress: string;
  getWeb3Provider: () => Promise<provider>;
  assets: IAsset[];
  peggyCompatibleCosmosBaseDenoms: Set<string>;
  cosmosWalletProvider: CosmosWalletProvider;
};

export const ETH_ADDRESS = "0x0000000000000000000000000000000000000000";

export const ETH_CONFIRMATIONS = 50;

export class EthBridge extends BaseBridge {
  constructor(public context: EthBridgeContext) {
    super();
  }
  static create(context: EthBridgeContext) {
    return new EthBridge(context);
  }

  // Pull this out to a util?
  // How to handle context/dependency injection?
  private web3: Web3 | null = null;
  ensureWeb3 = async () => {
    if (!this.web3) {
      this.web3 = new Web3(await this.context.getWeb3Provider());
    }
    return this.web3;
  };

  estimateFees(params: BridgeParams): IAssetAmount | undefined {
    if (params.toChain.network === Network.ETHEREUM) {
      const ceth = getChainsService()
        .get(Network.SIFCHAIN)
        .lookupAssetOrThrow("ceth");

      const feeNumber = isOriginallySifchainNativeToken(params.assetAmount)
        ? "35370000000000000"
        : "35370000000000000";

      return AssetAmount(ceth, feeNumber);
    }
  }

  private async transferToEth(params: BridgeParams) {
    const feeAmount = await this.estimateFees(params);
    const nativeChain = params.fromChain;

    const web3 = await this.ensureWeb3();
    const ethereumChainId = await web3.eth.net.getId();
    const client = await NativeDexClient.connectByChain(nativeChain);

    const tx = isOriginallySifchainNativeToken(params.assetAmount.asset)
      ? client.tx.ethbridge.Lock(
          {
            ethereumReceiver: params.toAddress,

            amount: params.assetAmount.toBigInt().toString(),
            symbol:
              params.assetAmount.asset.ibcDenom ||
              params.assetAmount.asset.symbol,
            cosmosSender: params.fromAddress,
            ethereumChainId: Long.fromString(`${ethereumChainId}`),
            // ethereumReceiver: tokenAddress,
            cethAmount: feeAmount!.toBigInt().toString(),
          },
          params.fromAddress,
        )
      : client.tx.ethbridge.Burn(
          {
            ethereumReceiver: params.toAddress,

            amount: params.assetAmount.toBigInt().toString(),
            symbol:
              params.assetAmount.asset.ibcDenom ||
              params.assetAmount.asset.symbol,
            cosmosSender: params.fromAddress,
            ethereumChainId: Long.fromString(`${ethereumChainId}`),
            // ethereumReceiver: tokenAddress,
            cethAmount: feeAmount!.toBigInt().toString(),
          },
          params.fromAddress,
        );

    const provider = this.context.cosmosWalletProvider;

    const signed = await provider.sign(tx, nativeChain);
    const sent = await provider.broadcast(signed, nativeChain);

    return sent;
  }

  async getRequiredApprovalAmount(params: BridgeParams) {
    if (
      params.fromChain.network === Network.ETHEREUM &&
      params.assetAmount.asset.symbol.toLowerCase() === "eth"
    ) {
      if (
        !(await this.hasApprovedBridgeBankSpend(
          params.fromAddress,
          params.assetAmount,
        ))
      ) {
        return params.assetAmount;
      }
    }
    return undefined;
  }

  async approveTransfer(params: BridgeParams) {
    if (
      params.fromChain.network === Network.ETHEREUM &&
      params.assetAmount.asset.symbol.toLowerCase() === "eth"
    ) {
      return this.approveBridgeBankSpend(
        params.fromAddress,
        params.assetAmount,
      );
    }
  }

  private async transferFromEth(params: BridgeParams) {
    const chainConfig = params.fromChain.chainConfig as EthChainConfig;
    const web3 = await this.ensureWeb3();
    const web3ChainId = await web3.eth.getChainId();
    if (+chainConfig.chainId !== web3ChainId) {
      throw new Error(
        `Invalid EVM chain id! Got ${web3ChainId}, expected ${+chainConfig.chainId}.`,
      );
    }

    let lockOrBurnFn;
    if (isOriginallySifchainNativeToken(params.assetAmount.asset)) {
      lockOrBurnFn = this.burnToSifchain;
    } else {
      lockOrBurnFn = this.lockToSifchain;
    }

    const pegTx = await lockOrBurnFn.call(
      this,
      params.toAddress,
      params.assetAmount,
      ETH_CONFIRMATIONS,
    );
    this.subscribeToTx(pegTx, console.log.bind(console, "subscribtion"));
    return pegTx;
  }

  transfer(params: BridgeParams): ExecutableTx {
    return new ExecutableTx(async (emit) => {
      const isImport = params.toChain.network === Network.SIFCHAIN;

      const doThrow = () => {
        throw new Error(
          `Cannot use ethbridge for transfer: ${params.fromChain.displayName} => ${params.toChain.displayName}`,
        );
      };
      if (isImport && params.fromChain.chainConfig.chainType !== "eth") {
        doThrow();
      } else if (!isImport && params.toChain.chainConfig.chainType !== "eth") {
        doThrow();
      }

      emit({ type: "signing" });

      if (isImport) {
        const approvalAmount = await this.getRequiredApprovalAmount(params);
        if (approvalAmount) {
          try {
            emit({ type: "approve_started" });
            await this.approveBridgeBankSpend(
              params.fromAddress,
              params.assetAmount,
            );
            emit({ type: "approved" });
          } catch (error) {
            emit({
              type: "approve_error",
              tx: parseEthereumTxFailure({
                transactionHash: "",
                rawLog: error.message,
              }),
            });
            return;
          }
        }

        emit({ type: "signing" });
        const pegTx = await this.transferFromEth(params);

        try {
          const hash = await new Promise<string>((resolve, reject) => {
            pegTx.onError((error) => reject(error.payload));
            pegTx.onTxHash((hash) => resolve(hash.txHash));
          });

          emit({ type: "sent", tx: { state: "completed", hash } });

          return {
            ...params,
            fromChain: params.fromChain,
            toChain: params.toChain,
            hash: hash,
          } as EthBridgeTx;
        } catch (transactionStatus) {
          console.log("catch", transactionStatus);
          emit({
            type: "tx_error",
            tx: parseEthereumTxFailure(transactionStatus),
          });
        }
      } else {
        try {
          const tx = await this.transferToEth(params);
          const result = await NativeDexClient.parseTxResult(tx);

          if (isBroadcastTxFailure(tx)) {
            emit({ type: "tx_error", tx: result });
            return;
          }

          emit({ type: "sent", tx: result });

          return {
            ...params,
            hash: result.hash,
            fromChain: params.fromChain,
            toChain: params.toChain,
          } as EthBridgeTx;
        } catch (error) {
          emit({
            type: "tx_error",
            tx: parseTxFailure({
              transactionHash: "",
              rawLog: error.message.toString(),
            }),
          });
        }
      }
    });
  }

  async *subscribeToTransfer(
    transferTx: BridgeTx,
  ): AsyncGenerator<TransactionStatus> {
    const pegTx = this.createPegTx(
      ETH_CONFIRMATIONS,
      transferTx.assetAmount.asset.ibcDenom ||
        transferTx.assetAmount.asset.symbol,
      transferTx.hash,
    );
    const { iterator, feed, end } = createIteratorSubject<TransactionStatus>();
    this.subscribeToTx(pegTx, (tx: TransactionStatus) => {
      feed(tx);
      if (tx.state === "completed" || tx.state === "failed") end();
    });
    for await (const ev of iterator) {
      yield ev;
    }
  }

  /**
   * Create an event listener to report status of a peg transaction.
   * Usage:
   * const tx = createPegTx(50)
   * tx.setTxHash('0x52ds.....'); // set the hash to lookup and confirm on the blockchain
   * @param confirmations number of confirmations before pegtx is considered confirmed
   */
  createPegTx(
    confirmations: number,
    symbol?: string,
    txHash?: string,
  ): PegTxEventEmitter {
    console.log("createPegTx", {
      confirmations,
      symbol,
      txHash,
    });
    const emitter = createPegTxEventEmitter(txHash, symbol);

    // decorate pegtx to invert dependency to web3 and confirmations
    emitter.onTxHash(async ({ payload: txHash }) => {
      const web3 = await this.ensureWeb3();
      confirmTx({
        web3,
        txHash,
        confirmations,
        onSuccess() {
          emitter.emit({ type: "Complete", payload: null });
        },
        onCheckConfirmation(count) {
          emitter.emit({ type: "EthConfCountChanged", payload: count });
        },
      });
    });

    return emitter;
  }

  /**
   * Gets a list of transactionHashes found as _from keys within the given events within a given blockRange from the current block
   * @param {*} address eth address to correlate transactions with
   * @param {*} contract web3 contract
   * @param {*} eventList event name list of events (must have an addresskey)
   * @param {*} blockRange number of blocks from the current block header to search
   */
  async getEventTxsInBlockrangeFromAddress(
    address: string,
    contract: Contract,
    eventList: string[],
    blockRange: number,
  ) {
    const web3 = await this.ensureWeb3();
    const latest = await web3.eth.getBlockNumber();
    const fromBlock = Math.max(latest - blockRange, 0);
    const allEvents = await contract.getPastEvents("allEvents", {
      // filter:{_from:address}, // if _from was indexed we could do this
      fromBlock,
      toBlock: "latest",
    });

    // unfortunately because _from is not an indexed key we have to manually filter
    // TODO: ask peggy team to index the _from field which would make this more efficient
    const txs: { symbol: string; hash: string }[] = [];
    for (let event of allEvents) {
      const isEventWeCareAbout = eventList.includes(event.event);

      const matchesInputAddress =
        address &&
        event?.returnValues?._from?.toLowerCase() === address.toLowerCase();

      if (isEventWeCareAbout && matchesInputAddress && event.transactionHash) {
        txs.push({
          hash: event.transactionHash,
          symbol: event.returnValues?._symbol,
        });
      }
    }
    return txs;
  }

  async addEthereumAddressToPeggyCompatibleCosmosAssets() {
    /* 
       Should be called on load. This is a hack to make cosmos assets peggy compatible 
       while the SDK bridge abstraction is a WIP.
     */
    for (let asset of this.context.assets) {
      try {
        if (this.context.peggyCompatibleCosmosBaseDenoms.has(asset.symbol)) {
          asset.address = await this.fetchTokenAddress(asset);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }

  async hasApprovedBridgeBankSpend(address: string, amount: IAssetAmount) {
    // This will popup an approval request in metamask
    const web3 = await this.ensureWeb3();
    const tokenContract = new web3.eth.Contract(
      erc20TokenAbi,
      amount.asset.address!,
    );

    // TODO - give interface option to approve unlimited spend via web3.utils.toTwosComplement(-1);
    // NOTE - We may want to move this out into its own separate function.
    // Although I couldn't think of a situation we'd call allowance separately from approve
    const hasAlreadyApprovedSpend = await tokenContract.methods
      .allowance(address, this.context.bridgebankContractAddress)
      .call();
    if (
      JSBI.lessThanOrEqual(
        amount.toBigInt(),
        JSBI.BigInt(hasAlreadyApprovedSpend),
      )
    ) {
      return true;
    }
    return false;
  }

  async approveBridgeBankSpend(address: string, amount: IAssetAmount) {
    // This will popup an approval request in metamask
    const web3 = await this.ensureWeb3();
    const tokenContract = new web3.eth.Contract(
      erc20TokenAbi,
      amount.asset.address!,
    );

    const sendArgs = {
      from: address,
      value: 0,
      gas: 100000,
    };
    const res = await tokenContract.methods
      .approve(
        this.context.bridgebankContractAddress,
        amount.toBigInt().toString(),
      )
      .send(sendArgs);
    console.log("approveBridgeBankSpend:", res);
    return res;
  }

  async lockToSifchain(
    sifRecipient: string,
    assetAmount: IAssetAmount,
    confirmations: number,
  ) {
    const pegTx = this.createPegTx(confirmations, assetAmount.asset.symbol);

    function handleError(err: any) {
      console.log("lockToSifchain: handleError: ", err);
      pegTx.emit({
        type: "Error",
        payload: {
          hash: "",
          rawLog: err.message.toString(),
        },
      });
    }

    try {
      const web3 = await this.ensureWeb3();
      const cosmosRecipient = Web3.utils.utf8ToHex(sifRecipient);

      const bridgeBankContract = await getBridgeBankContract(
        web3,
        this.context.bridgebankContractAddress,
      );
      const accounts = await web3.eth.getAccounts();
      const coinDenom =
        assetAmount.asset.ibcDenom || assetAmount.asset.address || ETH_ADDRESS; // eth address is ""

      const amount = assetAmount.toBigInt().toString();
      const fromAddress = accounts[0];

      const sendArgs = {
        from: fromAddress,
        value: coinDenom === ETH_ADDRESS ? amount : 0,
        gas: 150000,
      };

      console.log(
        "lockToSifchain: bridgeBankContract.lock",
        JSON.stringify({ cosmosRecipient, coinDenom, amount, sendArgs }),
      );

      bridgeBankContract.methods
        .lock(cosmosRecipient, coinDenom, amount)
        .send(sendArgs)
        .on("transactionHash", (hash: string) => {
          console.log("lockToSifchain: bridgeBankContract.lock TX", hash);
          pegTx.setTxHash(hash);
        })
        .on("error", (err: any) => {
          console.log("lockToSifchain: bridgeBankContract.lock ERROR", err);
          handleError(err);
        });
    } catch (err) {
      handleError(err);
    }

    return pegTx;
  }

  /**
   * Get a list of unconfirmed transaction hashes associated with
   * a particular address and return pegTxs associated with that hash
   * @param address contract address
   * @param confirmations number of confirmations required
   */
  async fetchUnconfirmedLockBurnTxs(
    address: string,
    confirmations: number,
  ): Promise<PegTxEventEmitter[]> {
    const web3 = await this.ensureWeb3();

    const bridgeBankContract = await getBridgeBankContract(
      web3,
      this.context.bridgebankContractAddress,
    );

    const txs = await this.getEventTxsInBlockrangeFromAddress(
      address,
      bridgeBankContract,
      ["LogBurn", "LogLock"],
      confirmations,
    );

    return txs.map(({ hash, symbol }) =>
      this.createPegTx(confirmations, symbol, hash),
    );
  }

  async burnToSifchain(
    sifRecipient: string,
    assetAmount: IAssetAmount,
    confirmations: number,
    address?: string,
  ) {
    console.log(
      "burnToSifchain",
      sifRecipient,
      assetAmount.asset.symbol,
      assetAmount.amount.toBigInt().toString(),
      confirmations,
      address,
    );

    const pegTx = this.createPegTx(confirmations, assetAmount.asset.symbol);

    function handleError(err: any) {
      console.log("burnToSifchain: handleError ERROR", err);
      pegTx.emit({
        type: "Error",
        payload: {
          hash: "",
          rawLog: err.message.toString(),
        },
      });
    }

    try {
      const web3 = await this.ensureWeb3();
      const cosmosRecipient = Web3.utils.utf8ToHex(sifRecipient);

      const bridgeBankContract = await getBridgeBankContract(
        web3,
        this.context.bridgebankContractAddress,
      );
      const accounts = await web3.eth.getAccounts();
      const coinDenom = assetAmount.asset.address;
      const amount = assetAmount.toBigInt().toString();
      const fromAddress = address || accounts[0];

      const sendArgs = {
        from: fromAddress,
        value: 0,
        gas: 150000, // Note: This chose in lieu of burn(params).estimateGas({from})
      };

      bridgeBankContract.methods
        .burn(cosmosRecipient, coinDenom, amount)
        .send(sendArgs)
        .on("transactionHash", (hash: string) => {
          console.log("burnToSifchain: bridgeBankContract.burn TX", hash);
          pegTx.setTxHash(hash);
        })
        .on("error", (err: any) => {
          console.log("burnToSifchain: bridgeBankContract.burn ERROR", err);
          handleError(err);
        });
    } catch (err) {
      handleError(err);
    }

    return pegTx;
  }

  async fetchSymbolAddress(symbol: string) {
    return this.fetchTokenAddress(
      getChainsService()
        .get(Network.SIFCHAIN)
        .findAssetWithLikeSymbolOrThrow(symbol),
    );
  }

  async fetchTokenAddress(
    // asset to fetch token address for
    asset: IAsset,
    // optional: pass in HTTP, or other provider (for testing)
    loadWeb3Instance: () => Promise<Web3> | Web3 = this.ensureWeb3,
  ): Promise<string | undefined> {
    // const web3 = new Web3(createWeb3WsProvider());
    const web3 = await loadWeb3Instance();
    const bridgeBankContract = await getBridgeBankContract(
      web3,
      this.context.bridgebankContractAddress,
    );

    const possibleSymbols = [
      // IBC assets with dedicated decimal-precise contracts are uppercase
      asset.displaySymbol.toUpperCase(),
      // remove c prefix
      asset.symbol.replace(/^c/, ""),
      // remove e prefix
      asset.symbol.replace(/^e/, ""),
      // display symbol goes before ibc denom because the dedicated decimal-precise contracts
      // utilize the display symbol
      asset.displaySymbol,
      asset.ibcDenom,
      asset.symbol,
      "e" + asset.symbol,
    ].filter(Boolean);

    for (let symbol of possibleSymbols) {
      // Fetch the token address from bridgebank
      let tokenAddress = await bridgeBankContract.methods
        .getBridgeToken(symbol)
        .call();

      // Token address is a hex number. If it is non-zero (not ethereum or empty) when parsed, return it.
      if (+tokenAddress) {
        return tokenAddress;
      }
      // If this is ethereum, and the token address is empty, return the ethereum address
      if (tokenAddress === ETH_ADDRESS && symbol?.endsWith("eth")) {
        return tokenAddress;
      }
    }
  }

  async fetchAllTokenAddresses(
    // optional: pass in HTTP, or other provider (for testing)
    loadWeb3Instance: () => Promise<Web3> | Web3 = this.ensureWeb3,
  ) {
    // await new Promise((r) => setTimeout(r, 8000));
    // console.log("loading tokens for ", bridgebankContractAddress);
    // try {
    //   const tokens: Record<string, string> = {};
    //   for (let asset of assets.filter(
    //     (a) => a.network === Network.SIFCHAIN,
    //   )) {
    //     if (tokens[asset.displaySymbol] || !asset.symbol) continue;
    //     try {
    //       tokens[asset.symbol] = await this.fetchTokenAddress(
    //         asset,
    //         loadWeb3Instance,
    //       );
    //     } catch (error) {
    //       console.error("Error fetching eth data for", asset.symbol, error);
    //     }
    //   }
    //   console.log("\n\n\n\n\n\n\n");
    //   console.log(tokens);
    //   return tokens;
    // } catch (e) {
    //   console.error(e);
    // }
  }

  subscribeToTx(
    tx: PegTxEventEmitter,
    onUpdated: (tx: TransactionStatus) => void,
  ) {
    function unsubscribe() {
      tx.removeListeners();
    }

    tx.onTxHash(({ txHash }) => {
      console.log("onTxHash", txHash);
      onUpdated({
        hash: txHash,
        memo: "Transaction Accepted",
        state: "accepted",
        symbol: tx.symbol,
      });
    });

    tx.onComplete(({ txHash }) => {
      onUpdated({
        hash: txHash,
        memo: "Transaction Complete",
        state: "completed",
      });

      // tx is complete so we can unsubscribe
      unsubscribe();
    });

    tx.onError((err) => {
      onUpdated({
        hash: tx.hash || "",
        memo: err.payload.memo || "Transaction Failed",
        state: "failed",
      });
    });

    // HACK: Trigger all hashHandlers
    // Maybe make this some kind of ready function?
    if (tx.hash) tx.setTxHash(tx.hash);

    return unsubscribe;
  }
}
