import { Property } from "@prisma/client";
import { RowFiltersDto } from "~/application/dtos/data/RowFiltersDto";
import { SortedByDto } from "~/application/dtos/data/SortedByDto";
import { EntityWithDetails } from "../db/entities/entities.db.server";
import { FiltersDto } from "~/application/dtos/data/FiltersDto";
import { FilterablePropertyDto } from "~/application/dtos/data/FilterablePropertyDto";
import Constants from "~/application/Constants";
import { EntityViewWithDetails } from "../db/entities/entityViews.db.server";
import { EntityRelationshipWithDetails } from "../db/entities/entityRelationships.db.server";

export function getPaginationFromCurrentUrl(
  urlSearchParams: URLSearchParams,
  entity?: EntityWithDetails,
  entityView?: EntityViewWithDetails | null
): { page: number; pageSize: number; sortedBy: SortedByDto[]; query: string } {
  return {
    page: getPageFromCurrentUrl(urlSearchParams),
    pageSize: getPageSizeFromCurrentUrl(urlSearchParams),
    sortedBy: getSortByFromCurrentUrl(urlSearchParams, entity, entityView),
    query: getSearchQueryFromCurrentUrl(urlSearchParams),
  };
}

export function getFiltersFromCurrentUrl(request: Request, properties: FilterablePropertyDto[]): FiltersDto {
  const url = new URL(request.url);
  properties.forEach((property) => {
    const params = url.searchParams.get(property.name);
    property.value = params ?? null;
    if (property.isNumber && property.value) {
      if (isNaN(Number(property.value))) {
        property.value = null;
      }
    }
  });

  const query = url.searchParams.get("q") ?? undefined;

  return { query, properties };
}

export function getEntityFiltersFromCurrentUrl(
  customRow: boolean,
  entity: EntityWithDetails,
  urlSearchParams: URLSearchParams,
  entityView?: EntityViewWithDetails | null | null
): RowFiltersDto {
  const tags: string[] = [];
  const properties: {
    property?: Property;
    name?: string;
    value: string | string[] | null;
    condition?: string;
    match?: "and" | "or";
    parentEntity?: EntityRelationshipWithDetails;
  }[] = [];
  entity.properties.forEach((property) => {
    if (urlSearchParams.getAll(property.name).length > 1) {
      properties.push({ property, value: urlSearchParams.getAll(property.name) });
    } else {
      const param = urlSearchParams.get(property.name);
      properties.push({ property, value: param ?? null });
    }
  });

  entityView?.filters.forEach((filter) => {
    const property = entity.properties.find((f) => f.name === filter.name);
    const match = filter.match === "or" ? "or" : "and";
    if (property) {
      properties.push({ property, value: filter.value ?? null, condition: filter.condition, match });
    } else {
      properties.push({ name: filter.name, value: filter.value ?? null, condition: filter.condition, match });
    }
  });

  urlSearchParams.getAll("tag").forEach((tag) => {
    tags.push(tag);
  });

  entity.parentEntities.forEach((parentRel) => {
    const id = urlSearchParams.get(`${parentRel.parent.name}_id`);
    if (id) {
      properties.push({
        name: `${parentRel.parent.name}_id`,
        value: id,
        parentEntity: parentRel,
      });
    }
  });

  const query = urlSearchParams.get("q");

  // console.log({ tags });
  return { customRow, entity, properties, query, tags };
}

function getPageFromCurrentUrl(urlSearchParams: URLSearchParams): number {
  let page = 1;
  const paramsPage = urlSearchParams.get("page");
  if (paramsPage) {
    page = Number(paramsPage);
  }
  if (page <= 0) {
    page = 1;
  }
  return page;
}

function getPageSizeFromCurrentUrl(urlSearchParams: URLSearchParams): number {
  let pageSize = Constants.DEFAULT_PAGE_SIZE;
  const paramsPageSize = urlSearchParams.get("pageSize");
  if (paramsPageSize) {
    pageSize = Number(paramsPageSize);
  }
  if (pageSize > Constants.MAX_PAGE_SIZE) {
    pageSize = Constants.MAX_PAGE_SIZE;
  }
  return pageSize;
}

function getSearchQueryFromCurrentUrl(urlSearchParams: URLSearchParams): string {
  return urlSearchParams.get("q")?.toString() ?? "";
}

function getSortByFromCurrentUrl(urlSearchParams: URLSearchParams, entity?: EntityWithDetails, entityView?: EntityViewWithDetails | null): SortedByDto[] {
  let sorts = urlSearchParams.get("sort")?.toString().split(",") ?? [];
  return sorts.map((sort) => {
    let direction: "asc" | "desc" = "asc";
    if (sort) {
      if (sort.startsWith("-")) {
        sort = sort.replace("-", "");
        direction = "desc";
      } else {
        direction = "asc";
      }
    }
    const sortName = sort.replace("-", "").replace("+", "");
    const property = entity?.properties.find((p) => p.name === sortName);
    return { entity, name: sortName, direction, property };
  });
}

export function getNewPaginationUrl(request: Request, page: number, sortedBy?: { name: string; direction: "asc" | "desc" }): string {
  const url = new URL(request.url);
  const params = new URLSearchParams(url.search);

  //Add a second foo parameter.
  if (params.get("page")) {
    params.set("page", page.toString());
  } else {
    params.append("page", page.toString());
  }

  if (sortedBy?.name) {
    const withDirection = (sortedBy.direction === "desc" ? "-" : "") + sortedBy.name;
    if (params.get("sort")) {
      params.set("sort", withDirection);
    } else {
      params.append("sort", withDirection);
    }
  }

  const newUrl = url + "?" + params;
  return newUrl;
}

// export async function getPageFromCurrentUrl(request: Request): PaginationDto {
//   const params = new URL(request.url).searchParams;
//   const pageSize = Constants.DEFAULT_PAGE_SIZE;

//   let page = 1;
//   const paramsPage = params.get("page");
//   if (paramsPage) {
//     page = Number(paramsPage);
//   }

//   // const paramsSort = search.get("sort");
//   // if (!paramsPage) {
//   //   throw redirect(request.url + "?page=1");
//   // }
//   // let orderBy: any = { createdAt: "desc" };
//   // if (paramsSort) {
//   //   const column = paramsSort.replace("-", "").trim();
//   //   if (column === "createdAt" || column === "folio") {
//   //     orderBy = { [column]: paramsSort.startsWith("-") ? "desc" : "asc" };
//   //   }
//   // }
//   const pagination: PaginationDto = {
//     page,
//     pageSize,
//   };
//   return pagination;
// }
