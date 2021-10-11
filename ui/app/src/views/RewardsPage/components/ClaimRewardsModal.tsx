import { defineComponent, PropType, ref, computed, Ref } from "vue";
import { Form } from "@/components/Form";
import Modal from "@/components/Modal";
import TransactionDetailsModal from "@/components/TransactionDetailsModal";
import { Network, TransactionStatus } from "@sifchain/sdk";
import {
  CryptoeconomicsRewardType,
  CryptoeconomicsUserData,
} from "@sifchain/sdk/src/services/CryptoeconomicsService";
import { TokenIcon } from "@/components/TokenIcon";
import { Amount, format, Asset } from "@sifchain/sdk";
import { Button } from "@/components/Button/Button";
import { useCore } from "@/hooks/useCore";
import { useTransactionDetails } from "@/hooks/useTransactionDetails";
import { DistributionType } from "../../../../../core/src/generated/proto/sifnode/dispensation/v1/types";
import { RewardsChart } from "./RewardsChart";
import AssetIcon from "@/components/AssetIcon";
import { flagsStore } from "@/store/modules/flags";
import { RewardProgram, RewardProgramParticipant } from "../useRewardsPageData";
import { getClaimableAmountString } from "../getClaimableAmountString";

const claimTypeMap = {
  lm: "2",
  vs: "3",
};

