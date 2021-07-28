import { IAsset, IAssetAmount, TxParams } from "./entities";
import { Services } from "./services";
import { CryptoeconomicsRewardType } from "./services/CryptoeconomicsService";
import { EventBusService } from "./services/EventBusService";
import { Usecases } from "./usecases";

// This is a start at providing some kind of in editor documentation for the API
// TODO: Instead of derive these types from the definition we should locate the
// actual type definitions here and apply them to the calls as they are defined deeper in the stack
export type Api = {
  /**
   * Return an event bus.
   * @returns EventBusService
   */
  bus: () => EventBusService;

  /**
   * Initialize Sif wallet. Subscribe to internal state for updates.
   * @returns unsubscribe Function to cancel all subscriptions
   */
  initSifWallet: Usecases["wallet"]["sif"]["initSifWallet"];

  /**
   * Get a list of the current sif wallet's balances.
   * @param address
   * @returns
   */
  getCosmosBalances(address: string): Promise<IAssetAmount[]>;

  /**
   * Send a cosmos transaction
   * @param params transactions parameter
   */
  sendCosmosTransaction(params: TxParams): Promise<any>;

  /**
   * Connect to the sif wallet in keplr.
   * @returns a promise that resolves or rejects when the wallet has connected or failed
   */
  connectToSifWallet(): Promise<void>;

  /**
   * Initialize the eth wallet listeners. Subscribe to internal state for updates.
   * @returns unsubscribe Function to cancel all subscriptions
   */
  initEthWallet(): () => void;

  /**
   * Returns if the ethereum network is a supported network or not
   * @returns boolean - true if the ethereum network is a supprted network or false if it is not.
   */
  isSupportedNetwork(): boolean;

  /**
   * Disconnect metamask wallet.
   * @returns Promise that resolves once disconnected or rejects if there is an error
   */
  disconnectEthWallet(): Promise<void>;

  /**
   * Connect to the eth wallet.
   * @returns Promise that resolves once connected or rejects if there is an error
   */
  connectToEthWallet(): Promise<void>;

  /**
   * Transfers the given ethereum asset to another wallet.
   * @param amount Amount of the transfer
   * @param recipient The recipient address
   * @param asset The ethereum asset type
   */
  transferEthWallet(
    amount: number,
    recipient: string,
    asset: IAsset,
  ): Promise<string>;

  /**
   * Sets up a poll to watch for changes to the cryptoeconomics rewards
   * @param rewardType - "vs" - Validator Subsidy or "lm" - Liquidity Mining
   * @returns Unsubscribe function to stop the poll
   */
  subscribeToRewardData(rewardType: CryptoeconomicsRewardType): () => void;

  /**
   * Dispatches a notification event on the event bus while setting a localstorage flag to say that the notification has been delivered.
   */
  notifyLmMaturity: Usecases["reward"]["notifyLmMaturity"];

  /**
   * Dispatches a notification event on the event bus while setting a localstorage flag to say that the notification has been delivered.
   */
  notifyVsMaturity: Usecases["reward"]["notifyVsMaturity"];

  /**
   * Submit a reqards claim
   * @param object `claimType` "2" for Liquidity Mining "3" for Validator Subsidy. `fromAddress` the sif address claiming the rewards
   */
  claim: Usecases["reward"]["claim"];

  /**
   * Subscribe to pending eth transactions and update elements on the store asthe transactions are updated.
   * @returns Unsubscibe function
   */
  subscribeToUnconfirmedPegTxs: Usecases["peg"]["subscribeToUnconfirmedPegTxs"];

  /**
   * Get supported sif tokens.
   * @returns A list of supported sif tokens
   */
  getSifTokens: Usecases["peg"]["getSifTokens"];

  /**
   * Get supported eth tokens.
   * @returns A list of supported eth tokens
   */
  getEthTokens: Usecases["peg"]["getEthTokens"];

  /**
   * Import an external token to sifchain.
   * @returns An async iterator of PegEvents.
   *
   * ```typescript
   * for await (let event of sifchain.import(AssetAmount("eth", "100"))) {
   *   // match against events
   * }
   * ```
   */
  import: Usecases["peg"]["peg"];

  /**
   * Export a token from sifchain.
   * @returns Promise<TransactionStatus>
   */
  export: Usecases["peg"]["unpeg"];

  /**
   * Setup CLP state watchers. Updating pools when state changes.
   * @returns Unsubscribe function
   */
  initClp: Usecases["clp"]["initClp"];

  /**
   * Swap sif asset amount for the given asset expecting to receive the minimum received amount.
   * @param sentAmount: IAssetAmount
   * @param receivedAsset: IAsset,
   * @param minimumReceived: IAssetAmount
   */
  swap: Usecases["clp"]["swap"];

  /**
   * Add liquidity to the given pool
   * @param nativeAssetAmount: IAssetAmount - The ROWAN asset amount
   * @param externalAssetAmount: IAssetAmount - An external asset amount
   * @returns Promise<TransactionStatus>
   */
  addLiquidity: Usecases["clp"]["addLiquidity"];

  /**
   * Remove liquidity from the given pool
   * @param asset: IAsset - The external asset to remove
   * @param wBasisPoints: string - number between "0" and "10000" where "10000" is 100% of the position in the pool.
   * @param asymmetry: string - number between "-10000" and "10000" where negative numbers indicate a higher proportion of ROWAN and positive numbers indicate a higher proportion of external asset
   */
  removeLiquidity: Usecases["clp"]["removeLiquidity"];

  /**
   * Fetch the current state of pools and update the local pool cache.
   */
  syncPools: Usecases["clp"]["syncPools"];
};

export function createApi(usecases: Usecases, services: Services): Api {
  const { peg, unpeg, ...otherPegUsecases } = usecases.peg;
  return {
    ...usecases.clp,
    import: peg,
    export: unpeg,
    ...otherPegUsecases,
    ...usecases.reward,
    ...usecases.wallet.eth,
    ...usecases.wallet.sif,
    bus: () => services.bus,
  };
}
