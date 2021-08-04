import { RouteLocationRaw, useRoute, useRouter } from "vue-router";
import { reactive, ref, computed, Ref, watch, onMounted } from "vue";
import { effect, proxyRefs, toRefs, ToRefs } from "@vue/reactivity";
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
import { rootStore } from "@/store";

export type ImportDraft = {
  amount: string;
  network: Network;
  displaySymbol: string;
};

export type ImportStep = "setup" | "confirm" | "processing";

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
  params: Partial<ImportDraft>,
): RouteLocationRaw {
  return {
    name: "Import",
    params: { step, symbol: params.displaySymbol },
    query: {
      network: params.network,
      amount: params.amount,
    },
  } as RouteLocationRaw;
}

export const useImportData = () => {
  const { store, usecases } = useCore();
  const route = useRoute();
  const router = useRouter();
  const importStore = rootStore.import;
  const importDraft = importStore.state.draft;
  const importDraftRefs = toRefs(importDraft);
  watch(
    () => importDraft,
    (value) => {
      router.replace(
        getImportLocation(route.params.step as ImportStep, {
          ...proxyRefs(importDraftRefs),
        }),
      );
    },
    { deep: true, immediate: true },
  );

  const exitImport = () => {
    router.replace({ name: "Balances" });
  };

  const networksRef = importStore.computed((store) => store.getters.networks);

  const tokenListRef = useTokenList({
    networks: networksRef,
  });

  const tokenRef = computed<TokenListItem | undefined>(() => {
    if (!tokenListRef.value?.length) return undefined; // Wait for token list to load

    if (!importDraft.displaySymbol) {
      return tokenListRef.value[0];
    }

    const token =
      tokenListRef.value.find((t) => {
        return (
          importDraft.displaySymbol.toLowerCase() ===
          t.asset.displaySymbol.toLowerCase()
        );
      }) || tokenListRef.value[0];
    return token;
  });
  effect(() => {
    if (
      tokenRef.value?.asset.displaySymbol !==
      importStore.state.draft.displaySymbol
    ) {
      importStore.setDraft({
        displaySymbol: tokenRef.value?.asset.displaySymbol,
      });
    }
  });

  onMounted(() => {
    importStore.setDraft({
      network: route.params.network
        ? importDraft.network
        : tokenRef.value?.asset.homeNetwork || importDraft.network,
    });
  });

  const computedImportAssetAmount = computed(() => {
    if (!tokenRef.value?.asset) return null;
    return AssetAmount(
      tokenRef.value?.asset || "rowan",
      toBaseUnits(importDraft.amount?.trim() || "0.0", tokenRef.value?.asset),
    );
  });

  const sifchainTokenRef = useToken({
    network: ref(Network.SIFCHAIN),
    symbol: computed(() =>
      importDraft.network === Network.ETHEREUM
        ? getPeggedSymbol(
            importDraft.displaySymbol?.toLowerCase() || "",
          ).toLowerCase()
        : importDraft.displaySymbol?.toLowerCase() || "",
    ),
  });

  const pickableTokensRef = computed(() => {
    return tokenListRef.value.filter((token) => {
      return token.asset.network === importDraft.network;
    });
  });

  const pegEventRef = ref<PegEvent>();
  async function runImport() {
    if (!computedImportAssetAmount.value)
      throw new Error("Please provide an amount");
    pegEventRef.value = undefined;

    for await (const event of usecases.peg.peg(
      computedImportAssetAmount.value,
    )) {
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
        {importDraft.network}
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
        {importDraft.amount} {importDraft.displaySymbol?.toUpperCase()}
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
        {sifchainTokenRef.value ? (
          <>
            {(
              parseFloat(formatAssetAmount(sifchainTokenRef.value.amount)) +
              parseFloat(importDraft.amount || "0")
            ).toFixed(
              Math.max(
                formatAssetAmount(sifchainTokenRef.value.amount).split(".")[1]
                  ?.length ||
                  importDraft.amount.split(".")[1]?.length ||
                  0,
              ),
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

  return {
    importDraft: toRefs(importDraft),
    networksRef,
    pickableTokensRef,
    tokenRef,
    computedImportAssetAmount,
    runImport,
    pegEventRef,
    exitImport: exitImport,
    detailsRef,
  };
};
