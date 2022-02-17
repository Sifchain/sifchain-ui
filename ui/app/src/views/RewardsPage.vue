<script lang="ts">
import { computed, defineComponent, watch, onMounted } from "vue";
import { ref } from "@vue/reactivity";
import { useCore } from "@/hooks/useCore";
import {
  getLMData,
  getVSData,
  getExistingClaimsData,
  IHasClaimed,
} from "@/componentsLegacy/shared/utils";
import Layout from "@/componentsLegacy/Layout/Layout";
import ConfirmationModal from "@/componentsLegacy/ConfirmationModal/ConfirmationModal.vue";
import { Copy } from "@/componentsLegacy/Text";
import ActionsPanel from "@/componentsLegacy/ActionsPanel/ActionsPanel.vue";
import Modal from "@/componentsLegacy/Modal/Modal.vue";
import ModalView from "@/componentsLegacy/Modal/Modal.vue";
import PairTable from "@/componentsLegacy/PairTable/PairTable.vue";
import { ConfirmState, ConfirmStateEnum } from "@/types";
import RewardContainer from "@/componentsLegacy/RewardContainer/RewardContainer.vue";
import { toConfirmState } from "./utils/toConfirmState";

const claimTypeMap = {
  lm: "2",
  vs: "3",
};
type IClaimType = "lm" | "vs" | null;

export default defineComponent({
  components: {
    Layout,
    ActionsPanel,
    Copy,
    Modal,
    ModalView,
    PairTable,
    ConfirmationModal,
    RewardContainer,
  },
  methods: {
    openClaimModal() {
      this.transactionState = "confirming";
    },
    requestClose() {
      this.transactionState = "selecting";
    },
    handleOpenModal(type: IClaimType) {
      this.claimType = type;
      this.openClaimModal();
    },
  },
  data() {
    return {
      modalOpen: false,
      loadingLm: true,
      loadingVs: true,
    };
  },
  setup() {
    const { store, usecases, config } = useCore();
    const address = computed(() => store.wallet.get(Network.SIFCHAIN).address);
    const transactionState = ref<ConfirmState | string>("selecting");
    const transactionStateMsg = ref<string>("");
    const transactionHash = ref<string | null>(null);
    // TODO - We can do this better later
    let lmRewards = ref<any>();
    let vsRewards = ref<any>();
    let alreadyClaimed = ref<IHasClaimed>({
      lm: false,
      vs: false,
    });
    let loadingVs = ref<Boolean>(true);
    let claimType = ref<IClaimType>(null);

    watch(address, async () => {
      alreadyClaimed.value = await getExistingClaimsData(
        address,
        config.sifApiUrl,
      );
      lmRewards.value = await getLMData(address, config.sifChainId);
      vsRewards.value = await getVSData(address, config.sifChainId);
    });

    onMounted(async () => {
      alreadyClaimed.value = await getExistingClaimsData(
        address,
        config.sifApiUrl,
      );
      lmRewards.value = await getLMData(address, config.sifChainId);
      vsRewards.value = await getVSData(address, config.sifChainId);
    });

    async function handleAskConfirmClicked() {
      if (!claimType.value) {
        return console.error("No claim type");
      }
      transactionState.value = ConfirmStateEnum.Signing;
      const tx = await usecases.reward.claim({
        fromAddress: address.value,
        claimType: claimTypeMap[claimType.value] as "2" | "3",
      });
      transactionHash.value = tx.hash;
      transactionState.value = toConfirmState(tx.state); // TODO: align states
      transactionStateMsg.value = tx.memo ?? "";
      alreadyClaimed.value = await getExistingClaimsData(
        address,
        config.sifApiUrl,
      );
    }

    const computedPairPanel = computed(() => {
      if (!claimType.value) {
        return console.error("No claim type");
      }
      let data;
      claimType.value === "lm" ? (data = lmRewards) : (data = vsRewards);
      return [
        {
          key: "Claimable  Rewards",
          value: data.value.totalClaimableCommissionsAndClaimableRewards,
        },
        {
          key: "Projected Full Amount",
          value: data.value.totalCommissionsAndRewardsAtMaturity,
        },
        {
          key: "Maturity Date",
          value: data.value.maturityDateISO,
          type: "date",
        },
      ];
    });

    return {
      lmRewards,
      vsRewards,
      alreadyClaimed,
      computedPairPanel,
      handleAskConfirmClicked,
      transactionState,
      transactionStateMsg,
      transactionHash,
      loadingVs,
      address,
      claimType,
    };
  },
});
</script>

