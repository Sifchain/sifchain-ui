<script lang="ts">
import { defineComponent } from "vue";
import Layout from "@/componentsLegacy/Layout/Layout";
import { computed, ref, toRefs } from "@vue/reactivity";
import { useCore } from "@/hooks/useCore";
import { Asset, AssetAmount } from "@sifchain/sdk";
import CurrencyField from "@/componentsLegacy/CurrencyField/CurrencyField.vue";
import ActionsPanel from "@/componentsLegacy/ActionsPanel/ActionsPanel.vue";

import RaisedPanel from "@/componentsLegacy/RaisedPanel/RaisedPanel.vue";
import { useRouter } from "vue-router";
import SifInput from "@/componentsLegacy/SifInput/SifInput.vue";
import DetailsTable from "@/componentsLegacy/DetailsTable/DetailsTable.vue";
import Label from "@/componentsLegacy/Label/Label.vue";
import RaisedPanelColumn from "@/componentsLegacy/RaisedPanelColumn/RaisedPanelColumn.vue";
import { trimZeros } from "@sifchain/sdk";
import BigNumber from "bignumber.js";
import {
  formatSymbol,
  getPeggedSymbol,
  getUnpeggedSymbol,
  useAssetItem,
} from "@/componentsLegacy/shared/utils";
import { toConfirmState } from "./utils/toConfirmState";
import { getMaxAmount } from "./utils/getMaxAmount";
import { ConfirmState, ConfirmStateEnum } from "../types";
import ConfirmationModal from "@/componentsLegacy/ConfirmationModal/ConfirmationModal.vue";
import { format, toBaseUnits } from "@sifchain/sdk";
import { PegSentEvent, PegTxError } from "@sifchain/sdk/src/usecases/peg/peg";

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default defineComponent({
  components: {
    Layout,
    CurrencyField,
    RaisedPanel,
    Label,
    SifInput,
    DetailsTable,
    ActionsPanel,
    RaisedPanelColumn,
    ConfirmationModal,
  },

  setup(props, context) {
    const { store, usecases } = useCore();
    const router = useRouter();
    const mode = computed(() => {
      return router.currentRoute.value.path.indexOf("/balances/export") > -1
        ? "export"
        : "import";
    });

    const transactionState = ref<ConfirmState>(ConfirmStateEnum.Selecting);
    const transactionStateMsg = ref<string>("");
    const transactionHash = ref<string | null>(null);

    // const symbol = ref<string | null>(null);
    const symbol = computed(() => {
      const assetFrom = router.currentRoute.value.params.assetFrom;
      return Array.isArray(assetFrom) ? assetFrom[0] : assetFrom;
    });

    const networkIsSupported = computed(() => {
      if (mode.value === "import") {
        return usecases.wallet.eth.isSupportedNetwork();
      }

      return true;
    });

    const oppositeSymbol = computed(() => {
      if (mode.value === "import") {
        return getPeggedSymbol(symbol.value);
      }
      return getUnpeggedSymbol(symbol.value);
    });

    const amount = ref("0.0");
    const address = computed(() =>
      mode.value === "import"
        ? store.wallet.get(Network.SIFCHAIN).address
        : store.wallet.get(Network.ETHEREUM).address,
    );

    const isMaxActive = computed(() => {
      if (!accountBalance.value) return false;
      return (
        amount.value ===
        format(accountBalance.value.amount, accountBalance.value.asset)
      );
    });

    async function handlePegRequested() {
      const asset = Asset.get(symbol.value);
      const assetAmount = AssetAmount(asset, toBaseUnits(amount.value, asset));

      for await (const event of usecases.peg.peg(assetAmount)) {
        switch (event.type) {
          case "approve_started":
            transactionState.value = ConfirmStateEnum.Approving;
            break;
          case "approve_error":
            transactionState.value = ConfirmStateEnum.Rejected;
            break;
          case "signing":
            transactionState.value = ConfirmStateEnum.Signing;
            break;
          case "sent":
          case "tx_error": {
            const tx = (event as PegSentEvent | PegTxError).tx;
            transactionHash.value = tx.hash;
            transactionState.value = toConfirmState(tx.state); // TODO: align states
            transactionStateMsg.value = tx.memo ?? "";
          }
        }
      }
    }

    async function handleUnpegRequested() {
      transactionState.value = ConfirmStateEnum.Signing;
      const asset = Asset.get(symbol.value);

      const tx = await usecases.peg.unpeg(
        AssetAmount(asset, toBaseUnits(amount.value, asset)),
      );

      transactionHash.value = tx.hash;
      transactionState.value = toConfirmState(tx.state); // TODO: align states
      transactionStateMsg.value = tx.memo ?? "";
    }

    const accountBalance = computed(() => {
      const balances =
        mode.value === "import"
          ? store.wallet.get(Network.ETHEREUM).balances
          : store.wallet.get(Network.SIFCHAIN).balances;
      return balances.find((balance) => {
        return (
          balance.asset.symbol.toLowerCase() === symbol.value.toLowerCase()
        );
      });
    });

    const nextStepAllowed = computed(() => {
      if (!networkIsSupported.value) return false;

      const amountNum = new BigNumber(amount.value);
      const balance =
        (accountBalance.value &&
          format(accountBalance.value.amount, accountBalance.value.asset)) ??
        "0.0";

      return (
        amountNum.isGreaterThan("0.0") &&
        address.value !== "" &&
        amountNum.isLessThanOrEqualTo(balance)
      );
    });

    const nextStepMessage = computed(() => {
      if (!networkIsSupported.value) return "Network Not Supported";
      return mode.value === "import" ? "Import" : "Export";
    });

    function requestTransactionModalClose() {
      if (transactionState.value === "confirmed") {
        transactionState.value = ConfirmStateEnum.Selecting;
        router.push("/balances"); // TODO push back to peg, but load unpeg tab when unpegging -> dynamic routing?
      } else {
        transactionState.value = ConfirmStateEnum.Selecting;
      }
    }
    const feeAmount = computed(() => {
      return usecases.peg.calculateUnpegFee(Asset.get(symbol.value));
    });

    const feeDisplayAmount = computed(() => {
      if (!feeAmount.value) return "";
      return format(feeAmount.value.amount, feeAmount.value.asset, {
        mantissa: 8,
      });
    });
    const pageState = {
      mode,
      modeLabel: computed(() => capitalize(mode.value)),
      symbol,
      symbolLabel: useAssetItem(symbol).label,
      amount,
      address,
      feeAmount,
      handleBlur: () => {
        if (isMaxActive.value === true) return;
        amount.value = trimZeros(amount.value);
      },
      handleSelectSymbol: () => {},
      handleMaxClicked: () => {
        if (!accountBalance.value) return;
        const decimals = Asset.get(symbol.value).decimals;
        const afterMaxValue = getMaxAmount(symbol, accountBalance.value);
        amount.value = afterMaxValue.lessThan("0")
          ? "0.0"
          : format(afterMaxValue, accountBalance.value.asset, {
              mantissa: decimals,
            });
      },
      handleAmountUpdated: (newAmount: string) => {
        amount.value = newAmount;
      },
      handleActionClicked: () => {
        transactionState.value = ConfirmStateEnum.Confirming;
      },
      handlePegRequested,
      handleUnpegRequested,
      oppositeSymbol,
      formatSymbol,
      requestTransactionModalClose,
      transactionState,
      transactionStateMsg,
      transactionHash,
      nextStepAllowed,
      isMaxActive,
      feeDisplayAmount,
      nextStepMessage,
    };
    (window as any).pageState = pageState;
    return pageState;
  },
});
</script>

