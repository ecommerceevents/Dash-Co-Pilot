import { FormulaComponentLog, FormulaLog, Prisma } from "@prisma/client";
import { FiltersDto } from "~/application/dtos/data/FiltersDto";
import { db } from "~/utils/db.server";

export type FormulaLogWithDetails = FormulaLog & {
  formula: { id: string; name: string };
  user: { id: string; email: string } | null;
  tenant: { id: string; name: string } | null;
  components: FormulaComponentLog[];
};
export async function getFormulaLogs({
  id,
  pagination,
  filters,
}: {
  id: string | undefined;
  pagination: { pageSize: number; page: number };
  filters: FiltersDto;
}): Promise<{ items: FormulaLogWithDetails[]; total: number }> {
  let where: Prisma.FormulaLogWhereInput = {
    formulaId: id,
  };
  const statusFilter = filters.properties.find((filter) => filter.name === "status")?.value;
  if (statusFilter) {
    if (statusFilter === "success") {
      where = { ...where, error: null, result: { not: "" } };
    } else if (statusFilter === "error") {
      where = { ...where, error: { not: null } };
    } else if (statusFilter === "empty") {
      where = { ...where, result: "", error: null };
    }
  }
  const hasRowIdFilter = filters.properties.find((filter) => filter.name === "hasRowId")?.value;
  if (hasRowIdFilter) {
    where = { ...where, components: { some: { rowId: hasRowIdFilter } } };
  }
  filters.properties
    .filter((f) => !f.manual && f.value)
    .forEach((filter) => {
      where = { ...where, [filter.name]: filter.value };
    });
  const items = await db.formulaLog.findMany({
    take: pagination.pageSize,
    skip: pagination.pageSize * (pagination.page - 1),
    where,
    include: {
      formula: { select: { id: true, name: true } },
      user: { select: { id: true, email: true } },
      tenant: { select: { id: true, name: true } },
      components: true,
    },
    orderBy: { createdAt: "desc" },
  });
  const total = await db.formulaLog.count({ where });
  return {
    items,
    total,
  };
}

export async function countLogs(ids: string[]): Promise<{ formulaId: string; count: number }[]> {
  return (
    await db.formulaLog.groupBy({
      by: ["formulaId"],
      where: { formulaId: { in: ids } },
      _count: { formulaId: true },
    })
  ).map((item) => ({ formulaId: item.formulaId, count: item._count.formulaId }));
}

export async function createFormulaLog(data: {
  formulaId: string;
  userId: string | null;
  tenantId: string | null;
  originalTrigger: string;
  triggeredBy: string;
  expresion: string;
  result: string;
  error: string | null;
  rowValueId: string | null;
  components: {
    order: number;
    type: string;
    value: string;
    rowId: string | null;
  }[];
}) {
  return await db.formulaLog.create({
    data: {
      formulaId: data.formulaId,
      userId: data.userId,
      tenantId: data.tenantId,
      originalTrigger: data.originalTrigger,
      triggeredBy: data.triggeredBy,
      expression: data.expresion,
      duration: 0,
      result: data.result,
      error: data.error,
      rowValueId: data.rowValueId,
      components: {
        create: data.components.map((component) => ({
          order: component.order,
          type: component.type,
          value: component.value,
          rowId: component.rowId,
        })),
      },
    },
  });
}

export async function updateFormulaLog(
  id: string,
  data: {
    duration: number;
    result: string;
    error: string | null;
  }
) {
  return await db.formulaLog.update({
    where: { id },
    data: {
      result: data.result,
      error: data.error,
    },
  });
}
