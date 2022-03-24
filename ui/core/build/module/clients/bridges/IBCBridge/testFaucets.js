var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { SigningStargateClient, coins } from "@cosmjs/stargate";
import { AKASH_TESTNET } from "config/chains/akash/akash-testnet";
import fetch from "cross-fetch";
// This contains TEST tokens only, please be nice and don't take them all.
const COUNTERPARTY_TEST_MNEMONIC = process.env.COUNTERPARTY_TEST_MNEMONIC;
export const runAkashFaucet = (toAddress) => __awaiter(void 0, void 0, void 0, function* () {
    const signer = yield DirectSecp256k1HdWallet.fromMnemonic(COUNTERPARTY_TEST_MNEMONIC, {
        prefix: "akash",
    });
    const faucetAddr = (yield signer.getAccounts())[0].address;
    const client = yield SigningStargateClient.connectWithSigner(AKASH_TESTNET.rpcUrl, signer, {
        prefix: "akash",
    });
    const msg = {
        typeUrl: "/cosmos.bank.v1beta1.MsgSend",
        value: {
            amount: [
                {
                    denom: "uakt",
                    amount: "100000", // 0.1 uakt
                },
            ],
            fromAddress: faucetAddr,
            toAddress: toAddress,
        },
    };
    const fee = {
        amount: coins(200000, "uakt"),
        gas: "500000", // TODO - see if "auto" setting
    };
    const res = yield client.signAndBroadcast(faucetAddr, [msg], fee);
    console.log("res", res);
});
export const runRowanFaucet = (sifAddress) => __awaiter(void 0, void 0, void 0, function* () {
    const useLocalFaucet = false;
    const faucetGql = (body) => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield fetch(`${useLocalFaucet
            ? "http://localhost:3000"
            : "https://rowan-faucet.vercel.app"}/api/graphql`, {
            method: "POST",
            headers: {
                origin: "unit-tests.sifchain.finance",
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(body),
        });
        if (!res.ok)
            throw new Error("Error with faucet " + (yield res.text()));
        const json = yield res.json();
        if (json.data == null)
            throw new Error(JSON.stringify(json.errors));
        return json.data;
    });
    const signatureJson = yield faucetGql({
        query: `mutation createAccountBalanceProof(
          $address: String!
          $networkEnv: NetworkEnv
        ) {
          createAccountBalanceProof(
            address: $address
            networkEnv: $networkEnv
          ) {
            signature
            contentRaw
          }
        }`,
        variables: { address: sifAddress, networkEnv: "Testnet" },
    });
    const fundJson = yield faucetGql({
        query: `mutation fundAccount(
      $signature: String!
      $contentRaw: String!
      $networkEnv: NetworkEnv
    ) {
      fundAccount(
        signature: $signature contentRaw: $contentRaw
        networkEnv: $networkEnv
      )
    }`,
        variables: {
            signature: signatureJson.createAccountBalanceProof.signature,
            contentRaw: signatureJson.createAccountBalanceProof.contentRaw,
            networkEnv: "Testnet",
        },
    });
    if (fundJson) {
        return true;
    }
    else {
        return false;
    }
});
//# sourceMappingURL=testFaucets.js.map