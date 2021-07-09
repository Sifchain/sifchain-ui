import {
  Account,
  BroadcastMode,
  CosmosFeeTable,
  GasLimits,
  GasPrice,
  OfflineSigner,
  SigningCosmosClient,
  AuthAccountsResponse,
} from "@cosmjs/launchpad";
import { SifUnSignedClient } from "./SifUnsignedClient";

export class SifClient extends SigningCosmosClient {
  private wallet: OfflineSigner;
  private unsignedClient: SifUnSignedClient;

  constructor(
    apiUrl: string,
    senderAddress: string,
    signer: OfflineSigner,
    wsUrl: string,
    rpcUrl: string,
    gasPrice?: GasPrice,
    gasLimits?: Partial<GasLimits<CosmosFeeTable>>,
    broadcastMode?: BroadcastMode,
  ) {
    super(apiUrl, senderAddress, signer, gasPrice, gasLimits, broadcastMode);
    this.wallet = signer;
    this.unsignedClient = new SifUnSignedClient(
      apiUrl,
      wsUrl,
      rpcUrl,
      broadcastMode,
    );

    // NOTE(ajoslin): in 0.42, the response format for /auth/accounts/:address changed.
    // It used to have `.result.type` equal to `cosmos-sdk/Account`, but now it is
    // `cosmos-sdk/BaseAccount`. We need to check for this new type and coerce
    // the response back to the old type by overriding this method.
    (this.lcdClient.auth as any).account = async (address: string) => {
      const path = `/auth/accounts/${address}`;
      const responseData = await this.lcdClient.get(path);
      if (
        responseData.result.type !== "cosmos-sdk/Account" &&
        responseData.result.type !== "cosmos-sdk/BaseAccount"
      ) {
        throw new Error("Unexpected response data format");
      }
      responseData.result.type = "cosmos-sdk/Account";
      return responseData as AuthAccountsResponse;
    };
  }

  async getBankBalances(address: string): Promise<object[]> {
    const { result } = await this.lcdClient.get(`bank/balances/${address}`);
    return result;
  }

  async getAccounts(): Promise<string[]> {
    const accounts = await this.wallet.getAccounts();
    return accounts.map(({ address }) => address);
  }

  async getAccount(address: string): Promise<Account> {
    // NOTE(ajoslin): in 0.42, the response format for /auth/accounts/:address changed.
    // It used to contain a `.result.balance` array, it no longer does.
    // We need to add this field ourselves by fetching `/bank/balances/:address response
    // and adding it to payload.
    const [account, balance] = await Promise.all([
      super.getAccount(address),
      this.getBankBalances(address),
    ]);
    (account as any).balance = balance;
    return account as Account;
  }

  getUnsignedClient() {
    return this.unsignedClient;
  }
}
