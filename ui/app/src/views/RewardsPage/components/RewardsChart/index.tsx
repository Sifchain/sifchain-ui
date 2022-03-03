import { defineComponent, onUnmounted, PropType, ref } from "vue";
import { effect } from "@vue/reactivity";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useCore } from "@/hooks/useCore";
import { accountStore } from "@/store/modules/accounts";
import {
  CryptoeconomicsTimeseriesItem,
  CryptoeconomicsUserData,
} from "@/business/services/CryptoeconomicsService";
import { loadAllChartDeps } from "./loadDeps";

// NOTE(ajoslin): Do not import the values of these libs, only the types.
// They are big and we async import them.
import type * as ChartJS from "chart.js";

export const RewardsChart = defineComponent({
  name: "RewardsChart",
  props: {
    userData: {
      type: Object as PropType<CryptoeconomicsUserData>,
      required: true,
    },
    rewardsAtMaturityAfterClaim: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const timeseriesData = useAsyncData(() => {
      return useCore().services.cryptoeconomics.fetchTimeseriesData({
        address: accountStore.state.sifchain.address,
        devnet: false,
      });
    });

    const deps = useAsyncData(loadAllChartDeps);

    const chartRef = ref();
    const canvasRef = ref();

    effect(() => {
      if (!timeseriesData.data.value) return;
      if (!deps.data.value) return;
      if (!canvasRef.value) return;
      if (chartRef.value) return;
      if (!props.userData) return;

      // @ts-ignore
      chartRef.value = renderChart({
        canvasElement: canvasRef.value,
        timeseriesData: timeseriesData.data.value,
        userData: props.userData,
        rewardsAtMaturityAfterClaim: props.rewardsAtMaturityAfterClaim,
        chartjs: deps.data.value.chartjs,
      });
    });
    onUnmounted(() => {
      chartRef.value?.destroy();
    });

    const width = 490;
    const height = 245;

    return () => (
      <div class="w-full">
        <canvas
          onClick={() => chartRef.value?.resetZoom()}
          ref={canvasRef}
          id="myChart"
          width={width}
          height={height}
        />
      </div>
    );
  },
});

const ONE_MINUTE = 60 * 1000;

function calculateRewardProgramDates(
  timeseriesData: CryptoeconomicsTimeseriesItem[],
  userData: CryptoeconomicsUserData,
) {
  if (!userData) return;
  const firstReward = timeseriesData.find(
    (item) => item.userClaimableReward > 0,
  );
  const startTimestamp = firstReward?.timestamp || timeseriesData[0].timestamp;
  if (startTimestamp == null) return;

  const timestampDiffWithNow = Math.max(0, userData.timestamp - startTimestamp);

  const startDate = new Date(Date.now() - timestampDiffWithNow * ONE_MINUTE);

  // Give end date a buffer to show flattening curve.
  const endDate = userData.user
    ? new Date(userData.user.maturityDate)
    : new Date();

  const endTimestamp =
    userData.timestamp +
    Math.floor(endDate.getTime() - Date.now()) / ONE_MINUTE;

  return {
    startDate,
    startTimestamp,
    endDate,
    endTimestamp,
  };
}

