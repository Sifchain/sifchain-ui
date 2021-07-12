import { RouteLocationRaw, useRoute } from "vue-router";
import { ConfirmState } from "@/types";
import { reactive, ref, computed, Ref, watch } from "vue";
import { useToken } from "@/hooks/useToken";
import { getPeggedSymbol } from "@/componentsLegacy/shared/utils";
import { useCore } from "@/hooks/useCore";
import { Network, IAssetAmount } from "@sifchain/sdk";
import { PegSentEvent, PegTxError } from "@sifchain/sdk/src/usecases/peg/peg";
import { toConfirmState } from "@/views/utils/toConfirmState";

type ImportRunner = {
  run: () => Ref<Transaction>;
  validationErrorRef: Ref<string>;
};

const useRunImport = (inputAmount: Ref<IAssetAmount>): ImportRunner => {
  const { store, usecases } = useCore();

  const transaction = reactive<Transaction>({
    state: "selecting",
    message: "",
    hash: null,
  });

  const inputTokenRef = useToken({
    network: ref(inputAmount.value.asset.network),
    symbol: ref(inputAmount.value.asset.symbol),
  });

  const importedSymbolRef = computed(() =>
    getPeggedSymbol(inputTokenRef.value?.asset.symbol || "").toLowerCase(),
  );
  const importedTokenRef = useToken({
    network: ref(Network.SIFCHAIN),
    symbol: importedSymbolRef,
  });

  const validationErrorRef = computed(() => {
    if (!inputTokenRef.value) return "Please provide a valid token to import.";
    if (inputAmount.value.amount.lessThanOrEqual("0.0"))
      return "Please enter an amount greater than 0 to import.";
    if (inputTokenRef.value?.amount.lessThan(inputAmount.value)) {
      return (
        "You do not have that much " +
        inputTokenRef.value.asset.symbol.toUpperCase() +
        " available."
      );
    }
  });

  return {
    transaction,
    validationErrorRef,
    async run() {},
  };
};
