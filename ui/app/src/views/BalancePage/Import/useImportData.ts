import { RouteLocationRaw, useRoute } from "vue-router";
import { ConfirmState } from "./../../../types";
import { reactive, ref, computed, Ref, watch } from "vue";
import router from "@/router";
import { effect } from "@vue/reactivity";
import { TokenListItem, useTokenList } from "@/hooks/useTokenList";
import { getUnpeggedSymbol } from "@/componentsLegacy/shared/utils";
import { Network } from "@sifchain/sdk";

export type ImportInputParams = {
  amount?: string;
  network?: string;
  symbol?: string;
};

export type ImportStep = "select" | "confirm" | "pending";

export type ImportData = {
  importParams: ImportInputParams;
  networksRef: Ref<Network[]>;
  tokenRef: Ref<TokenListItem>;
  pickableTokensRef: Ref<TokenListItem[]>;
};

export function getImportLocation(
  step: ImportStep,
  params: ImportInputParams,
): RouteLocationRaw {
  return {
    name: "Import",
    params: { step, symbol: params.symbol },
    query: {
      network: params.network,
      amount: params.amount,
    },
  } as RouteLocationRaw;
}

export const useImportData = () => {
  const route = useRoute();
  const importParams = reactive<ImportInputParams>({
    symbol: String(route.params.symbol),
    network: String(route.query.network),
    amount: String(route.query.amount),
  });
  const transactionState = ref<ConfirmState>("selecting");

  const networksRef = ref(
    Object.values(Network).filter((network) => network !== Network.SIFCHAIN),
  );

  const tokenListRef = useTokenList({
    networks: networksRef,
  });

  const tokenRef = computed<TokenListItem | undefined>(() => {
    if (tokenRef.value) return undefined; // If tokenRef is already defined, we are good.
    if (!tokenListRef.value?.length) return undefined; // Wait for token list to load

    if (!importParams.symbol) {
      return tokenListRef.value[0];
    }

    const mappedSymbol = getUnpeggedSymbol(
      importParams.symbol || "",
    ).toLowerCase();
    const token =
      tokenListRef.value.find(
        (token) =>
          // Token in url could be a sifchain token or another token...
          token.asset.symbol === mappedSymbol ||
          token.asset.symbol === importParams.symbol,
      ) || tokenListRef.value[0];

    importParams.symbol = token.asset.symbol;
    importParams.network = token.asset.network;
    return token;
  });

  const pickableTokensRef = computed(() => {
    return tokenListRef.value.filter((token) => {
      return token.asset.network === importParams.network;
    });
  });

  effect(() => {
    if (
      tokenRef.value &&
      tokenRef.value.asset.network !== importParams.network
    ) {
      importParams.symbol = "";
    }
  });
  effect(() => {
    if (!tokenListRef.value.length) return;
    if (!importParams.symbol)
      importParams.symbol = tokenListRef.value[0].asset.symbol;
    if (!importParams.network)
      importParams.network = tokenListRef.value[0].asset.network;
  });

  return {
    importParams,
    networksRef,
    pickableTokensRef,
    tokenRef,
  } as ImportData;
};
