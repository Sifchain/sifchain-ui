import { defineComponent, effect, onMounted, onUnmounted, ref } from "vue";
import { isTimestampWithinRewardsTime, timestampToDate } from "./utils";
import { Chart, _adapters, registerables, ChartTypeRegistry } from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useCore } from "@/hooks/useCore";
import { accountStore } from "@/store/modules/accounts";
import { CryptoeconomicsTimeseriesItem } from "@sifchain/sdk/src/services/CryptoeconomicsService/CryptoeconomicsService";
import { registerChartDateAdapter } from "./registerChartDateAdapter";

Chart.register(...registerables, zoomPlugin);
registerChartDateAdapter(_adapters);

export const RewardsChart = defineComponent({
  name: "RewardsChart",
  props: {},
  setup() {
    const data = useAsyncData(() => {
      return useCore().services.cryptoeconomics.fetchTimeseriesData({
        address: accountStore.state.sifchain.address,
      });
    });

    const chartRef = ref<Chart<"line">>();
    const containerRef = ref();
    const canvasRef = ref();

    effect(() => {
      if (!data.data.value) return;
      if (!canvasRef.value) return;
      if (chartRef.value) return;
      w.value = containerRef.value.offsetWidth;
      // @ts-ignore
      chartRef.value = renderChart(canvasRef.value, data.data.value);
    });
    onUnmounted(() => {
      chartRef.value?.destroy();
    });

    const w = ref(300);

    return () => (
      <div ref={containerRef} class="w-full">
        <canvas
          onClick={() => chartRef.value?.resetZoom()}
          ref={canvasRef}
          id="myChart"
          width={w.value}
        />
      </div>
    );
  },
});

function renderChart(
  canvasElement: HTMLCanvasElement,
  data: CryptoeconomicsTimeseriesItem[],
) {
  const createDatasets = () => {
    const nowIndex =
      data.findIndex((current, index) => {
        return timestampToDate(current.timestamp) > new Date();
      }) - 1;
    const nowItem = data[nowIndex];

    const postClaimData: CryptoeconomicsTimeseriesItem[] = [];
    if (nowItem) {
      postClaimData.push(
        ...data.map((item) => {
          return { ...item, timestamp: item.timestamp + nowItem.timestamp };
        }),
      );
    }

    return [
      {
        tickColor: "#C1A04F",
        borderColor: "#D4B553",
        borderWidth: 2,
        radius: 0,
        backgroundColor: "rgba(212, 181, 83, .2)",
        fill: true,
        data: data
          .filter((item) => isTimestampWithinRewardsTime(item.timestamp))
          .map((d, index) => {
            return {
              y: d.userClaimableReward,
              x: timestampToDate(d.timestamp),
            };
          }),
      },
      !!nowItem && {
        tickColor: "#FF4F4F",
        borderColor: "#FF4F4F",
        borderWidth: 2,
        radius: 0,
        backgroundColor: "rgba(255, 79, 79, .2)",
        fill: false,
        data: postClaimData
          .filter((item) => isTimestampWithinRewardsTime(item.timestamp))
          .map((d, index) => {
            return {
              y: d.userClaimableReward,
              x: timestampToDate(d.timestamp),
            };
          }),
      },
      // {
      //   borderColor: Utils.CHART_COLORS.blue,
      //   borderWidth: 1,
      //   radius: 0,
      //   data: data2,
      // },
    ].filter(Boolean);
  };

  const totalDuration = 2000;
  const delayBetweenPoints = totalDuration / data.length;
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

  const config = {
    type: "line" as keyof ChartTypeRegistry,
    data: {
      datasets: createDatasets(),
    },
    options: {
      // animation: false,
      animation,
      interaction: {
        intersect: false,
      },
      plugins: {
        legend: {
          display: true,
          labels: {},
        },
        zoom: {
          zoom: {
            wheel: {
              enabled: false,
            },
            pinch: {
              enabled: true,
            },
            mode: "x",
          },
        },
      },
      scales: {
        x: {
          type: "time",
          ticks: {
            color: "rgba(255,255,255,0.9)",
          },
        },
        y: {
          title: {
            text: "Rewards (ROWAN)",
            display: true,
            color: "white",
            fontColor: "white",
            textStrokeColor: "white",
          },

          ticks: {
            color: "rgba(255,255,255,0.9)",
          },
        },
      },
    },
  };
  const ctx = canvasElement.getContext("2d");
  if (!ctx) throw new Error("no canvas context");

  // @ts-ignore
  const c = new Chart(ctx, config);
  return c;
}
