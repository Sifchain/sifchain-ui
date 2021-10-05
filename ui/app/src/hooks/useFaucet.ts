import { accountStore, IWalletServiceState } from "@/store/modules/accounts";
import { createFaucetGraphqlClient } from "@/utils/createFaucetGraphqlClient";
import { AppCookies, getNetworkEnv, Network } from "@sifchain/sdk";
import {
  BridgeTx,
  bridgeTxEmitter,
} from "@sifchain/sdk/src/clients/bridges/BaseBridge";
import { onUnmounted, watch } from "@vue/runtime-core";
import { ref } from "vue";
import { useCore } from "./useCore";

const key = "faucet_signature";

type FaucetSignatureEnvelope = {
  signature: string;
  content: {
    address: string;
    status: "SufficientGasTokenBalance" | "InsufficientGasTokenBalance";
    height: number;
    timestampISO: string;
  };
  contentRaw: string;
};

const getGraphqlNetworkEnv = () => {
  const networkEnv =
    AppCookies().getEnv() || getNetworkEnv(window.location.hostname);
  return networkEnv
    ? networkEnv[0].toUpperCase() + networkEnv.slice(1)
    : undefined;
};

export const useFaucet = () => {
  const { services } = useCore();
  const envelopeRef = ref(
    services.storage.getJSONItem<FaucetSignatureEnvelope>(key),
  );

  const faucetGql = createFaucetGraphqlClient();
  const graphqlNetworkEnv = getGraphqlNetworkEnv();

  watch(
    accountStore.refs.sifchain.computed(),
    async (state: IWalletServiceState) => {
      if (!state.address || !state.hasLoadedBalancesOnce) return;
      if (envelopeRef.value?.content?.address === state.address) return;

      if (
        state.balances
          .find((b) => b.symbol.toLowerCase() === "rowan")
          ?.greaterThan("0")
      ) {
        return;
      }
      console.log("wait what?");

      const res = await faucetGql/* GraphQL */ `
        mutation createAccountBalanceProof(
          $address: String!
          $networkEnv: NetworkEnv
        ) {
          createAccountBalanceProof(
            address: $address
            networkEnv: $networkEnv
          ) {
            signature
            content {
              address
              status
              height
              timestampISO
            }
            contentRaw
          }
        }
      `({ address: state.address, networkEnv: graphqlNetworkEnv });
      if (res.errors) {
        console.log(res.errors);
        return;
      }
      const envelope = res.createAccountBalanceProof as FaucetSignatureEnvelope;
      envelopeRef.value = envelope;
      services.storage.setJSONItem<FaucetSignatureEnvelope>(key, envelope);
    },
    { immediate: true, deep: true },
  );
};

export const tryFundingAccount = async () => {
  const envelope = useCore().services.storage.getJSONItem<FaucetSignatureEnvelope>(
    key,
  );
  if (!envelope) throw new Error("No signature found!");

  if (envelope.content.status === "SufficientGasTokenBalance") {
    throw new Error("You already have sufficient Rowan balance.");
  }

  if (
    accountStore.state.sifchain.balances
      .find((b) => b.symbol.toLowerCase() === "rowan")
      ?.greaterThan("0")
  ) {
    throw new Error("You already have sufficient Rowan balance.");
  }

  const faucetGql = createFaucetGraphqlClient();
  const res = await faucetGql/* GraphQL */ `
    mutation fundAccount(
      $signature: String!
      $contentRaw: String!
      $networkEnv: NetworkEnv
    ) {
      fundAccount(
        signature: $signature
        contentRaw: $contentRaw
        networkEnv: $networkEnv
      )
    }
  `({
    signature: envelope.signature,
    contentRaw: envelope.contentRaw,
    networkEnv: getGraphqlNetworkEnv(),
  });
  envelope.content.status = "SufficientGasTokenBalance";
  useCore().services.storage.setJSONItem<FaucetSignatureEnvelope>(
    key,
    envelope,
  );

  return res;
};
