import { computed, onMounted, onUnmounted, ref } from "vue";
import { useAsyncData } from "~/hooks/useAsyncData";
import { useCore } from "~/hooks/useCore";
import { accountStore } from "~/store/modules/accounts";

// TODO REACTIVE

export const rewardColumnsLookup = {
  rewardProgram: {
    class: "w-[175px] text-left flex-shrink-0",
  },
  apy: {
    class: "w-[175px] text-right",
  },
  claimableAmount: {
    class: "w-[200px] text-right flex-shrink-0",
  },
  duration: {
    class: "w-[150px] text-right flex-shrink-0",
  },
  expand: {
    class: "flex-1 flex items-center justify-end flex-shrink-0",
  },
};

export type RewardProgram = {
  participant?: {
    pendingRewards: number;
    dispensed: number;
    accumulatedRewards: number;
  };
  incentivizedPoolSymbols: string[];
  isUniversal: boolean;
  summaryAPY: number;
  rewardProgramName: string;
  startDateTimeISO: string;
  endDateTimeISO: string | null;
  documentationURL: string;
  displayName: string;
  description: string;
};

export function useRewardsPageData() {
  const { services } = useCore();
  const address = accountStore.refs.sifchain.address.computed();

  const rewardProgramResponse = useAsyncData(async () => {
    const rewardPrograms = await services.data.getRewardsPrograms();

    let timeRemaining = "";
    let totalDispensed = 0;

    if (address.value) {
      const participantRewards = await services.data.getUserRewards(
        address.value,
      );

      if (participantRewards.timeRemaining) {
        timeRemaining = participantRewards.timeRemaining;
      }

      if (participantRewards.totalDispensed) {
        totalDispensed = participantRewards.totalDispensed;
      }

      const programs = rewardPrograms.map((program, _i) => {
        const summary = participantRewards.programs[program.rewardProgramName];
        return {
          ...program,
          participant: {
            pendingRewards: summary?.pendingRewards ?? 0,
            dispensed: summary?.dispensed ?? 0,
            accumulatedRewards: summary?.accumulatedRewards ?? 0,
          },
        };
      });

      return {
        rewardPrograms: programs,
        timeRemaining,
        totalDispensed,
      };
    } else {
      const programs = rewardPrograms.map((program, _i) => {
        return {
          ...program,
          participant: {
            dispensed: 0,
            pendingRewards: 0,
            accumulatedRewards: 0,
          },
        };
      });
      return {
        rewardPrograms: programs,
        timeRemaining,
        totalDispensed,
      };
    }
  }, [address]);

  const isLoading = computed(() => !accountStore.state.sifchain.address);
  const error = computed(() => rewardProgramResponse.error?.value);

  return {
    address,
    isLoading,
    rewardProgramResponse,
    error,
  };
}

function calculateDateOfNextDispensation(currentDate: Date) {
  const date = currentDate;
  date.setMinutes(0, 0, 0);
  let hoursIterationLimit = 24 * 7.5;
  while (hoursIterationLimit--) {
    date.setHours(date.getHours() + 1);
    // output format: Friday, December 31, 2021 at 4:17:29 PM PST
    const formattedDate = new Intl.DateTimeFormat("en-US", {
      dateStyle: "full",
      timeStyle: "long",
    }).format(date);
    // dispensations are on Mondays at 8:00 AM PST
    if (
      formattedDate.includes("Monday") &&
      formattedDate.includes("8:00:00 AM")
    )
      return date;
  }
  throw new Error("date not found");
}

function getHumanReadableTimeUntil(date: Date) {
  const diff = date.getTime() - new Date().getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / 1000 / 60) % 60);
  return `${days}d ${hours}h ${mins}m`;
}

export const useTimeUntilNextDispensation = () => {
  const isMounted = ref(false);
  const currentDate = ref(new Date());
  onMounted(() => {
    isMounted.value = true;
    const interval = setInterval(() => {
      currentDate.value = new Date();
      if (!isMounted.value) clearInterval(interval);
    }, 1000);
  });
  onUnmounted(() => {
    isMounted.value = false;
  });
  return computed(() => {
    try {
      const dateOfNextDispensation = calculateDateOfNextDispensation(
        currentDate.value,
      );
      return {
        timeUntilNextDispensation: getHumanReadableTimeUntil(
          dateOfNextDispensation,
        ),
        dateOfNextDispensation,
      };
    } catch (e) {
      console.error(e);
      return {
        timeUntilNextDispensation: "browser not supported",
        dateOfNextDispensation: new Date(0),
      };
    }
  });
};