export default defineComponent({
  name: "ClaimRewardsModal",
  props: {
    address: { type: String, required: true },
    rewardPrograms: {
      type: Array as PropType<RewardProgram[]>,
      required: true,
    },
    summaryAPY: { type: Number },
    rewardType: {
      type: Object as PropType<CryptoeconomicsRewardType>,
      required: true,
    },
    onClose: { type: Function as PropType<() => void>, required: true },
  },
  setup(props) {
    const { usecases } = useCore();
    const transactionStatusRef = ref<TransactionStatus | null>(null);
    const handleClaimRewards = async () => {
      transactionStatusRef.value = {
        hash: "",
        state: "requested",
      };
      try {
        const status = await usecases.reward.claim({
          // claimType: (claimTypeMap[
          //   props.rewardType
          // ] as unknown) as DistributionType,
          claimType:
            props.rewardType === "lm"
              ? DistributionType.DISTRIBUTION_TYPE_LIQUIDITY_MINING
              : DistributionType.DISTRIBUTION_TYPE_VALIDATOR_SUBSIDY,
          fromAddress: props.address,
          rewardProgramName: "harvest",
        });
        if (status.state === "accepted") {
          useCore().services.bus.dispatch({
            type: "SuccessEvent",
            payload: {
              message: `Claimed ${getClaimableAmountString(
                props.rewardPrograms.reduce((prev, curr) => {
                  return (
                    prev +
                    (curr.participant
                      ?.totalClaimableCommissionsAndClaimableRewards || 0)
                  );
                }, 0),
              )} ROWAN of rewards`,
            },
          });
        }
        transactionStatusRef.value = status;
      } catch (error) {
        const rejected = /rejected/i.test(error.message || "");
        transactionStatusRef.value = {
          hash: "",
          state: rejected ? "rejected" : "failed",
          memo: rejected ? "Transaction rejected" : "Unknown error",
        };
      }
    };

    const rewardsAtMaturityAfterClaim = computed(() => {
      return (
        (props.summaryAPY || 0) *
        0.01 *
        (props.rewardPrograms.reduce((prev, curr) => {
          return Math.max(prev, curr.participant?.yearsToMaturity || 0);
        }, 0) || 0) *
        (props.rewardPrograms.reduce((prev, curr) => {
          return prev + (curr.participant?.totalDepositedAmount || 0);
        }, 0) || 0)
      );
    });

    const transactionDetails = useTransactionDetails({
      tx: transactionStatusRef,
    });

    const detailsRef = computed<[any, any][]>(
      () =>
        [
          [
            "Claimable Rewards Today",
            <span class="flex items-center font-mono">
              {getClaimableAmountString(
                props.rewardPrograms.reduce((prev, curr) => {
                  return (
                    prev +
                    (curr.participant
                      ?.totalClaimableCommissionsAndClaimableRewards || 0)
                  );
                }, 0),
              )}
              {
                <TokenIcon
                  assetValue={Asset.get("rowan")}
                  size={16}
                  class="ml-[4px]"
                />
              }
            </span>,
          ],
          props.rewardPrograms.reduce((prev, curr) => {
            return Math.max(prev, +(curr.participant?.maturityDateMs || 0));
          }, 0)
            ? [
                "Maturity Date",
                new Date(
                  props.rewardPrograms.reduce((prev, curr) => {
                    return Math.max(
                      prev,
                      +(curr.participant?.maturityDateMs || 0),
                    );
                  }, 0),
                ).toLocaleDateString(),
              ]
            : null,
          // [
          //   <span class="flex items-center">Projected Full Reward</span>,
          //   <span
          //     class={[
          //       `flex items-center font-mono`,
          //       flagsStore.state.claimsGraph
          //         ? "border-b border-solid border-accent-base border-opacity-80"
          //         : "",
          //     ]}
          //   >
          //     {getClaimableAmountString(
          //       props.userData?.user?.totalCommissionsAndRewardsAtMaturity,
          //     )}
          //     {
          //       <TokenIcon
          //         assetValue={Asset.get("rowan")}
          //         size={16}
          //         class="ml-[4px]"
          //       />
          //     }
          //   </span>,
          // ],
          // (() => {
          //   const totalLessRowan = parseFloat(
          //     getClaimableAmountString(
          //       Math.ceil(
          //         (props.userData?.user
          //           ?.claimedCommissionsAndRewardsAwaitingDispensation || 0) +
          //           (props.userData?.user?.dispensed || 0) +
          //           (props.userData?.user
          //             ?.totalCommissionsAndRewardsAtMaturity || 0) -
          //           rewardsAtMaturityAfterClaim.value -
          //           (props.userData?.user
          //             ?.totalClaimableCommissionsAndClaimableRewards || 0),
          //       ),
          //     ),
          //   ).toFixed(0);
          //   if (+totalLessRowan < 0) return;
          //   return [
          //     <span class="flex items-center">
          //       Projected Reward Difference if Claimed Today
          //       <Button.InlineHelp>
          //         If you claim today, you will end up with approximately{" "}
          //         {totalLessRowan} less ROWAN on your maturity date of{" "}
          //         {props.userData?.user?.maturityDate.toLocaleDateString()}.
          //       </Button.InlineHelp>
          //     </span>,
          //     <span
          //       class={[
          //         `flex items-center font-mono`,
          //         flagsStore.state.claimsGraph
          //           ? "border-b border-solid border-info-base border-opacity-80"
          //           : "",
          //       ]}
          //     >
          //       -{totalLessRowan}
          //       {
          //         <TokenIcon
          //           assetValue={Asset.get("rowan")}
          //           size={16}
          //           class="ml-[4px]"
          //         />
          //       }
          //     </span>,
          //   ];
          // })(),
        ].filter((item) => item != null) as [any, any],
    );

    return () => {
      if (transactionStatusRef.value) {
        return (
          <TransactionDetailsModal
            network={Network.SIFCHAIN}
            icon="navigation/rewards"
            onClose={props.onClose}
            transactionDetails={transactionDetails}
            details={detailsRef}
          />
        );
      }
      return (
        <Modal
          heading={
            props.rewardType === "vs"
              ? "Claim Validator Subsidy Rewards"
              : "Claim Liquidity Mining Rewards"
          }
          icon="navigation/rewards"
          showClose
          onClose={props.onClose}
          class="w-[610px]"
        >
          <p class="text-[22px]">
            Are you sure you want to claim your rewards?
          </p>
          <p class="mt-[10px]">
            Claims are paid out on Friday of each week. Once your funds are
            dispensed, you may be interested in staking or delegating your
            earnings with{" "}
            <a
              class="underline font-semibold"
              href="https://docs.sifchain.finance/resources/rewards-programs#block-rewards"
            >
              Sifchain's block rewards program
            </a>
            .
            <br />
          </p>
          {/* <p class="mt-[10px]">
            If you claim your rewards now, you will accrue less rewards in total
            on your currently pooled assets than if you wait to claim until your
            Maturity Date. For more information about our rewards program,{" "}
            <a
              href="https://docs.sifchain.finance/resources/rewards-programs"
              rel="noopener noreferrer"
              target="_blank"
              class="underline"
            >
              click here
            </a> */}
          {/* . */}
          {/* {flagsStore.state.claimsGraph && (
              <div class="mt-[32px]">
                <RewardsChart
                  rewardsAtMaturityAfterClaim={
                    rewardsAtMaturityAfterClaim.value
                  }
                  userData={props.userData}
                />
              </div>
            )} */}
          {/* <Form.Details class="mt-[24px]" details={detailsRef.value} />
          </p> */}
          <Button.CallToAction class="mt-[10px]" onClick={handleClaimRewards}>
            Claim{" "}
            {getClaimableAmountString(
              props.rewardPrograms.reduce((prev, curr) => {
                return (
                  prev +
                  (curr.participant
                    ?.totalClaimableCommissionsAndClaimableRewards || 0)
                );
              }, 0),
            )}{" "}
            Rowan
          </Button.CallToAction>
        </Modal>
      );
    };
  },
});
