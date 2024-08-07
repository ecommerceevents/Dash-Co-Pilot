import { Property, Row } from "@prisma/client";
import { TFunction } from "i18next";
import { Params } from "react-router";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { PropertyType } from "~/application/enums/entities/PropertyType";
import { FilterDto } from "~/components/ui/input/InputFilters";
import { EntitiesApi } from "../api/.server/EntitiesApi";
import { EntityWithDetails } from "../db/entities/entities.db.server";
import RowFiltersHelper from "./RowFiltersHelper";
import RowHelper from "./RowHelper";
import { AppOrAdminData } from "../data/useAppOrAdminData";
import { EntitiesTemplateDto, TemplateEntityDto, TemplateEntityViewDto } from "~/modules/templates/EntityTemplateDto";
import { EntityRelationshipWithDetails } from "../db/entities/entityRelationships.db.server";
import EntityViewHelper from "./EntityViewHelper";
import { mapToEntityTemplateType } from "./PropertyHelper";
import Constants from "~/application/Constants";

// const getEntityFromParams = async (params: Params) => {
//   return await getEntityBySlug(params.entity ?? "");
// };

const getFieldTitle = (field: Property, _ = false): string => {
  switch (field.type) {
    // case PropertyType.USER:
    // case PropertyType.ROLE:
    // case PropertyType.ID:
    //   if (isDefault) {
    //     return "entities.defaultFields." + PropertyType[field.type];
    //   } else {
    //     return "entities.fields." + PropertyType[field.type];
    //   }
    default:
      return field.title;
  }
};

function getFilters({ t, entity, pagination }: { t: TFunction; entity: EntityWithDetails; pagination?: PaginationDto }) {
  const filters: FilterDto[] = [
    ...entity.properties
      .filter((f) => RowFiltersHelper.isPropertyFilterable(f))
      .map((item) => {
        const filter: FilterDto = {
          name: item.name,
          title: t(item.title),
          options: item.options?.map((option) => {
            return {
              color: option.color,
              name: option.name ?? option.value,
              value: option.value,
            };
          }),
          isBoolean: item.type === PropertyType.BOOLEAN,
          hideSearch: item.type === PropertyType.BOOLEAN,
        };
        return filter;
      }),
  ];
  if (entity.tags.length > 0) {
    filters.push({
      name: "tag",
      title: t("models.tag.plural"),
      options: entity.tags.map((tag) => {
        return {
          color: tag.color,
          name: tag.value,
          value: tag.value,
        };
      }),
    });
  }
  // if (pagination) {
  //   filters.push({
  //     hideSearch: true,
  //     name: "pageSize",
  //     title: t("shared.pageSize"),
  //     options: [
  //       { name: "5", value: "5" },
  //       { name: "10", value: "10" },
  //       { name: "25", value: "25" },
  //       { name: "50", value: "50" },
  //       { name: "100", value: "100" },
  //     ],
  //   });
  // }
  return filters;
}

function getRoutes({
  routes,
  entity,
  item,
}: {
  routes?: EntitiesApi.Routes;
  entity: { slug: string; onEdit: string | null };
  item?: Row;
}): EntitiesApi.Routes | undefined {
  if (!routes) {
    return undefined;
  }
  const entityRoutes: EntitiesApi.Routes = {
    list: routes.list?.split(":entity").join(entity.slug),
    new: routes.new?.split(":entity").join(entity.slug),
    overview: routes.overview
      ?.split(":entity")
      .join(entity.slug)
      .replace(":id", item?.id ?? ""),
    edit: routes.edit
      ?.split(":entity")
      .join(entity.slug)
      .replace(":id", item?.id ?? ""),
    import: routes.import?.split(":entity").join(entity.slug),
    export: routes.export?.split(":entity").join(entity.slug),
    publicUrl: routes.publicUrl
      ?.split(":entity")
      .join(entity.slug)
      .replace(":id", item?.id ?? ""),
    group: routes.group?.split(":entity").join(entity.slug),
  };
  if (entity.onEdit === "overviewRoute") {
    entityRoutes.edit = entityRoutes.overview + "?editing";
  } else if (entity.onEdit === "overviewAlwaysEditable") {
    entityRoutes.edit = entityRoutes.overview + "?editing";
  }
  return entityRoutes;
}

