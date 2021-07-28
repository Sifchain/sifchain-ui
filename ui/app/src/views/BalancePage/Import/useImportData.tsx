import { RouteLocationRaw, useRoute } from "vue-router";
import { reactive, ref, computed, Ref, watch } from "vue";
import router from "@/router";
import { effect } from "@vue/reactivity";
import { TokenIcon } from "@/components/TokenIcon";
import { TokenListItem, useTokenList, useToken } from "@/hooks/useToken";
import { toBaseUnits } from "@sifchain/sdk/src/utils";
import {
  formatAssetAmount,
  getPeggedSymbol,
  isOpposingSymbol,
} from "@/componentsLegacy/shared/utils";
import { useCore } from "@/hooks/useCore";
import { Network, IAssetAmount, AssetAmount, Amount } from "@sifchain/sdk";
import { PegEvent } from "@sifchain/sdk/src/usecases/peg/peg";
import { Button } from "@/components/Button/Button";
import { FormDetailsType } from "@/components/Form";

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
  pegEventRef: Ref<PegEvent>;
  runImport: () => void;
  exitImport: () => void;
  detailsRef: Ref<FormDetailsType>;
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
    amount: String(route.query.amount || ""),
  });

  watch(
    () => importParams,
    (value) => {
      router.replace(getImportLocation(route.params.step as ImportStep, value));
    },
    { deep: true },
  );

  const exitImport = () => {
    router.replace({ name: "Balances" });
  };

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

    const token =
      tokenListRef.value.find((t) => {
        return isOpposingSymbol(t.asset.symbol, importParams.symbol || "");
      }) || tokenListRef.value[0];

    importParams.symbol = token.asset.symbol;
    importParams.network = token.asset.network;
    return token;
  });

  const importAmountRef = computed(() => {
    if (!tokenRef.value) return null;
    return AssetAmount(
      tokenRef.value?.asset,
      toBaseUnits(importParams.amount?.trim() || "0.0", tokenRef.value?.asset),
    );
  });

  const sifchainTokenRef = useToken({
    network: ref(Network.SIFCHAIN),
    symbol: computed(() =>
      getPeggedSymbol(importParams.symbol || "").toLowerCase(),
    ),
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

  const detailsRef = computed<[any, any][]>(() => [
    [
      "Current Sifchain Balance",
      <span class="flex items-center font-mono">
        {sifchainTokenRef.value ? (
          <>
            {formatAssetAmount(sifchainTokenRef.value.amount)}{" "}
            {(
              sifchainTokenRef.value.asset.displaySymbol ||
              sifchainTokenRef.value.asset.symbol
            ).toUpperCase()}
            <TokenIcon
              size={18}
              assetValue={sifchainTokenRef.value.asset}
              class="ml-[4px]"
            />
          </>
        ) : (
          "0"
        )}
      </span>,
    ],
    [
      "Direction",
      <span class="capitalize">
        {importParams.network}
        <span
          class="mx-[6px] inline-block"
          style={{ transform: "translateY(-1px)" }}
        >
          ⟶
        </span>
        Sifchain
      </span>,
    ],
    [
      "Import Amount",
      <span class="flex items-center font-mono">
        {importParams.amount} {importParams.symbol?.toUpperCase()}
        <TokenIcon
          size={18}
          assetValue={tokenRef.value?.asset}
          class="ml-[4px]"
        />
      </span>,
    ],
    [
      <>
        New Sifchain Balance
        <Button.InlineHelp>
          This is an estimated amount only, the final settled amount may differ
          slightly.
        </Button.InlineHelp>
      </>,
      <span class="flex items-center font-mono">
        {sifchainTokenRef.value ? (
          <>
            {(
              parseFloat(formatAssetAmount(sifchainTokenRef.value.amount)) +
              parseFloat(importParams.amount || "0")
            ).toFixed(
              formatAssetAmount(sifchainTokenRef.value.amount).split(".")[1]
                ?.length || 0,
            )}{" "}
            {(
              sifchainTokenRef.value.asset.displaySymbol ||
              sifchainTokenRef.value.asset.symbol
            ).toUpperCase()}{" "}
            <TokenIcon
              size={18}
              assetValue={sifchainTokenRef.value.asset}
              class="ml-[4px]"
            />
          </>
        ) : (
          "0"
        )}
      </span>,
    ],
  ]);

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
    exitImport: exitImport,
    detailsRef,
  } as ImportData;
};
