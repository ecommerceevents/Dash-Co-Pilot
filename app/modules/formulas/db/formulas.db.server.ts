import { Entity, Formula, FormulaComponent, Prisma, Property } from "@prisma/client";
import { db } from "~/utils/db.server";

export type FormulaWithDetails = Formula & {
  components: FormulaComponent[];
  inProperties: (Property & { entity: Entity })[];
};

export async function getAllFormulas(): Promise<FormulaWithDetails[]> {
  return await db.formula.findMany({
    include: {
      components: { orderBy: { order: "asc" } },
      inProperties: { include: { entity: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAllFormulasIdsAndNames(): Promise<{ id: string; name: string }[]> {
  return await db.formula.findMany({
    select: { id: true, name: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAllFormulasInIds(ids: string[]): Promise<FormulaWithDetails[]> {
  return await db.formula.findMany({
    where: { id: { in: ids } },
    include: {
      components: { orderBy: { order: "asc" } },
      inProperties: { include: { entity: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getFormula(id: string): Promise<FormulaWithDetails | null> {
  return await db.formula.findUnique({
    where: { id },
    include: {
      components: { orderBy: { order: "asc" } },
      inProperties: { include: { entity: true } },
    },
  });
}

export async function getFormulaWithLogs(id: string): Promise<FormulaWithDetails | null> {
  return await db.formula.findUnique({
    where: { id },
    include: {
      components: { orderBy: { order: "asc" } },
      inProperties: { include: { entity: true } },
    },
  });
}

export type CreateFormulaDto = {
  name: string;
  description: string | null;
  resultAs: string;
  calculationTrigger: string;
  withLogs: boolean;
  components: {
    order: number;
    type: string;
    value: string;
  }[];
}
export async function createFormula(data: CreateFormulaDto): Promise<Formula> {
  return await db.formula.create({
    data: {
      name: data.name,
      description: data.description,
      resultAs: data.resultAs,
      calculationTrigger: data.calculationTrigger,
      withLogs: data.withLogs,
      components: {
        create: data.components.map((component) => ({
          order: component.order,
          type: component.type,
          value: component.value,
        })),
      },
    },
  });
}

export async function updateFormula(
  id: string,
  data: {
    name?: string;
    description?: string | null;
    resultAs?: string;
    calculationTrigger?: string;
    withLogs?: boolean;
    components?: {
      order: number;
      type: string;
      value: string;
    }[];
  }
): Promise<Formula> {
  const update: Prisma.FormulaUpdateInput = {
    name: data.name,
    description: data.description,
    resultAs: data.resultAs,
    calculationTrigger: data.calculationTrigger,
    withLogs: data.withLogs,
  };
  if (data.components) {
    update.components = {
      deleteMany: {},
      create: data.components,
    };
  }
  return await db.formula.update({
    where: { id },
    data: update,
  });
}

export async function deleteFormula(id: string): Promise<Formula> {
  return await db.formula.delete({ where: { id } });
}