<template>
  <Layout :header="true" title="Rewards">
    <Copy>
      Earn rewards by participating in any of our rewards-earning programs.
      Please see additional information of our
      <a
        target="_blank"
        class="underline"
        href="https://docs.sifchain.finance/using-the-website/web-ui-step-by-step/rewards/liquidity-mining-rewards-programs"
        >current rewards program</a
      >
      and how to become eligible.
    </Copy>
    <div class="rewards-container">
      <RewardContainer
        claimType="lm"
        :data="lmRewards"
        :address="address"
        :claimDisabled="false"
        :alreadyClaimed="alreadyClaimed['lm']"
        @openModal="handleOpenModal"
      />
      <RewardContainer
        claimType="vs"
        :data="vsRewards"
        :address="address"
        :claimDisabled="false"
        :alreadyClaimed="alreadyClaimed['vs']"
        @openModal="handleOpenModal"
      />
    </div>

    <ActionsPanel connectType="connectToSif" />

    <div v-if="transactionState !== 'selecting'">
      <ConfirmationModal
        :requestClose="requestClose"
        @confirmed="handleAskConfirmClicked"
        :state="transactionState"
        :transactionHash="transactionHash"
        :transactionStateMsg="transactionStateMsg"
        confirmButtonText="Claim Rewards"
        title="Claim Rewards"
      >
        <template v-slot:selecting>
          <div class="claim-container">
            <Copy class="mb-8">
              Are you sure you want to claim your rewards? Claiming your rewards
              will reset all of your tickets at this very moment. Resetting your
              tickets will release your rewards based on its current multiplier.
              Reset tickets then start empty with a 25% multiplier again and
              will continue to accumulate if within the reward eligibility
              timeframe. Unless you have reached full maturity, we recommend
              that you do not claim so you can realize your full rewards.
            </Copy>
            <Copy class="mb-8">
              Please note that the rewards will be dispensed at the end of the
              week.
            </Copy>
            <Copy class="mb-8">
              Find out
              <a
                href="https://docs.sifchain.finance/using-the-website/web-ui-step-by-step/rewards/liquidity-mining-rewards-programs"
                target="_blank"
                >additional information here</a
              >.
            </Copy>
            <PairTable :items="computedPairPanel" class="mb-10" />
          </div>
        </template>

        <template v-slot:common>
          <p class="text--normal" data-handle="confirmation-wait-message">
            <span :data-handle="claimType + '-claim-type'">
              {{
                claimType === "lm" ? "Liquidity Mining" : "Validator Subsidy"
              }}</span
            >
            Rewards <br /><br />
            <span :data-handle="claimType + '-claim-value'">
              Claim {{ computedPairPanel[0].value }} Rowan</span
            >
          </p>
        </template>
      </ConfirmationModal>
    </div>
  </Layout>
</template>

<style scoped lang="scss">
.rewards-container {
  display: flex;
  flex-direction: column;
  > :first-child {
    margin-top: $margin_medium;
  }
  width: 100%;
  > :nth-child(1) {
    margin-bottom: $margin_medium;
  }
}

/* MODAL Styles */
.claim-container {
  font-weight: 400;
  display: flex;
  flex-direction: column;
  // padding: 30px 20px 20px 20px;
  min-height: 50vh;
  .container {
    font-size: 14px;
    line-height: 21px;
  }
}
</style>