// function getAdminNoCodeRoutes(): EntitiesApi.Routes {
//   const routes: EntitiesApi.Routes = {
//     list: `/admin/entities/:entity/no-code/:entity`,
//     new: `/admin/entities/:entity/no-code/:entity/new`,
//     overview: `/admin/entities/:entity/no-code/:entity/:id`,
//     edit: `/admin/entities/:entity/no-code/:entity/:id/edit`,
//     import: `/admin/entities/:entity/no-code/:entity/import`,
//     publicUrl: getBaseURL(request) + `/public/:entity/:id`,
//   };
//   return routes;
// }

// function getTenantNoCodeRoutes(tenant: string): EntitiesApi.Routes {
//   const routes: EntitiesApi.Routes = {
//     list: `/app/${tenant}/:entity`,
//     new: `/app/${tenant}/:entity/new`,
//     overview: `/app/${tenant}/:entity/:id`,
//     edit: `/app/${tenant}/:entity/:id/edit`,
//     import: `/app/${tenant}/:entity/import`,
//     publicUrl: getBaseURL(request) + `/public/:entity/:id`,
//   };
//   return routes;
// }

function getLayoutBreadcrumbsMenu({
  type,
  t,
  entity,
  routes,
  item,
  params,
  appOrAdminData,
}: {
  type: "edit" | "new" | "overview";
  t: TFunction;
  entity: EntityWithDetails;
  routes: EntitiesApi.Routes;
  item: Row | undefined;
  params: Params;
  appOrAdminData: AppOrAdminData;
}) {
  let menu: { title: string; routePath?: string }[] = [];
  if (params.group) {
    const group = appOrAdminData.entityGroups.find((f) => f.slug === params.group);
    if (group) {
      menu.push({
        title: group.title,
        routePath: params.tenant ? `/app/${params.tenant}/g/${params.group}` : `/admin/g/${params.group}`,
      });
    }
  }
  if (type === "edit") {
    menu = [
      ...menu,
      { title: t(entity.titlePlural), routePath: getRoutes({ routes, entity: entity })?.list },
      {
        title: RowHelper.getRowFolio(entity, item!),
        routePath: getRoutes({ routes, entity: entity, item: item })?.overview,
      },
      {
        title: t("shared.edit"),
        routePath: getRoutes({ routes, entity: entity, item: item })?.edit,
      },
    ];
  } else if (type === "new") {
    menu = [
      ...menu,
      {
        title: t(entity.titlePlural),
        routePath: getRoutes({ routes, entity })?.list,
      },
      {
        title: t("shared.new"),
        routePath: getRoutes({ routes, entity })?.new,
      },
    ];
  } else if (type === "overview") {
    menu = [
      ...menu,
      {
        title: t(entity.titlePlural),
        routePath: getRoutes({ routes, entity: entity, item: item })?.list,
      },
      {
        title: RowHelper.getRowFolio(entity, item!),
        routePath: getRoutes({ routes, entity: entity, item: item })?.overview,
      },
      { title: t("shared.overview") },
    ];
  }
  return menu;
}

function getEntityRoute({ entity, params, appOrAdminData }: { entity: EntityWithDetails; params: Params; appOrAdminData: AppOrAdminData }) {
  const entityInGroup = appOrAdminData.entityGroups.find((f) => f.entities.find((e) => e.entityId === entity.id));
  if (entityInGroup) {
    if (params.tenant) {
      return `/app/${params.tenant}/g/${entityInGroup.slug}/${entity.slug}`;
    } else {
      return `/admin/g/${entityInGroup.slug}/${entity.slug}`;
    }
  }
  if (params.portal) {
    if (params.tenant) {
      return `/app/${params.tenant}/portals/${params.portal}/${entity.slug}/rows`;
    } else {
      return `/admin/portals/${params.portal}/${entity.slug}/rows`;
    }
  }
  if (params.tenant) {
    return `/app/${params.tenant}/${entity.slug}`;
  } else {
    return `/admin/entities/${entity.slug}/no-code/${entity.slug}`;
  }
}