<template>
  <Layout
    :title="mode === 'import' ? 'Import Asset' : 'Export Asset'"
    backLink="/balances"
  >
    <div class="vspace">
      <CurrencyField
        slug="import"
        :amount="amount"
        :max="true"
        :isMaxActive="isMaxActive"
        :selectable="true"
        :symbol="symbol"
        :symbolFixed="true"
        @blur="handleBlur"
        @maxclicked="handleMaxClicked"
        @update:amount="handleAmountUpdated"
        label="Amount"
      />
      <RaisedPanel>
        <RaisedPanelColumn v-if="mode === 'import'">
          <Label>Sifchain Recipient Address</Label>
          <SifInput disabled v-model="address" />
        </RaisedPanelColumn>
        <RaisedPanelColumn v-if="mode === 'export'">
          <Label>Ethereum Recipient Address</Label>
          <SifInput
            disabled
            v-model="address"
            placeholder="Eg. 0xeaf65652e380528fffbb9fc276dd8ef608931e3c"
          />
        </RaisedPanelColumn>
      </RaisedPanel>
      <DetailsTable
        v-if="mode === 'export'"
        :header="{
          show: amount !== '0.0',
          label: `${modeLabel} Amount`,
          data: `${amount} ${symbolLabel}`,
        }"
        :rows="[
          {
            show: !!feeDisplayAmount,
            label: 'Transaction Fee',
            data: `${feeDisplayAmount} cETH`,
            tooltipMessage: `This is a fixed fee amount. This is a temporary solution as we are working towards improving this amount in upcoming versions of the network.`,
          },
        ]"
      />
      <ActionsPanel
        connectType="connectToAll"
        @nextstepclick="handleActionClicked"
        :nextStepAllowed="nextStepAllowed"
        :nextStepMessage="nextStepMessage"
      />
    </div>
    <ConfirmationModal
      v-if="mode === 'import'"
      @confirmed="handlePegRequested"
      :requestClose="requestTransactionModalClose"
      :state="transactionState"
      :transactionHash="transactionHash"
      :transactionStateMsg="transactionStateMsg"
      confirmButtonText="Confirm Import"
      :title="`Import token to Sifchain`"
    >
      <template v-slot:selecting>
        <DetailsTable
          :header="{
            show: amount !== '0.0',
            label: `${modeLabel} Amount`,
            data: `${amount} ${formatSymbol(symbol)}`,
          }"
          :rows="[
            {
              show: true,
              label: 'Direction',
              data: `${formatSymbol(symbol)} → ${formatSymbol(oppositeSymbol)}`,
            },
          ]"
        />
        <br />
        <p class="text--normal">
          *Please note your funds will be available for use on Sifchain only
          after 50 Ethereum block confirmations. This can take upwards of 20
          minutes.
        </p>
      </template>
      <template v-slot:approving>
        <p>Approving</p>
      </template>
      <template v-slot:common>
        <p class="text--normal">
          Importing <span class="text--bold">{{ amount }} {{ symbol }}</span>
        </p>
      </template>
    </ConfirmationModal>
    <ConfirmationModal
      v-if="mode === 'export'"
      @confirmed="handleUnpegRequested"
      :requestClose="requestTransactionModalClose"
      :state="transactionState"
      :transactionHash="transactionHash"
      :transactionStateMsg="transactionStateMsg"
      confirmButtonText="Confirm Export"
      title="Export token from Sifchain"
    >
      <template v-slot:selecting>
        <DetailsTable
          :header="{
            show: amount !== '0.0',
            label: `${modeLabel} Amount`,
            data: `${amount} ${formatSymbol(symbol)}`,
          }"
          :rows="[
            {
              show: true,
              label: 'Direction',
              data: `${formatSymbol(symbol)} → ${formatSymbol(oppositeSymbol)}`,
            },
            {
              show: !!feeDisplayAmount,
              label: 'Transaction Fee',
              data: `${feeDisplayAmount} cETH`,
            },
          ]"
        />
      </template>
      <template v-slot:common>
        <p class="text--normal">
          Exporting <span class="text--bold">{{ amount }} {{ symbol }}</span>
        </p>
      </template>
    </ConfirmationModal>
  </Layout>
</template>

<style lang="scss" scoped>
.vspace {
  display: flex;
  flex-direction: column;
  & > * {
    margin-bottom: 1rem;
  }

  & > *:last-child {
    margin-bottom: 0;
  }
}
</style>
