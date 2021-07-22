import { defineComponent, PropType, ref, computed, Ref } from "vue";
import { Form } from "@/components/Form";
import Modal from "@/components/Modal";
import TransactionDetailsModal from "@/components/TransactionDetailsModal";
import { TransactionStatus } from "@sifchain/sdk";
import {
  CryptoeconomicsRewardType,
  CryptoeconomicsUserData,
} from "@sifchain/sdk/src/services/CryptoeconomicsService";
import { TokenIcon } from "@/components/TokenIcon";
import { Amount, format, Asset } from "@sifchain/sdk";
import { Button } from "@/components/Button/Button";
import { useCore } from "@/hooks/useCore";
import { useTransactionDetails } from "@/hooks/useTransactionDetails";

const formatRowanNumber = (n?: number) => {
  if (n == null) return "0";
  return (
    format(Amount(String(n)), {
      mantissa: 4,
      zeroFormat: "0",
    }) || "0"
  );
};

const claimTypeMap = {
  lm: "2",
  vs: "3",
};

export default defineComponent({
  name: "ClaimRewardsModal",
  props: {
    address: { type: String, required: true },
    data: { type: Object as PropType<CryptoeconomicsUserData>, required: true },
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
      const status = await usecases.reward.claim({
        claimType: claimTypeMap[props.rewardType] as "2" | "3",
        fromAddress: props.address,
      });
      transactionStatusRef.value = status;
    };

    const transactionDetails = useTransactionDetails({
      tx: transactionStatusRef,
    });

    const detailsRef = computed<[any, any][]>(() => [
      [
        "Claimable Rewards",
        <span class="flex items-center font-mono">
          {formatRowanNumber(
            props.data?.user?.totalClaimableCommissionsAndClaimableRewards,
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
      [
        "Projected Full Amount",
        <span class="flex items-center font-mono">
          {formatRowanNumber(
            props.data?.user?.totalCommissionsAndRewardsAtMaturity,
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
      [
        "Maturity Date",
        props.data?.user?.maturityDate.toLocaleDateString() +
          ", " +
          props.data?.user?.maturityDate.toLocaleTimeString(),
      ],
    ]);

    return () => {
      if (transactionStatusRef.value) {
        return (
          <TransactionDetailsModal
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
        >
          <p class="text-[22px]">
            Are you sure you want to claim your rewards?
          </p>
          <p class="mt-[10px]">
            Claiming your rewards will restart all of your tickets at this very
            moment.
            <br />
            <br />
            Resetting your tickets will release your rewards based on its
            current multiplier. Reset tickets then begin empty with a 25%
            multiplier again and will continue to accumulate if within the
            eligibility timeframe.
            <br />
            <br /> Unless you have reached full maturity, we reccomend that you
            do not claim so you vcan realize your full rewards. Please note that
            the rewards will be dispensed at the end of the week.
            <br />
            <br />
            Find out{" "}
            <a
              href="https://docs.sifchain.finance/resources/rewards-programs"
              rel="noopener noreferrer"
              target="_blank"
              class="underline"
            >
              additional information here
            </a>
            .
            <Form.Details class="mt-[16px]" details={detailsRef.value} />
          </p>
          <Button.CallToAction class="mt-[10px]" onClick={handleClaimRewards}>
            Claim{" "}
            {formatRowanNumber(
              props.data?.user?.totalClaimableCommissionsAndClaimableRewards,
            )}{" "}
            Rowan
          </Button.CallToAction>
        </Modal>
      );
    };
  },
});