function renderChart(options: {
  showDatasets: Array<"full" | "partial">;
  canvasElement: HTMLCanvasElement;
  timeseriesData: CryptoeconomicsTimeseriesItem[];
  userData: CryptoeconomicsUserData;
  rewardsAtMaturityAfterClaim: number;
  chartjs: typeof ChartJS;
}) {
  const {
    canvasElement,
    timeseriesData,
    userData,
    rewardsAtMaturityAfterClaim,
    chartjs,
  } = options;

  const dates = calculateRewardProgramDates(timeseriesData, userData);
  if (!dates || !userData) return;

  const relevantTimeseriesData = timeseriesData.filter((item) => {
    return (
      item.timestamp >= dates.startTimestamp &&
      item.timestamp <= dates.endTimestamp
    );
  });

  function easeInSine(x: number): number {
    return 1 - Math.cos((x * Math.PI) / 2);
  }
  const postClaimTimestamps = relevantTimeseriesData
    .filter((item) => {
      return item.timestamp >= userData.timestamp;
    })
    .map((item) => item.timestamp);
  const postClaimData = postClaimTimestamps.map((timestamp, index) => {
    const mul = (index + 1) / postClaimTimestamps.length;
    return {
      y: easeInSine(mul) * rewardsAtMaturityAfterClaim,
      x: new Date(dates.startDate.getTime() + timestamp * ONE_MINUTE),
    };
  });

  const fullRewardData = relevantTimeseriesData.map((item, index) => {
    const mul = (index + 1) / relevantTimeseriesData.length;
    return {
      y:
        easeInSine(mul) *
        (userData.user?.totalCommissionsAndRewardsAtMaturity || 0),
      x: new Date(dates.startDate.getTime() + item.timestamp * ONE_MINUTE),
    };
  });

  const createDatasets = () => {
    return [
      {
        tickColor: "#C1A04F",
        borderColor: "#D4B553",
        borderWidth: 2,
        radius: 0,
        backgroundColor: "rgba(212, 181, 83, .2)",
        fill: true,
        label: "Projected Full Reward",
        data: fullRewardData,
      },
      {
        tickColor: "#459FEE",
        borderColor: "#459FEE",
        backgroundColor: "rgba(69, 159, 238, .2)",
        borderWidth: 2,
        label: "Projected Reward if Claimed Today",
        radius: 0,
        data: [
          {
            y: 0,
            x: new Date(),
          },
          ...postClaimData,
        ],
      },
    ].filter(Boolean);
  };

  const totalDuration = 2000;
  const delayBetweenPoints = totalDuration / timeseriesData.length;
  const previousY = (ctx: any) =>
    ctx.index === 0
      ? ctx.chart.scales.y.getPixelForValue(100)
      : ctx.chart
          .getDatasetMeta(ctx.datasetIndex)
          .data[ctx.index - 1].getProps(["y"], true).y;
  const animation = {
    x: {
      type: "number",
      easing: "linear",
      duration: delayBetweenPoints,
      from: NaN, // the point is initially skipped
      delay(ctx: any) {
        if (ctx.type !== "data" || ctx.xStarted) {
          return 0;
        }
        ctx.xStarted = true;
        return ctx.index * delayBetweenPoints;
      },
    },
    y: {
      type: "number",
      easing: "linear",
      duration: delayBetweenPoints,
      from: previousY,
      delay(ctx: any) {
        if (ctx.type !== "data" || ctx.yStarted) {
          return 0;
        }
        ctx.yStarted = true;
        return ctx.index * delayBetweenPoints;
      },
    },
  };

  chartjs.Chart.defaults.font.family = "Inter";
  const config: ChartJS.ChartConfiguration<"line"> = {
    type: "line",
    data: {
      // @ts-ignore
      datasets: createDatasets(),
    },
    options: {
      // @ts-ignore
      animation,
      interaction: {
        intersect: false,
      },
      plugins: {
        tooltip: {
          enabled: false,
        },
        legend: {
          display: true,
          labels: {
            color: "rgba(255,255,255,0.8)",
            font: {
              size: 12,
            },
          },
        },
      },
      scales: {
        x: {
          type: "timeseries",
          ticks: {
            display: true,
            color: "rgba(255,255,255,0.8)",
          },
        },
        y: {
          // type: 'logarithmic',
          title: {
            text: "Rewards (ROWAN)",
            display: true,
            color: "rgba(255,255,255,0.8)",
          },

          ticks: {
            display: false,
          },
        },
      },
    },
  };
  const ctx = canvasElement.getContext("2d");
  if (!ctx) throw new Error("no canvas context");

  // @ts-ignore
  const c = new chartjs.Chart(ctx, config);
  return c;
}
