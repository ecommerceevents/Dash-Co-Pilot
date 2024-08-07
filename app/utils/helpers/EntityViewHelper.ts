import { EntityView } from "@prisma/client";
import { ViewFilterCondition } from "~/application/enums/entities/ViewFilterCondition";
import { GridLayoutDto } from "~/application/dtos/layout/GridLayoutDto";

function getCondition(condition: string) {
  switch (condition) {
    case "equals":
      return ViewFilterCondition.equals;
    case "contains":
      return ViewFilterCondition.contains;
    case "lt":
      return ViewFilterCondition.lt;
    case "lte":
      return ViewFilterCondition.lte;
    case "gt":
      return ViewFilterCondition.gt;
    case "gte":
      return ViewFilterCondition.gte;
    case "startsWith":
      return ViewFilterCondition.startsWith;
    case "endsWith":
      return ViewFilterCondition.endsWith;
    case "in":
      return ViewFilterCondition.in;
    case "notIn":
      return ViewFilterCondition.notIn;
    default:
      return ViewFilterCondition.equals;
  }
}

function getGridLayout(view: EntityView | null): GridLayoutDto {
  const layout: GridLayoutDto = {
    columns: view?.gridColumns ?? 5,
    sm: view?.gridColumnsSm ?? 2,
    md: view?.gridColumnsMd ?? 3,
    lg: view?.gridColumnsLg ?? 4,
    xl: view?.gridColumnsXl ?? 5,
    xl2: view?.gridColumns2xl ?? 6,
    gap: (view?.gridGap ?? "sm") as "xs" | "sm" | "md" | "lg" | "xl",
  };
  return layout;
}

function getType(view: EntityView): "default" | "tenant" | "user" | "system" {
  if (view.isSystem) {
    return "system";
  } else if (view.tenantId && !view.userId) {
    return "tenant";
  } else if (view.tenantId && view.userId) {
    return "user";
  } else if (!view.tenantId && !view.userId) {
    return "default";
  }
  return "default";
}

export default {
  getCondition,
  getGridLayout,
  getType,
};
