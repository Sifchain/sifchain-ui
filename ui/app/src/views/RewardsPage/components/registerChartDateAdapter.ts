import { DateAdapter, TimeUnit } from "chart.js";
import moment from "moment";

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

export const registerChartDateAdapter = (_adapters: { _date: DateAdapter }) => {
  _adapters._date.override(
    typeof moment === "function"
      ? {
          // _id: 'moment', // DEBUG ONLY

          formats: function () {
            return FORMATS;
          },

          parse: function (value: unknown, format?: TimeUnit) {
            if (typeof value === "string" && typeof format === "string") {
              value = moment(value, format);
            } else if (!(value instanceof moment)) {
              value = moment(value as moment.MomentInput);
            }
            // @ts-ignore
            return value?.isValid?.() ? value?.valueOf?.() : null;
          },

          format: function (time: number, format: TimeUnit) {
            return moment(time).format(format);
          },

          add: function (time: number, amount: number, unit: TimeUnit) {
            return moment(time).add(amount, unit).valueOf();
          },

          diff: function (max: number, min: number, unit: TimeUnit) {
            return moment(max).diff(moment(min), unit);
          },

          startOf: function (
            time: number,
            unit: TimeUnit | "isoWeek",
            weekday?: number,
          ) {
            const m = moment(time);
            if (unit === "isoWeek" && weekday != null) {
              weekday = Math.trunc(Math.min(Math.max(0, weekday), 6));
              return m.isoWeekday(weekday).startOf("day").valueOf();
            }
            return m.startOf(unit).valueOf();
          },

          endOf: function (time: number, unit: TimeUnit | "isoWeek") {
            return moment(time).endOf(unit).valueOf();
          },
        }
      : {},
  );
};
