import { PegEvent } from "./../../../../../core/src/usecases/peg/peg";
import { RouteLocationRaw, useRoute } from "vue-router";
import { reactive, ref, computed, Ref, watch } from "vue";
import router from "@/router";
import { effect } from "@vue/reactivity";
import { TokenListItem, useTokenList, useToken } from "@/hooks/useToken";
import {
  getPeggedSymbol,
  getUnpeggedSymbol,
} from "@/componentsLegacy/shared/utils";
import { useCore } from "@/hooks/useCore";
import { Network, IAssetAmount, AssetAmount } from "@sifchain/sdk";
import { PegSentEvent, PegTxError } from "@sifchain/sdk/src/usecases/peg/peg";

export type ImportParams = {
  amount?: string;
  network?: string;
  symbol?: string;
};

export type ImportStep = "select" | "confirm" | "processing";

export type ImportData = {
  importParams: ImportParams;
  networksRef: Ref<Network[]>;
  tokenRef: Ref<TokenListItem>;
  pickableTokensRef: Ref<TokenListItem[]>;
  importAmountRef: Ref<IAssetAmount | null>;
  runImport: () => void;
  pegEventRef: Ref<PegEvent>;
};

export function getImportLocation(
  step: ImportStep,
  params: ImportParams,
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
  const { store, usecases } = useCore();
  const route = useRoute();

  const importParams = reactive<ImportParams>({
    symbol: String(route.params.symbol || ""),
    network: String(route.query.network || ""),
    amount: String(route.query.amount || ""),
  });

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

    const mappedSymbol = getPeggedSymbol(
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

  const importAmountRef = computed(() => {
    if (!tokenRef.value) return null;
    console.log(tokenRef.value, importParams.amount);
    return AssetAmount(
      tokenRef.value?.asset,
      importParams.amount?.trim() || "0.0",
    );
  });

  const pickableTokensRef = computed(() => {
    return tokenListRef.value.filter((token) => {
      return token.asset.network === importParams.network;
    });
  });

  const pegEventRef = ref<PegEvent>();
  async function runImport() {
    if (!importAmountRef.value) throw new Error("Please provide an amount");
    pegEventRef.value = undefined;
    for await (const event of usecases.peg.peg(importAmountRef.value)) {
      console.log("GOT EVENT", event);
      pegEventRef.value = event;
    }
  }

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
    importAmountRef,
    runImport,
    pegEventRef,
  } as ImportData;
};
