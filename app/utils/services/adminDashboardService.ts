import { Stat } from "~/application/dtos/stats/Stat";
import currencies from "~/application/pricing/currencies";
import { getStatChangeType } from "../app/DashboardUtils";
import { db } from "../db.server";
import NumberUtils from "../shared/NumberUtils";
import { getMrr } from "./.server/subscriptionService";
import { promiseHash } from "../promises/promiseHash";

export async function getAdminDashboardStats({ gte }: { gte: Date | undefined | undefined }): Promise<Stat[]> {
  const { tenantStat, mrrStat, activeUsersStat } = await promiseHash({
    tenantStat: getTenantStat(gte),
    mrrStat: getMMRStat(),
    activeUsersStat: getActiveUsersStat(gte),
  });
  return [tenantStat, mrrStat, activeUsersStat];
}

async function getTenantStat(gte: Date | undefined) {
  const { added, total } = await getTenantsCreatedSince(gte);
  const tenantStat: Stat = {
    name: "Accounts",
    hint: "Total accounts",
    stat: total.toString(),
    previousStat: (total - added).toString(),
    change: "+" + added.toString(),
    changeType: getStatChangeType(added, total),
    path: "/admin/accounts",
  };
  return tenantStat;
}

async function getMMRStat() {
  const defaultCurrency = currencies.find((f) => f.default);
  const currency = defaultCurrency ?? { value: "usd", symbol: "$" };
  const mrr = await getMrr(currency.value);
  const tenantStat: Stat = {
    name: "MRR",
    hint: "Monthly recurring revenue in " + currency.value.toUpperCase(),
    stat: currency.symbol + NumberUtils.decimalFormat(mrr.total),
    previousStat: NumberUtils.intFormat(mrr.count) + " accounts",
  };
  return tenantStat;
}

async function getActiveUsersStat(gte: Date | undefined) {
  const { added, total } = await getLogsCreatedSince(gte);
  const activeUsersStat: Stat = {
    name: "MAU",
    hint: "Monthly active users",
    stat: total.toString(),
    previousStat: (total - added).toString(),
    change: "+" + added.toString(),
    changeType: getStatChangeType(added, total),
  };
  return activeUsersStat;
}

async function getLogsCreatedSince(gte: Date | undefined) {
  const added = await db.log.groupBy({
    by: ["userId"],
    where: {
      createdAt: {
        gte,
      },
    },
  });
  const total = await db.log.groupBy({
    by: ["userId"],
  });

  return {
    added: added.length,
    total: total.length,
  };
}

async function getTenantsCreatedSince(gte: Date | undefined) {
  const added = await db.tenant.count({
    where: {
      createdAt: {
        gte,
      },
    },
  });
  const total = await db.tenant.count();

  return {
    added,
    total,
  };
}
