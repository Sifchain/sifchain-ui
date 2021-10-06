import { computed, ComputedRef, ref, watch } from "vue";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useCore } from "@/hooks/useCore";
import { getExistingClaimsData } from "@/componentsLegacy/shared/utils";
import { accountStore } from "@/store/modules/accounts";
import { QueryClaimsByTypeRequest } from "../../../../core/src/generated/proto/sifnode/dispensation/v1/query";
import { NativeDexClient } from "../../../../core/src/services/utils/SifClient/NativeDexClient";
import { DistributionType } from "../../../../core/src/generated/proto/sifnode/dispensation/v1/types";
import { flagsStore } from "@/store/modules/flags";
import { createCryptoeconGqlClient } from "@/utils/createCryptoeconGqlClient";

// TODO REACTIVE

const useLiquidityMiningData = (
  address: ComputedRef<string>,
  rewardProgram?: "harvest",
) => {
  const { services } = useCore();
  return useAsyncData(async () => {
    // return null;
    if (!address.value) return null;
    return services.cryptoeconomics.fetchLmData({
      address: address.value,
      rewardProgram,
      devnet: flagsStore.state.devnetCryptoecon,
    });
  }, [address]);
};

const useValidatorSubsidyData = (address: ComputedRef<string>) => {
  const { services } = useCore();
  return useAsyncData(async () => {
    return null;
    if (!address.value) return null;
    return services.cryptoeconomics.fetchVsData({
      address: address.value,
      devnet: flagsStore.state.devnetCryptoecon,
    });
  }, [address]);
};

const useExistingClaimsData = (
  address: ComputedRef<string>,
  sifRpcUrl: string,
) => {
  const res = useAsyncData(async () => {
    if (!address.value) return null;
    const config = useCore().config;
    const nativeDexClient = await NativeDexClient.connect(
      config.sifRpcUrl,
      config.sifApiUrl,
      config.sifChainId,
    );
    const claims = await nativeDexClient.query.dispensation.ClaimsByType({
      userClaimType: DistributionType.DISTRIBUTION_TYPE_LIQUIDITY_MINING,
    });
    const userClaims = claims.claims.filter(
      (c) => c.userAddress === address.value,
    );
    const lm = userClaims.some(
      (c) =>
        c.userClaimType === DistributionType.DISTRIBUTION_TYPE_LIQUIDITY_MINING,
    );
    const vs = userClaims.some(
      (c) =>
        c.userClaimType ===
        DistributionType.DISTRIBUTION_TYPE_VALIDATOR_SUBSIDY,
    );
    return {
      lm: lm,
      vs: vs,
    };
  }, [address]);
  return res;
};

export type RewardProgramParticipant = {
  currentAPYOnTickets: number;
  totalClaimableCommissionsAndClaimableRewards: number;
  maturityDateMs: string;
  yearsToMaturity: number;
  totalDepositedAmount: number;
  currentTotalCommissionsOnClaimableDelegatorRewards: number;
  claimedCommissionsAndRewardsAwaitingDispensation: number;
  dispensed: number;
  totalCommissionsAndRewardsAtMaturity: number;
};
export type RewardProgram = {
  participant?: RewardProgramParticipant;
  incentivizedPoolSymbols: string[];
  isUniversal: boolean;
  summaryAPY: number;
  rewardProgramName: string;
  rewardProgramType: string;
  startDateTimeISO: string;
  endDateTimeISO: string;
  distributionPattern: string;
  documentationURL: string;
  displayName: string;
  description: string;
};
export const useRewardsPageData = () => {
  const { config, services } = useCore();
  const address = accountStore.refs.sifchain.address.computed();

  const gql = createCryptoeconGqlClient();

  const rewardProgramResponse = useAsyncData(
    (): Promise<{
      rewardPrograms: RewardProgram[];
    }> =>
      gql`
        query ${address.value ? `($participantAddress: String!)` : ``} {
          rewardPrograms {
            ${
              address.value
                ? `
            participant(address: $participantAddress) {
              totalCommissionsAndRewardsAtMaturity
              currentAPYOnTickets
              totalClaimableCommissionsAndClaimableRewards
              currentTotalCommissionsOnClaimableDelegatorRewards
              maturityDateMs
              yearsToMaturity
              totalDepositedAmount
              claimedCommissionsAndRewardsAwaitingDispensation
              dispensed
            }`
                : ``
            }
            displayName
            description
            documentationURL
            incentivizedPoolSymbols
            isUniversal
            summaryAPY
            rewardProgramName
            rewardProgramType
            startDateTimeISO
            endDateTimeISO
            distributionPattern
          }
        }
      `({ participantAddress: address.value }),
    [address],
  );

  const claimsRes = useExistingClaimsData(address, config.sifRpcUrl);

  const isLoading = computed(() => {
    return !accountStore.state.sifchain.address || claimsRes.isLoading.value;
  });
  const error = computed(() => {
    return rewardProgramResponse.error.value || claimsRes.error.value;
  });

  return {
    address,
    isLoading,
    rewardProgramResponse,
    error,
    lmClaim: computed(() => claimsRes.data.value?.lm),
    reloadClaims: () => claimsRes.reload.value(),
  };
};