function exportEntitiesToTemplate(entities: EntityWithDetails[], relationships: EntityRelationshipWithDetails[]) {
  const templateEntities: EntitiesTemplateDto = {
    entities: [],
    relationships: [],
  };

  entities.forEach((entity) => {
    const exportedEntity: TemplateEntityDto = {
      type: entity.type,
      name: entity.name,
      slug: entity.slug,
      title: entity.title,
      titlePlural: entity.titlePlural,
      prefix: entity.prefix,
      properties: entity.properties
        .filter((f) => !f.isDefault)
        .map((property) => {
          return {
            name: property.name,
            title: property.title,
            type: mapToEntityTemplateType(property.type),
            subtype: property.subtype,
            isRequired: property.isRequired ?? undefined,
            isDisplay: property.isDisplay ?? undefined,
            isReadOnly: property.isReadOnly ?? undefined,
            showInCreate: property.showInCreate ?? undefined,
            attributes:
              property.attributes.filter((f) => f.value).length === 0
                ? undefined
                : property.attributes
                    .filter((f) => f.value)
                    .map((attr) => {
                      return {
                        name: attr.name,
                        value: attr.value,
                      };
                    }),
            options:
              property.options.length === 0
                ? undefined
                : property.options?.map((option) => {
                    return {
                      value: option.value,
                      name: option.name ?? undefined,
                      color: option.color ?? undefined,
                    };
                  }),
            tenantId: property.tenantId ?? undefined,
          };
        }),
      isAutogenerated: entity.isAutogenerated ? true : false,
      hasApi: entity.hasApi ? true : false,
      icon: entity.icon.length > 0 ? entity.icon : undefined,
      active: entity.active ? true : false,
      hasTags: entity.hasTags ? true : false,
      hasComments: entity.hasComments ? true : false,
      hasTasks: entity.hasTasks ? true : false,
      defaultVisibility: entity.defaultVisibility === "private" ? undefined : entity.defaultVisibility,
      onCreated: entity.onCreated ?? "redirectToOverview",
      onEdit: entity.onEdit ?? "editRoute",
    };
    if (entity.views.length > 0) {
      exportedEntity.views = entity.views
        .sort((a, b) => a.order - b.order)
        .map((view) => {
          const exportedView: TemplateEntityViewDto = {
            layout: view.layout === "table" ? "table" : "board",
            name: view.name,
            title: view.title,
            properties:
              view.properties
                .sort((a, b) => a.order - b.order)
                .map((prop) => {
                  // const property = entity.properties.find((f) => f.name === prop.name);
                  return prop.name ?? "";
                }) ?? undefined,
            filters: view.filters.map((filter) => {
              return {
                match: filter.match === "and" ? "and" : "or",
                name: filter.name,
                condition: EntityViewHelper.getCondition(filter.condition),
                value: filter.value,
              };
            }),
            sort: view.sort.map((sort) => {
              return {
                name: sort.name,
                asc: sort.asc,
              };
            }),
            isDefault: view.isDefault ?? undefined,
            isSystem: view.isSystem ?? undefined,
            tenantId: view.tenantId ?? undefined,
            userId: view.userId ?? undefined,
            pageSize: view.pageSize !== Constants.DEFAULT_PAGE_SIZE ? view.pageSize : undefined,
            order: view.order ?? undefined,
            groupByProperty: view.groupByProperty?.name ?? undefined,
          };
          return exportedView;
        });
    }
    templateEntities.entities.push(exportedEntity);
  });

  relationships.forEach((relationship) => {
    const parentExists = entities.find((f) => f.name === relationship.parent.name);
    const childExists = entities.find((f) => f.name === relationship.child.name);
    if (!parentExists || !childExists) {
      return;
    }
    templateEntities.relationships.push({
      parent: relationship.parent.name,
      child: relationship.child.name,
      order: relationship.order ?? 0,
      title: relationship.title ?? null,
      type: relationship.type ?? "one-to-many",
      required: relationship.required ?? false,
      cascade: relationship.cascade ?? false,
      readOnly: relationship.readOnly ?? false,
      hiddenIfEmpty: relationship.hiddenIfEmpty ?? false,
    });
  });

  return templateEntities;
}

export default {
  // getEntityFromParams,
  getFieldTitle,
  getFilters,
  getRoutes,
  getLayoutBreadcrumbsMenu,
  getEntityRoute,
  // getAdminNoCodeRoutes,
  // getTenantNoCodeRoutes,
  exportEntitiesToTemplate,
};
