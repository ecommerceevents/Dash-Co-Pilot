import DateUtils from "../shared/DateUtils";

export const PeriodFilters = [
  { value: "all-time", name: "app.shared.periods.ALL_TIME" },
  { value: "last-year", name: "app.shared.periods.LAST_YEAR" },
  { value: "last-3-months", name: "app.shared.periods.LAST_3_MONTHS" },
  { value: "last-30-days", name: "app.shared.periods.LAST_30_DAYS" },
  { value: "last-7-days", name: "app.shared.periods.LAST_7_DAYS" },
  { value: "last-24-hours", name: "app.shared.periods.LAST_24_HOURS" },
  { value: "year-to-date", name: "app.shared.periods.YEAR_TO_DATE" },
  { value: "month-to-date", name: "app.shared.periods.MONTH_TO_DATE" },
  { value: "week-to-date", name: "app.shared.periods.WEEK_TO_DATE" },
  { value: "last-hour", name: "app.shared.periods.LAST_HOUR" },
  { value: "last-10-minutes", name: "app.shared.periods.LAST_10_MINUTES" },
] as const;
export type PeriodFilter = (typeof PeriodFilters)[number]["value"];
export const defaultPeriodFilter = "last-30-days";

function getPeriodFromRequest({ request }: { request: Request }): PeriodFilter {
  const searchParams = new URL(request.url).searchParams;
  const period = searchParams.get("period") || defaultPeriodFilter;
  const found = PeriodFilters.find((p) => p.value === period);
  if (found) {
    return found.value;
  }
  return defaultPeriodFilter;
}

function getGreaterThanOrEqualsFromRequest({ request }: { request: Request }) {
  const searchParams = new URL(request.url).searchParams;
  const countFilter = searchParams.get("period") ?? defaultPeriodFilter;
  if (countFilter === "all-time") {
    return undefined;
  } else if (countFilter === "last-year") {
    return DateUtils.daysFromDate(new Date(), 365 * -1);
  } else if (countFilter === "last-3-months") {
    return DateUtils.daysFromDate(new Date(), 90 * -1);
  } else if (countFilter === "last-30-days") {
    return DateUtils.daysFromDate(new Date(), 30 * -1);
  } else if (countFilter === "last-7-days") {
    return DateUtils.daysFromDate(new Date(), 7 * -1);
  } else if (countFilter === "last-24-hours") {
    return DateUtils.daysFromDate(new Date(), 1 * -1);
  } else if (countFilter === "last-hour") {
    return minutesFromDate(new Date(), 60 * -1);
  } else if (countFilter === "last-10-minutes") {
    return minutesFromDate(new Date(), 10 * -1);
  } else if (countFilter === "year-to-date") {
    return new Date(new Date().getFullYear(), 0, 1);
  } else if (countFilter === "month-to-date") {
    return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  } else if (countFilter === "week-to-date") {
    return weekStartDate(new Date());
  }
  return undefined;
}

function minutesFromDate(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60000);
}

function weekStartDate(date: Date) {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
}

function getCreatedAtFilter({ request }: { request: Request }) {
  const searchParams = new URL(request.url).searchParams;
  let period = searchParams.get("period");
  if (!period) {
    period = defaultPeriodFilter;
  }
  // console.log("getCreatedAtFilter", period);
  return getCreatedAt(period as PeriodFilter);
}

function getCreatedAt(period: PeriodFilter) {
  let createdAt: { gte?: Date; lte?: Date } = {};
  switch (period) {
    case "all-time":
      break;
    case "last-year":
      createdAt.gte = DateUtils.daysFromDate(new Date(), 365 * -1);
      break;
    case "last-3-months":
      createdAt.gte = DateUtils.daysFromDate(new Date(), 90 * -1);
      break;
    case "last-30-days":
      createdAt.gte = DateUtils.daysFromDate(new Date(), 30 * -1);
      break;
    case "last-7-days":
      createdAt.gte = DateUtils.daysFromDate(new Date(), 7 * -1);
      break;
    case "last-24-hours":
      createdAt.gte = DateUtils.daysFromDate(new Date(), 1 * -1);
      break;
    case "year-to-date":
      const date = new Date();
      const year = date.getFullYear();
      createdAt.gte = new Date(year, 0, 1);
      break;
    case "month-to-date":
      createdAt.gte = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      break;
    case "week-to-date":
      createdAt.gte = weekStartDate(new Date());
      break;
    case "last-hour":
      createdAt.gte = minutesFromDate(new Date(), 60 * -1);
      break;
    case "last-10-minutes":
      createdAt.gte = minutesFromDate(new Date(), 10 * -1);
      break;

    default:
      // eslint-disable-next-line no-console
      console.log("getCreatedAt: filter not found", period);
      break;
  }

  return createdAt;
}

export default {
  getPeriodFromRequest,
  getGreaterThanOrEqualsFromRequest,
  getCreatedAtFilter,
  getCreatedAt,
};
