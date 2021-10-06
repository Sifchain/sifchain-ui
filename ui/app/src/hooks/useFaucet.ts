import { accountStore, IWalletServiceState } from "@/store/modules/accounts";
import { flagsStore } from "@/store/modules/flags";
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

const envelopeRef = ref(
  useCore().services.storage.getJSONItem<FaucetSignatureEnvelope>(key),
);
const setEnvelopeValue = (value: FaucetSignatureEnvelope) => {
  envelopeRef.value = value;
  useCore().services.storage.setJSONItem<FaucetSignatureEnvelope>(key, value);
};

export const shouldAllowFaucetFunding = () => {
  return (
    envelopeRef.value?.content.status === "InsufficientGasTokenBalance" &&
    !accountStore.state.sifchain.connecting &&
    // PLESE UPDATESILSJFOIjio03wr[90qij30[i9q23jiq34jio3jioofaf]]
    accountStore.state.sifchain.hasLoadedBalancesOnce &&
    accountStore.state.sifchain.balances.some(
      // has imported
      (b) => b.amount.greaterThan("0"),
    ) &&
    !accountStore.state.sifchain.balances.some(
      // does not have rowan
      (b) => b.asset.symbol.includes("rowan") && b.amount.greaterThan("0"),
    )
  );
};

export const useFaucet = () => {
  const { services } = useCore();
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
      setEnvelopeValue(
        res.createAccountBalanceProof as FaucetSignatureEnvelope,
      );
    },
    { immediate: true, deep: true },
  );
};

export const tryFundingAccount = async () => {
  if (!envelopeRef.value) throw new Error("No signature found!");

  if (envelopeRef.value.content.status === "SufficientGasTokenBalance") {
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
    signature: envelopeRef.value.signature,
    contentRaw: envelopeRef.value.contentRaw,
    networkEnv: getGraphqlNetworkEnv(),
  });
  setEnvelopeValue({
    ...envelopeRef.value,
    content: {
      ...envelopeRef.value.content,
      status: "SufficientGasTokenBalance",
    },
  });

  return res;
};
