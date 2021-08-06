import { RouteLocationRaw, useRoute, useRouter } from "vue-router";
import { computed, onMounted, Ref, watch } from "vue";
import { TokenIcon } from "@/components/TokenIcon";
import { TokenListItem, useTokenList } from "@/hooks/useToken";
import { formatAssetAmount } from "@/componentsLegacy/shared/utils";
import { Network, AssetAmount, toBaseUnits } from "@sifchain/sdk";
import { Button } from "@/components/Button/Button";
import { rootStore } from "@/store";
import { usePegEventDetails } from "@/hooks/useTransactionDetails";
import { importStore } from "@/store/modules/import";
import { accountStore } from "@/store/modules/accounts";
import { PegEvent } from "../../../../../core/src/usecases/peg/peg";

export type ImportDraft = {
  amount: string;
  network: Network;
  displaySymbol: string;
};

export type ImportStep = "select" | "confirm" | "processing";

// export type ImportData = {
//   importDraft: ToRefs<ImportDraft>;
//   networksRef: Ref<Network[]>;
//   tokenRef: Ref<TokenListItem | undefined>;
//   pickableTokensRef: Ref<TokenListItem[]>;
//   computedImportAssetAmount: Ref<IAssetAmount | null>;
//   pegEventRef: Ref<PegEvent | undefined>;
//   runImport: () => void;
//   exitImport: () => void;
//   detailsRef: Ref<FormDetailsType>;
// };

export function getImportLocation(
  step: ImportStep,
  params: Partial<ImportDraft & { txHash?: string }>,
): RouteLocationRaw {
  return {
    name:
      step === "select"
        ? "Import"
        : step === "confirm"
        ? "ConfirmImport"
        : "ProcessingImport",
    params: {
      displaySymbol: params.displaySymbol || importStore.state.draft.network,
    },
    query: {
      network: params.network || importStore.state.draft.network,
      amount: params.amount || importStore.state.draft.amount,
    },
  };
}

export const useImportData = () => {
  const route = useRoute();
  const router = useRouter();
  const importStore = rootStore.import;
  const importDraft = importStore.refs.draft.computed();

  watch(
    // Do not watch pegEvent, that should not trigger a route change.
    // If it does, it will cause issues...
    () => [
      importDraft.value.displaySymbol,
      importDraft.value.network,
      importDraft.value.amount,
    ],
    ([displaySymbol, network, amount]): void => {
      router.replace(
        getImportLocation(
          router.currentRoute.value.path.split("/").pop() as ImportStep,
          {
            displaySymbol,
            network: network as Network,
            amount,
          },
        ),
      );
    },
    { immediate: false },
  );

  // Onload, set state to match the route params.
  onMounted(() => {
    if (
      !["amount", "displaySymbol", "network"].every(
        (key) =>
          importDraft.value[key as keyof ImportDraft] ===
          (route.query[key] || route.params[key]),
      )
    ) {
      importStore.setDraft({
        amount: (route.query.amount as string) || importDraft.value.amount,
        displaySymbol:
          (route.params.displaySymbol as string) ||
          importDraft.value.displaySymbol,
        network: (route.params.network as Network) || importDraft.value.network,
      });
    }
  });

  const exitImport = () => {
    router.replace({ name: "Balances" });
  };

  const networksRef = importStore.refs.networks.computed();
  // const networksRef1 = importStore.computed((store) => store.getters.networks);
  // const networksRef2 = importStore.refs.networks.computed()

  const tokenListRef = useTokenList({
    networks: networksRef,
  });

  const tokenRef = computed<TokenListItem | undefined>(() => {
    const list = tokenListRef.value;
    const draft = importDraft.value;
    if (!list?.length) return undefined; // Wait for token list to load

    if (!draft.displaySymbol) {
      return tokenListRef.value[0];
    }

    const token =
      list.find((t) => {
        return (
          draft.displaySymbol.toLowerCase() ===
            t.asset.displaySymbol.toLowerCase() &&
          t.asset.network === importDraft.value.network
        );
      }) || tokenListRef.value[0];
    return token;
  });

  const computedImportAssetAmount = computed(() => {
    if (!tokenRef.value?.asset) return null;
    return AssetAmount(
      tokenRef.value?.asset || "rowan",
      toBaseUnits(
        importDraft.value.amount?.trim() || "0.0",
        tokenRef.value?.asset,
      ),
    );
  });

  const nativeBalances = accountStore.refs.sifchain.balances.computed();

  const nativeTokenBalance = computed(() =>
    nativeBalances.value.find(
      (t) => t.displaySymbol === importDraft.value.displaySymbol,
    ),
  );

  const pickableTokensRef = computed(() => {
    return tokenListRef.value.filter((token) => {
      return token.asset.network === importDraft.value.network;
    });
  });

  const pegEventRef = importStore.refs.draft.pegEvent.computed();

  const pegEventDetails = usePegEventDetails({
    pegEvent: pegEventRef as Ref<PegEvent>,
  });

  const sifchainBalance = rootStore.accounts.computed((s) =>
    s.state.sifchain.balances.find(
      (b) => b.displaySymbol === rootStore.import.state.draft.displaySymbol,
    ),
  );
  const detailsRef = computed<[any, any][]>(() => [
    [
      "Current Sifchain Balance",
      <span class="flex items-center font-mono">
        {sifchainBalance.value ? (
          <>
            {formatAssetAmount(sifchainBalance.value)}{" "}
            {(
              nativeTokenBalance.value?.asset.displaySymbol ||
              sifchainBalance.value.asset.symbol
            ).toUpperCase()}
            <TokenIcon
              size={18}
              assetValue={nativeTokenBalance.value?.asset}
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
        {importDraft.value.network}
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
        {importDraft.value.amount}{" "}
        {importDraft.value.displaySymbol?.toUpperCase()}
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
        <Button.InlineHelp>Estimated amount</Button.InlineHelp>
      </>,
      <span class="flex items-center font-mono">
        {nativeTokenBalance.value ? (
          <>
            {(
              parseFloat(formatAssetAmount(nativeTokenBalance.value)) +
              parseFloat(importDraft.value.amount || "0")
            ).toFixed(
              Math.max(
                formatAssetAmount(nativeTokenBalance.value).split(".")[1]
                  ?.length ||
                  importDraft.value.amount.split(".")[1]?.length ||
                  0,
              ),
            )}{" "}
            {(
              nativeTokenBalance.value?.asset.displaySymbol ||
              nativeTokenBalance.value?.asset.symbol ||
              ""
            ).toUpperCase()}{" "}
            <TokenIcon
              size={18}
              assetValue={nativeTokenBalance.value.asset}
              class="ml-[4px]"
            />
          </>
        ) : (
          "0"
        )}
      </span>,
    ],
  ]);

  return {
    importDraft,
    networksRef,
    pickableTokensRef,
    tokenRef,
    computedImportAssetAmount,
    runImport: () =>
      computedImportAssetAmount.value &&
      importStore.runImport({
        assetAmount: computedImportAssetAmount.value,
      }),
    pegEventRef: importStore.refs.draft.pegEvent.computed(),
    exitImport: exitImport,
    detailsRef,
    pegEventDetails,
  };
};
