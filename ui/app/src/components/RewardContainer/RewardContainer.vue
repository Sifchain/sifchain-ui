<script>
import Box from "@/components/Box/Box.vue";
import { Copy, SubHeading } from "@/components/Text";
import Loader from "@/components/Loader/Loader.vue";
import Tooltip from "@/components/Tooltip/Tooltip.vue";
import Icon from "@/components/Icon/Icon.vue";
import AssetItem from "@/components/AssetItem/AssetItem.vue";
import SifButton from "@/components/SifButton/SifButton.vue";
import { format } from "@sifchain/sdk/src/utils/format";

const REWARD_INFO = {
  lm: {
    label: ".39 Liquidity Mining",
    description:
      "Users could earn additional rewards by providing liquidity to any of Sifchain's pools within our .39 environment. Participants are now fully determined at this point in time.",
  },
  vs: {
    label: ".39 Validator Subsidy",
    description:
      "Users could Earn additional rewards by staking a node or delegating to a staked node within our .39 environment. Participants are now fully determined at this point in time.",
  },
};

export default {
  props: {
    alreadyClaimed: {
      type: Boolean || Object,
      default: false,
    },
    claimDisabled: {
      type: Boolean,
      default: true,
    },
    claimType: {
      type: String,
    },
    data: {
      type: Object,
    },
    address: {
      type: String,
    },
  },
  components: {
    SifButton,
    AssetItem,
    Copy,
    SubHeading,
    Box,
    Tooltip,
    Icon,
    Loader,
  },
  emits: ["openModal"],
  methods: {
    format,
    openClaimModal() {
      this.modalOpen = true;
    },
    requestClose() {
      this.modalOpen = false;
    },
    claimRewards() {
      alert("claim logic/keplr goes here");
    },
    getClaimButtonText() {
      if (this.alreadyClaimed) {
        return "Pending Claim";
      } else {
        return "Claim";
      }
    },
  },
  data() {
    return {
      modalOpen: false,
      loadingLm: true,
      loadingVs: true,
      REWARD_INFO,
    };
  },
};
</script>

<template>
  <Box>
    <div class="reward-container">
      <SubHeading>{{ REWARD_INFO[claimType].label }}</SubHeading>
      <Copy>
        <p v-html="REWARD_INFO[claimType].description"></p>
      </Copy>
      <div class="details-container">
        <div class="reward-buttons">
          <a
            class="btn more-info-button mr-8"
            target="_blank"
            href="https://docs.sifchain.finance/resources/rewards-programs#liquidity-mining-and-validator-subsidy-rewards-on-sifchain"
            >Learn More</a
          >
          <a
            class="btn sif-button"
            target="_blank"
            href="https://docs.google.com/spreadsheets/d/1f-ibZyx5O2f1wsNxvi56Kg8fkdys_DVmwhf7mjKDrDU/edit#gid=686570385"
            >Payout Schedule</a
          >
        </div>
      </div>
    </div>
  </Box>
</template>

<style lang="scss" scoped>
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
  .reward-container {
    flex-direction: column;
    > :nth-child(1),
    > :nth-child(2) {
      margin-bottom: $margin_small;
    }
  }
  .reward-rows {
    display: flex;
    flex-direction: column;
    margin-bottom: 15px;
    color: #343434;
  }
  .reward-row {
    display: flex;
    width: 100%;
    justify-content: space-between;
    font-size: $fs;
    font-weight: 400;
    &.secondary {
      color: #818181;
    }
    .row-label {
      flex: 1 1 auto;
      text-align: left;
    }
    .row-amount {
      width: 100px;
      text-align: right;
    }
    .row {
      width: 15px;
      margin-left: 2px;
    }
  }
}

.reward-buttons {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  .btn {
    font-weight: 100;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 300px;
    border-radius: 6px;
    display: flex;
    font-size: $fs;
    height: 30px;
  }
  .reward-button {
    text-align: center;
  }
  .more-info-button {
    background: #f3f3f3;
    color: #343434;
  }
  .sif-button {
    background: $c_gold;
    color: white;
  }
}

.tooltip-date {
  font-weight: 600;
}
</style>
