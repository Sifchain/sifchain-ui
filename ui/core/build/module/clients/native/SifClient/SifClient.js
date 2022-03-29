var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
import { BroadcastMode, SigningCosmosClient, logs } from "@cosmjs/launchpad";
import { fromHex } from "@cosmjs/encoding";
import { Uint53 } from "@cosmjs/math";
import { SifUnSignedClient } from "./SifUnsignedClient";
import { CosmosClient } from "@cosmjs/launchpad";
export class Compatible42CosmosClient extends CosmosClient {
  // NOTE(59023g): in 0.42, the result.logs array items do not include `msg_index` and
  // `log` so we hardcode these values. It does assume logs array length is always 1
  broadcastTx(tx) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
      console.log({ tx });
      const result = yield this.lcdClient.post("/cosmos/tx/v1beta1/txs", {
        tx_bytes: tx,
        mode: 1,
      });
      console.log({ result });
      if (
        !((_a = result.txhash) === null || _a === void 0
          ? void 0
          : _a.match(/^([0-9A-F][0-9A-F])+$/))
      ) {
        console.error("INVALID TXHASH IN RESULT", result);
        throw new Error(
          "Received ill-formatted txhash. Must be non-empty upper-case hex",
        );
      }
      result.logs = result.logs || [];
      result.logs[0] = result.logs[0] || {};
      result.logs[0].msg_index = 0;
      result.logs[0].log = "";
      return result.code !== undefined
        ? {
            height: Uint53.fromString(result.height).toNumber(),
            transactionHash: result.txhash,
            code: result.code,
            rawLog: result.raw_log || "",
          }
        : {
            logs: result.logs ? logs.parseLogs(result.logs) : [],
            rawLog: result.raw_log || "",
            transactionHash: result.txhash,
            data: result.data ? fromHex(result.data) : undefined,
          };
    });
  }
}
export class Compatible42SigningCosmosClient extends SigningCosmosClient {
  constructor(
    apiUrl,
    senderAddress,
    signer,
    gasPrice,
    gasLimits,
    broadcastMode,
  ) {
    super(apiUrl, senderAddress, signer, gasPrice, gasLimits, broadcastMode);
    // NOTE(ajoslin): in 0.42, the response format for /auth/accounts/:address changed.
    // It used to have `.result.type` equal to `cosmos-sdk/Account`, but now it is
    // `cosmos-sdk/BaseAccount`. We need to check for this new type and coerce
    // the response back to the old type by overriding this method.
    this.lcdClient.auth.account = (address) =>
      __awaiter(this, void 0, void 0, function* () {
        const path = `/auth/accounts/${address}`;
        const responseData = yield this.lcdClient.get(path);
        if (
          responseData.result.type !== "cosmos-sdk/Account" &&
          responseData.result.type !== "cosmos-sdk/BaseAccount"
        ) {
          throw new Error("Unexpected response data format");
        }
        responseData.result.type = "cosmos-sdk/Account";
        // Note (59023g): New Legacy API wraps return values with omitempty so if empty,
        // does not return a value.  This prevents wallet from connecting in UI
        if (!responseData.result.value.sequence) {
          responseData.result.value.sequence = "0";
        }
        if (!responseData.result.value.account_number) {
          responseData.result.value.account_number = "0";
        }
        return responseData;
      });
  }
  // NOTE(59023g): in 0.42, the result.logs array items do not include `msg_index` and
  // `log` so we hardcode these values. It does assume logs array length is always 1
  broadcastTx(tx) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
      const result = yield this.lcdClient.broadcastTx(tx);
      if (
        !((_a = result.txhash) === null || _a === void 0
          ? void 0
          : _a.match(/^([0-9A-F][0-9A-F])+$/))
      ) {
        console.error("INVALID TXHASH IN RESULT", result);
        throw new Error(
          "Received ill-formatted txhash. Must be non-empty upper-case hex",
        );
      }
      result.logs = result.logs || [];
      result.logs[0] = result.logs[0] || {};
      result.logs[0].msg_index = 0;
      result.logs[0].log = "";
      return result.code !== undefined
        ? {
            height: Uint53.fromString(result.height).toNumber(),
            transactionHash: result.txhash,
            code: result.code,
            rawLog: result.raw_log || "",
          }
        : {
            logs: result.logs ? logs.parseLogs(result.logs) : [],
            rawLog: result.raw_log || "",
            transactionHash: result.txhash,
            data: result.data ? fromHex(result.data) : undefined,
          };
    });
  }
}
export class SifClient extends Compatible42SigningCosmosClient {
  constructor(
    apiUrl,
    senderAddress,
    signer,
    wsUrl,
    rpcUrl,
    gasPrice,
    gasLimits,
    broadcastMode = BroadcastMode.Block,
  ) {
    super(apiUrl, senderAddress, signer, gasPrice, gasLimits, broadcastMode);
    this.rpcUrl = rpcUrl;
    this.wallet = signer;
    this.unsignedClient = new SifUnSignedClient(
      apiUrl,
      wsUrl,
      rpcUrl,
      broadcastMode,
    );
  }
  getRpcUrl() {
    return this.rpcUrl;
  }
  getBankBalances(address) {
    return __awaiter(this, void 0, void 0, function* () {
      const { result } = yield this.lcdClient.get(`bank/balances/${address}`);
      return result;
    });
  }
  getAccounts() {
    return __awaiter(this, void 0, void 0, function* () {
      const accounts = yield this.wallet.getAccounts();
      return accounts.map(({ address }) => address);
    });
  }
  getAccount(address) {
    const _super = Object.create(null, {
      getAccount: { get: () => super.getAccount },
    });
    return __awaiter(this, void 0, void 0, function* () {
      // NOTE(ajoslin): in 0.42, the response format for /auth/accounts/:address changed.
      // It used to contain a `.result.balance` array, it no longer does.
      // We need to add this field ourselves by fetching `/bank/balances/:address response
      // and adding it to payload.
      const [account, balance] = yield Promise.all([
        _super.getAccount.call(this, address),
        this.getBankBalances(address),
      ]);
      account.balance = balance;
      return account;
    });
  }
  getUnsignedClient() {
    return this.unsignedClient;
  }
}
//# sourceMappingURL=SifClient.js.map
