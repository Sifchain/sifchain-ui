import type Moment from "moment";
import type * as ChartJS from "chart.js";

type WindowWithDeps = typeof window & {
  moment: typeof Moment;
  Chart: typeof ChartJS;
};

const loadScript = (src: string) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src = src;

    script.onload = resolve;
    script.onerror = reject;

    document.head.appendChild(script);
  });
};

export const loadAllChartDeps = async () => {
  const [moment, chartjs] = await Promise.all([loadMoment(), loadChartjs()]);

  registerChartDateAdapter(chartjs._adapters, moment);

  return { moment, chartjs };
};

export const loadMoment = async () => {
  await loadScript("https://unpkg.com/moment@2.29.1/moment.js");
  return (window as WindowWithDeps).moment;
};

export const loadChartjs = async () => {
  await loadScript("https://unpkg.com/chart.js@3.5.1/dist/chart.min.js");
  return (window as WindowWithDeps).Chart;
};

const registerChartDateAdapter = (
  _adapters: typeof ChartJS._adapters,
  moment: typeof Moment,
) => {
  const FORMATS = {
    datetime: "MMM D, YYYY, h:mm:ss a",
    millisecond: "h:mm:ss.SSS a",
    second: "h:mm:ss a",
    minute: "h:mm a",
    hour: "hA",
    day: "MMM D",
    week: "ll",
    month: "MMM YYYY",
    quarter: "[Q]Q - YYYY",
    year: "YYYY",
  };
  _adapters._date.override({
    formats: function () {
      return FORMATS;
    },

    parse: function (value, format) {
      if (typeof value === "string" && typeof format === "string") {
        value = moment(value, format);
      } else if (!(value instanceof moment)) {
        value = moment(value);
      }
      return value.isValid() ? value.valueOf() : null;
    },

    format: function (time, format) {
      return moment(time).format(format);
    },

    add: function (time, amount, unit) {
      return moment(time).add(amount, unit).valueOf();
    },

    diff: function (max, min, unit) {
      return moment(max).diff(moment(min), unit);
    },

    startOf: function (time, unit, weekday) {
      time = moment(time);
      if (unit === "isoWeek") {
        weekday = Math.trunc(Math.min(Math.max(0, weekday), 6));
        return time.isoWeekday(weekday).startOf("day").valueOf();
      }
      return time.startOf(unit).valueOf();
    },

    endOf: function (time, unit) {
      return moment(time).endOf(unit).valueOf();
    },
  });
};
